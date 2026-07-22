import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Clock, Share2, Bookmark } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { client, blogPostQuery, blogSlugsQuery, urlFor } from "@/lib/sanity"
import { BlogPostSchema } from "@/components/structured-data"
import { format } from "date-fns"
import CustomPortableText from "@/components/portable-text"
import { notFound } from "next/navigation"

export const revalidate = 60

interface BlogPostPageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs: { slug: string }[] = await client.fetch(blogSlugsQuery).catch(() => [])
  return slugs.map((s) => ({ slug: s.slug }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await client.fetch(blogPostQuery, { slug: params.slug }).catch(() => null)

  if (!post) notFound()

  return (
    <div className="min-h-screen bg-background">
      <BlogPostSchema
        title={post.title}
        excerpt={post.excerpt}
        publishedAt={post.publishedAt}
        authorName={post.author?.name}
        slug={params.slug}
        imageUrl={post.mainImage?.asset ? urlFor(post.mainImage).width(1200).height(630).url() : undefined}
      />
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/resources/blog" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
            </Button>

            <div className="flex items-center gap-2 mb-4">
              {post.categories?.map((category: { title: string; slug: { current: string } }) => (
                <Badge key={category.slug.current} variant="outline">
                  {category.title}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif leading-tight">{post.title}</h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">{post.excerpt}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-gray-500">
                {post.author?.name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {post.author.name}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                </div>
                {post.estimatedReadingTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {post.estimatedReadingTime} min read
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm"><Bookmark className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><Share2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {post.mainImage && (
        <section className="bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={urlFor(post.mainImage).url() || "/placeholder.svg"}
                  alt={(post.mainImage as { alt?: string }).alt || post.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-12">
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8 lg:p-12">
                  <div className="prose prose-lg max-w-none">
                    <CustomPortableText value={post.body} />
                  </div>
                </CardContent>
              </Card>

              {post.author && (
                <Card className="mt-8">
                  <CardContent className="p-8">
                    <h3 className="font-bold mb-4 font-serif">About the Author</h3>
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0" />
                      <div>
                        <h4 className="font-bold mb-2">{post.author.name}</h4>
                        {post.author.bio && (
                          <div className="text-gray-600 text-sm">
                            <CustomPortableText value={post.author.bio} />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-8">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold mb-2 text-primary font-serif">Need Professional Guidance?</h3>
                  <p className="text-sm text-primary mb-4">
                    Connect with our verified healthcare professionals specializing in IDD care.
                  </p>
                  <Button className="w-full bg-primary hover:bg-primary" asChild>
                    <Link href="/professionals">Browse Professionals</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await client.fetch(blogPostQuery, { slug: params.slug }).catch(() => null)

  if (!post) {
    return { title: "Post Not Found | Nexora Blog" }
  }

  return {
    title: post.seo?.metaTitle || `${post.title} | Nexora Blog`,
    description: post.seo?.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : [],
    },
  }
}
