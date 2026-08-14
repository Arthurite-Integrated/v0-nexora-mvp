import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Clock, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import type { Metadata } from "next"
import { client, blogPostsQuery, categoriesQuery, urlFor } from "@/lib/sanity"
import { NewsletterWidget } from "@/components/newsletter-widget"
import { BackButton } from "@/components/back-button"

export const metadata: Metadata = {
  title: "IDD Care Blog",
  description:
    "Evidence-based articles, practical guides, and expert insights on Intellectual and Developmental Disability care in Nigeria.",
  alternates: { canonical: "/resources/blog" },
  openGraph: {
    title: "IDD Care Blog — Nexora",
    description: "Expert-written articles on autism, Down syndrome, cerebral palsy, speech therapy, and IDD care across Nigeria.",
  },
}

interface SanityImage { asset: { _ref: string }; alt?: string }

function PostImage({ image, title, className }: { image?: SanityImage; title: string; className?: string }) {
  if (image?.asset) {
    return (
      <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        <Image src={urlFor(image).width(800).height(450).fit("crop").url()} alt={image.alt || title}
          fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
    )
  }
  return (
    <div className={`bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center ${className}`}>
      <BookOpen className="w-8 h-8 text-primary/30" />
    </div>
  )
}

function AuthorAvatar({ author }: { author?: { name: string; image?: SanityImage } }) {
  if (!author) return null
  return (
    <div className="flex items-center gap-1.5">
      {author.image?.asset ? (
        <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0">
          <Image src={urlFor(author.image).width(40).height(40).fit("crop").url()} alt={author.name} fill className="object-cover" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary text-xs font-semibold">{author.name[0].toUpperCase()}</span>
        </div>
      )}
      <span>{author.name}</span>
    </div>
  )
}

export const revalidate = 60

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    client.fetch(blogPostsQuery).catch(() => []),
    client.fetch(categoriesQuery).catch(() => []),
  ])

  const featuredPost = posts.find((p: { featured?: boolean }) => p.featured) || posts[0]
  const regularPosts = posts.filter((p: { _id: string; featured?: boolean }) => p._id !== featuredPost?._id)

  if (!posts.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-700 mb-2">No articles yet</h1>
          <p className="text-slate-500">Check back soon — content is on its way.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-5">
        <BackButton fallback="/resources" label="Resources" className="text-muted-foreground" />
      </div>
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">IDD Care Blog</h1>
            <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              Expert insights, practical guidance, and the latest research on intellectual and developmental
              disabilities care.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {featuredPost && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 font-serif">Featured Article</h2>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <PostImage image={featuredPost.mainImage} title={featuredPost.title} className="aspect-[16/7] w-full" />
                  <CardContent className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-primary hover:bg-primary">Featured</Badge>
                      {featuredPost.categories?.[0] && (
                        <Badge variant="outline">{featuredPost.categories[0].title}</Badge>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 font-serif">
                      <Link href={`/resources/blog/${featuredPost.slug.current}`} className="hover:text-primary transition-colors">
                        {featuredPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">{featuredPost.excerpt}</p>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <AuthorAvatar author={featuredPost.author} />
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(featuredPost.publishedAt), "MMM d, yyyy")}
                        </div>
                        {featuredPost.estimatedReadingTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {featuredPost.estimatedReadingTime} min read
                          </div>
                        )}
                      </div>
                      <Button asChild className="bg-primary hover:bg-primary text-white">
                        <Link href={`/resources/blog/${featuredPost.slug.current}`}>Read Article</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-6 font-serif">Recent Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {regularPosts.map((post: { _id: string; title: string; slug: { current: string }; excerpt: string; publishedAt: string; author?: { name: string; image?: SanityImage }; categories?: { title: string }[]; estimatedReadingTime?: number; mainImage?: SanityImage }) => (
                  <Card key={post._id} className="hover:shadow-md transition-shadow overflow-hidden">
                    <PostImage image={post.mainImage} title={post.title} className="aspect-video w-full" />
                    <CardContent className="p-5">
                      {post.categories?.[0] && (
                        <Badge variant="outline" className="mb-3 text-xs">{post.categories[0].title}</Badge>
                      )}
                      <h3 className="font-bold mb-2 leading-snug">
                        <Link href={`/resources/blog/${post.slug.current}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <AuthorAvatar author={post.author} />
                        <div className="flex items-center gap-3">
                          <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                          {post.estimatedReadingTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{post.estimatedReadingTime} min
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {categories.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 font-serif">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category: { _id: string; title: string }) => (
                      <div key={category._id} className="py-1">
                        <Button variant="link" className="p-0 h-auto text-left">
                          {category.title}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <NewsletterWidget source="blog_page" />

            {posts.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 font-serif">Latest Posts</h3>
                  <div className="space-y-4">
                    {posts.slice(0, 4).map((post: { _id: string; title: string; slug: { current: string }; publishedAt: string }, index: number) => (
                      <div key={post._id} className="border-b border-gray-100 pb-3 last:border-0">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <Link
                              href={`/resources/blog/${post.slug.current}`}
                              className="text-sm font-medium hover:text-primary transition-colors"
                            >
                              {post.title}
                            </Link>
                            <div className="text-xs text-gray-500 mt-1">
                              {format(new Date(post.publishedAt), "MMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
