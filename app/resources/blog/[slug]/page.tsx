import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Clock, Share2, Bookmark } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { urlFor } from "@/lib/sanity"
import { format } from "date-fns"
import CustomPortableText from "@/components/portable-text"
import { notFound } from "next/navigation"

// Mock data for development
const mockPost = {
  _id: "1",
  title: "Understanding Early Signs of Developmental Delays",
  slug: { current: "understanding-early-signs-developmental-delays" },
  excerpt:
    "Learn to recognize early indicators of developmental delays and understand when to seek professional evaluation. Early intervention can make a significant difference in outcomes.",
  publishedAt: "2024-03-15T10:00:00Z",
  author: {
    name: "Dr. Sarah Johnson",
    bio: [
      {
        _type: "block",
        children: [
          {
            text: "Dr. Sarah Johnson is a developmental pediatrician with over 15 years of experience in early intervention and IDD care.",
          },
        ],
      },
    ],
    image: null,
  },
  categories: [{ title: "Early Intervention", slug: { current: "early-intervention" } }],
  mainImage: null,
  estimatedReadingTime: 8,
  body: [
    {
      _type: "block",
      style: "normal",
      children: [
        {
          text: "Early identification of developmental delays is crucial for ensuring that children receive the support and interventions they need to reach their full potential. As parents and caregivers, understanding what to look for can make a significant difference in a child's developmental trajectory.",
        },
      ],
    },
    {
      _type: "block",
      style: "h2",
      children: [{ text: "What Are Developmental Delays?" }],
    },
    {
      _type: "block",
      style: "normal",
      children: [
        {
          text: "Developmental delays occur when a child does not reach developmental milestones at the expected times. These delays can affect various areas of development, including:",
        },
      ],
    },
    {
      _type: "block",
      listItem: "bullet",
      children: [{ text: "Physical development (gross and fine motor skills)" }],
    },
    {
      _type: "block",
      listItem: "bullet",
      children: [{ text: "Cognitive development (thinking, learning, problem-solving)" }],
    },
    {
      _type: "block",
      listItem: "bullet",
      children: [{ text: "Communication and language development" }],
    },
    {
      _type: "block",
      listItem: "bullet",
      children: [{ text: "Social and emotional development" }],
    },
    {
      _type: "block",
      listItem: "bullet",
      children: [{ text: "Adaptive development (self-care skills)" }],
    },
    {
      _type: "block",
      style: "h2",
      children: [{ text: "Early Warning Signs by Age" }],
    },
    {
      _type: "block",
      style: "h3",
      children: [{ text: "By 12 Months" }],
    },
    {
      _type: "block",
      style: "normal",
      children: [
        {
          text: 'Children should typically be able to sit without support, pull themselves up to stand, say simple words like "mama" or "dada," and show interest in social games like peek-a-boo.',
        },
      ],
    },
    {
      _type: "block",
      style: "h3",
      children: [{ text: "By 24 Months" }],
    },
    {
      _type: "block",
      style: "normal",
      children: [
        {
          text: "Most children can walk steadily, use two-word phrases, follow simple instructions, and engage in pretend play. They should also show interest in other children and begin to assert independence.",
        },
      ],
    },
    {
      _type: "block",
      style: "blockquote",
      children: [
        {
          text: "Remember that every child develops at their own pace, but significant delays in multiple areas may warrant professional evaluation.",
        },
      ],
    },
    {
      _type: "block",
      style: "h2",
      children: [{ text: "When to Seek Professional Help" }],
    },
    {
      _type: "block",
      style: "normal",
      children: [
        {
          text: "If you notice persistent delays or concerns in your child's development, it's important to consult with your pediatrician or a developmental specialist. Early intervention services can provide significant benefits and improve long-term outcomes.",
        },
      ],
    },
  ],
  seo: {
    metaTitle: "Understanding Early Signs of Developmental Delays | Nexora",
    metaDescription:
      "Learn to recognize early indicators of developmental delays and understand when to seek professional evaluation for your child.",
  },
}

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // In production, uncomment this line to fetch from Sanity:
  // const post = await client.fetch(blogPostQuery, { slug: params.slug })

  // Using mock data for development
  const post = params.slug === "understanding-early-signs-developmental-delays" ? mockPost : null

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              {post.categories?.map((category) => (
                <Badge key={category.slug.current} variant="outline">
                  {category.title}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif leading-tight">{post.title}</h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">{post.excerpt}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.author.name}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.estimatedReadingTime} min read
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.mainImage && (
        <section className="bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={urlFor(post.mainImage).url() || "/placeholder.svg"}
                  alt={post.mainImage.alt || post.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Article Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8 lg:p-12">
                  <div className="prose prose-lg max-w-none">
                    <CustomPortableText value={post.body} />
                  </div>
                </CardContent>
              </Card>

              {/* Author Bio */}
              <Card className="mt-8">
                <CardContent className="p-8">
                  <h3 className="font-bold mb-4 font-serif">About the Author</h3>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
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
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Table of Contents */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 font-serif">In This Article</h3>
                  <div className="space-y-2 text-sm">
                    <Button variant="link" className="p-0 h-auto text-left">
                      What Are Developmental Delays?
                    </Button>
                    <Button variant="link" className="p-0 h-auto text-left">
                      Early Warning Signs by Age
                    </Button>
                    <Button variant="link" className="p-0 h-auto text-left">
                      When to Seek Professional Help
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Related Articles */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 font-serif">Related Articles</h3>
                  <div className="space-y-4">
                    {[
                      "Creating Sensory-Friendly Environments",
                      "IEP Meeting Preparation Guide",
                      "Building Independence Skills",
                    ].map((title, index) => (
                      <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                        <Button variant="link" className="p-0 h-auto text-left text-sm font-medium">
                          {title}
                        </Button>
                        <div className="text-xs text-gray-500 mt-1">{Math.floor(Math.random() * 10) + 5} min read</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-teal-50 border-teal-200">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold mb-2 text-teal-800 font-serif">Need Professional Guidance?</h3>
                  <p className="text-sm text-teal-600 mb-4">
                    Connect with our verified healthcare professionals specializing in IDD care.
                  </p>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
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
  // In production, fetch the post data here for SEO
  const post = params.slug === "understanding-early-signs-developmental-delays" ? mockPost : null

  if (!post) {
    return {
      title: "Post Not Found | Nexora Blog",
      description: "The requested blog post could not be found.",
    }
  }

  return {
    title: post.seo?.metaTitle || `${post.title} | Nexora Blog`,
    description: post.seo?.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  }
}
