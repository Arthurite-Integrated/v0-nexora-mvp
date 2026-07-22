import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Users, Stethoscope, Calendar, Clock, ChevronRight, Mail } from "lucide-react"
import Link from "next/link"
import { BackButton } from "@/components/back-button"
import Image from "next/image"
import { format } from "date-fns"
import type { Metadata } from "next"
import { client, blogPostsQuery, categoriesQuery, featuredResourcesQuery, urlFor } from "@/lib/sanity"

export const metadata: Metadata = {
  title: "Resources & Support",
  description:
    "Expert guides, articles, and practical resources for IDD care in Nigeria. Evidence-based content for caregivers and families.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "IDD Care Resources — Nexora",
    description: "Expert guides, articles, and tools for caregivers and families of individuals with Intellectual and Developmental Disabilities.",
  },
}

export const revalidate = 60

interface SanityImage {
  asset: { _ref: string }
  alt?: string
}

interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  publishedAt: string
  author?: { name: string; image?: SanityImage }
  categories?: { title: string; slug: { current: string } }[]
  estimatedReadingTime?: number
  featured?: boolean
  mainImage?: SanityImage
}

interface Category {
  _id: string
  title: string
  slug?: { current: string }
}

interface Resource {
  _id: string
  title: string
  slug: { current: string }
  description: string
  type: "guide" | "template" | "tool" | "video"
  downloadUrl?: string
  externalUrl?: string
}

const TYPE_COLORS: Record<string, string> = {
  guide: "bg-primary/5 text-primary border border-primary/20",
  template: "bg-blue-50 text-blue-700 border border-blue-200",
  tool: "bg-purple-50 text-purple-700 border border-purple-200",
  video: "bg-orange-50 text-orange-700 border border-orange-200",
}

function PostImage({ image, title, className }: { image?: SanityImage; title: string; className?: string }) {
  if (image?.asset) {
    return (
      <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        <Image
          src={urlFor(image).width(800).height(450).fit("crop").url()}
          alt={image.alt || title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
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
    <div className="flex items-center gap-2">
      {author.image?.asset ? (
        <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
          <Image
            src={urlFor(author.image).width(48).height(48).fit("crop").url()}
            alt={author.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary text-xs font-semibold">{author.name[0].toUpperCase()}</span>
        </div>
      )}
      <span>{author.name}</span>
    </div>
  )
}

export default async function ResourcesPage() {
  const [posts, categories, resources] = await Promise.all([
    client.fetch<Post[]>(blogPostsQuery).catch(() => [] as Post[]),
    client.fetch<Category[]>(categoriesQuery).catch(() => [] as Category[]),
    client.fetch<Resource[]>(featuredResourcesQuery).catch(() => [] as Resource[]),
  ])

  const featuredPost = posts.find(p => p.featured) || posts[0]
  const recentPosts = posts.filter(p => p._id !== featuredPost?._id).slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-5">
        <BackButton fallback="/" className="text-muted-foreground" />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Resources & Support</h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              Expert guidance, educational content, and comprehensive resources for IDD care.
            </p>
          </div>
        </div>
      </section>

      {/* Downloadable Resources */}
      {resources.length > 0 && (
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Guides & Tools</h2>
                <p className="text-gray-500 text-sm mt-1">Practical resources you can use today</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(r => (
                <Card key={r._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${TYPE_COLORS[r.type] || "bg-gray-100 text-gray-600"}`}>
                        {r.type}
                      </span>
                      <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 leading-snug">{r.title}</h3>
                    {r.description && <p className="text-gray-500 text-sm mb-4 line-clamp-2">{r.description}</p>}
                    <Button size="sm" variant="outline" asChild className="w-full">
                      <a href={r.downloadUrl || r.externalUrl || "#"} target="_blank" rel="noopener noreferrer">
                        Access Resource <ChevronRight className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-4 gap-10">
            {/* Main */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
                  <p className="text-gray-500 text-sm mt-1">Evidence-based guidance for IDD care</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/resources/blog">View All</Link>
                </Button>
              </div>

              {featuredPost ? (
                <>
                  {/* Featured */}
                  <Card className="mb-8 hover:shadow-lg transition-shadow overflow-hidden">
                    <PostImage image={featuredPost.mainImage} title={featuredPost.title} className="aspect-[16/7] w-full" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-primary hover:bg-primary">Featured</Badge>
                        {featuredPost.categories?.[0] && (
                          <Badge variant="outline">{featuredPost.categories[0].title}</Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-3 leading-snug">
                        <Link href={`/resources/blog/${featuredPost.slug.current}`} className="hover:text-primary transition-colors">
                          {featuredPost.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-5 leading-relaxed line-clamp-2">{featuredPost.excerpt}</p>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <AuthorAvatar author={featuredPost.author} />
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(featuredPost.publishedAt), "MMM d, yyyy")}
                          </span>
                          {featuredPost.estimatedReadingTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />{featuredPost.estimatedReadingTime} min read
                            </span>
                          )}
                        </div>
                        <Button size="sm" asChild className="bg-primary hover:bg-primary text-white">
                          <Link href={`/resources/blog/${featuredPost.slug.current}`}>Read Article</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Grid */}
                  {recentPosts.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-5">
                      {recentPosts.map(post => (
                        <Card key={post._id} className="hover:shadow-md transition-shadow overflow-hidden">
                          <PostImage image={post.mainImage} title={post.title} className="aspect-[16/9] w-full" />
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
                                    <Clock className="w-3 h-3" />{post.estimatedReadingTime} min
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No articles published yet. Check back soon.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {categories.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                    <div className="space-y-0.5">
                      {categories.map(c => (
                        <Link
                          key={c._id}
                          href={`/resources/blog?category=${c.slug?.current || ""}`}
                          className="flex items-center justify-between py-2 px-3 rounded-md text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors group"
                        >
                          <span>{c.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-teal-500 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Newsletter — redesigned */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-gray-900 text-sm">Stay Updated</h3>
                </div>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                  Get the latest articles and IDD care resources delivered to your inbox — no spam.
                </p>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="text-sm h-9 border-gray-200 focus:border-primary"
                  />
                  <Button className="w-full h-9 text-sm bg-primary hover:bg-primary text-white font-medium">
                    Subscribe
                  </Button>
                </div>
                <p className="text-gray-400 text-xs mt-3 text-center">Unsubscribe anytime.</p>
              </div>

              {posts.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Posts</h3>
                    <div className="space-y-4">
                      {posts.slice(0, 4).map((p, i) => (
                        <div key={p._id} className="flex gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div>
                            <Link href={`/resources/blog/${p.slug.current}`}
                              className="text-sm font-medium text-gray-800 hover:text-primary leading-snug line-clamp-2 transition-colors">
                              {p.title}
                            </Link>
                            <p className="text-xs text-gray-400 mt-1">
                              {format(new Date(p.publishedAt), "MMM d, yyyy")}
                            </p>
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
      </section>

      {/* Additional Support */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Additional Support</h2>
            <p className="text-gray-500">Connect with our community and access professional support.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Support Groups</h3>
                <p className="text-gray-500 text-sm mb-4">Connect with families and caregivers who understand your journey.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/support">Find Groups</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Professional Network</h3>
                <p className="text-gray-500 text-sm mb-4">Browse our directory of verified IDD specialists.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/professionals">Browse</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Book Consultation</h3>
                <p className="text-gray-500 text-sm mb-4">Schedule a session with a specialist today.</p>
                <Button size="sm" className="bg-primary hover:bg-primary" asChild>
                  <Link href="/professionals">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
