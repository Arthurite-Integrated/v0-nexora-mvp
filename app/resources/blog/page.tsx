import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, User, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

// Mock data for development (replace with actual Sanity data when connected)
const mockPosts = [
  {
    _id: "1",
    title: "Understanding Early Signs of Developmental Delays",
    slug: { current: "understanding-early-signs-developmental-delays" },
    excerpt:
      "Learn to recognize early indicators of developmental delays and understand when to seek professional evaluation. Early intervention can make a significant difference in outcomes.",
    publishedAt: "2024-03-15T10:00:00Z",
    author: { name: "Dr. Sarah Johnson", image: null },
    categories: [{ title: "Early Intervention", slug: { current: "early-intervention" } }],
    mainImage: null,
    estimatedReadingTime: 8,
    featured: true,
  },
  {
    _id: "2",
    title: "Creating Sensory-Friendly Environments",
    slug: { current: "creating-sensory-friendly-environments" },
    excerpt:
      "Tips for designing spaces that support individuals with sensory processing differences and create comfortable environments.",
    publishedAt: "2024-03-12T14:30:00Z",
    author: { name: "Maria Rodriguez", image: null },
    categories: [{ title: "Environment", slug: { current: "environment" } }],
    mainImage: null,
    estimatedReadingTime: 6,
  },
  {
    _id: "3",
    title: "Communication Strategies for Non-Verbal Individuals",
    slug: { current: "communication-strategies-non-verbal" },
    excerpt:
      "Explore alternative communication methods and assistive technologies that can help non-verbal individuals express themselves.",
    publishedAt: "2024-03-10T09:15:00Z",
    author: { name: "Dr. James Chen", image: null },
    categories: [{ title: "Communication", slug: { current: "communication" } }],
    mainImage: null,
    estimatedReadingTime: 10,
  },
  {
    _id: "4",
    title: "Navigating Healthcare Systems",
    slug: { current: "navigating-healthcare-systems" },
    excerpt:
      "A comprehensive guide for families on accessing specialized healthcare services and understanding insurance coverage.",
    publishedAt: "2024-03-08T16:45:00Z",
    author: { name: "Lisa Thompson", image: null },
    categories: [{ title: "Healthcare", slug: { current: "healthcare" } }],
    mainImage: null,
    estimatedReadingTime: 12,
  },
  {
    _id: "5",
    title: "Building Independence Skills",
    slug: { current: "building-independence-skills" },
    excerpt:
      "Age-appropriate strategies for developing daily living skills and promoting independence in individuals with IDDs.",
    publishedAt: "2024-03-05T11:20:00Z",
    author: { name: "Dr. Michael Brown", image: null },
    categories: [{ title: "Independence", slug: { current: "independence" } }],
    mainImage: null,
    estimatedReadingTime: 9,
  },
  {
    _id: "6",
    title: "IEP Meeting Preparation Guide",
    slug: { current: "iep-meeting-preparation-guide" },
    excerpt:
      "Everything parents need to know to prepare for and participate effectively in Individualized Education Program meetings.",
    publishedAt: "2024-03-02T13:10:00Z",
    author: { name: "Jennifer Adams", image: null },
    categories: [{ title: "Education", slug: { current: "education" } }],
    mainImage: null,
    estimatedReadingTime: 15,
  },
]

const mockCategories = [
  { _id: "1", title: "Early Intervention", slug: { current: "early-intervention" } },
  { _id: "2", title: "Behavioral Support", slug: { current: "behavioral-support" } },
  { _id: "3", title: "Communication", slug: { current: "communication" } },
  { _id: "4", title: "Healthcare", slug: { current: "healthcare" } },
  { _id: "5", title: "Education", slug: { current: "education" } },
  { _id: "6", title: "Independence", slug: { current: "independence" } },
  { _id: "7", title: "Family Support", slug: { current: "family-support" } },
]

export default async function BlogPage() {
  // In production, uncomment these lines to fetch from Sanity:
  // const posts = await client.fetch(blogPostsQuery)
  // const categories = await client.fetch(categoriesQuery)

  // Using mock data for development
  const posts = mockPosts
  const categories = mockCategories
  const featuredPost = posts.find((post) => post.featured) || posts[0]
  const regularPosts = posts.filter((post) => !post.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">IDD Care Blog</h1>
            <p className="text-xl text-teal-100 mb-8 leading-relaxed">
              Expert insights, practical guidance, and the latest research on intellectual and developmental
              disabilities care.
            </p>

            {/* Search Bar */}
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
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 font-serif">Featured Article</h2>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-r from-teal-100 to-coral-100"></div>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-teal-600 hover:bg-teal-700">Featured</Badge>
                      {featuredPost.categories?.[0] && (
                        <Badge variant="outline">{featuredPost.categories[0].title}</Badge>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 font-serif">
                      <Link
                        href={`/resources/blog/${featuredPost.slug.current}`}
                        className="hover:text-teal-600 transition-colors"
                      >
                        {featuredPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">{featuredPost.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {featuredPost.author.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(featuredPost.publishedAt), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredPost.estimatedReadingTime} min read
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/resources/blog/${featuredPost.slug.current}`}>Read Article</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Posts */}
            <div>
              <h2 className="text-2xl font-bold mb-6 font-serif">Recent Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {regularPosts.map((post) => (
                  <Card key={post._id} className="hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-gradient-to-r from-gray-100 to-gray-200"></div>
                    <CardContent className="p-6">
                      {post.categories?.[0] && (
                        <Badge variant="outline" className="mb-3">
                          {post.categories[0].title}
                        </Badge>
                      )}
                      <h3 className="font-bold mb-2 font-serif">
                        <Link
                          href={`/resources/blog/${post.slug.current}`}
                          className="hover:text-teal-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          By {post.author.name} • {format(new Date(post.publishedAt), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {post.estimatedReadingTime} min
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Articles
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Categories */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 font-serif">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category._id} className="flex items-center justify-between py-1">
                      <Button variant="link" className="p-0 h-auto text-left">
                        {category.title}
                      </Button>
                      <Badge variant="secondary" className="text-xs">
                        {Math.floor(Math.random() * 20) + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="bg-teal-50 border-teal-200">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2 text-teal-800 font-serif">Stay Updated</h3>
                <p className="text-sm text-teal-600 mb-4">
                  Get the latest articles and resources delivered to your inbox weekly.
                </p>
                <div className="space-y-3">
                  <Input placeholder="Your email address" />
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">Subscribe</Button>
                </div>
              </CardContent>
            </Card>

            {/* Popular Posts */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 font-serif">Popular This Month</h3>
                <div className="space-y-4">
                  {posts.slice(0, 4).map((post, index) => (
                    <div key={post._id} className="border-b border-gray-100 pb-3 last:border-0">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-sm font-bold text-teal-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <Button variant="link" className="p-0 h-auto text-left text-sm font-medium">
                            <Link href={`/resources/blog/${post.slug.current}`}>{post.title}</Link>
                          </Button>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.floor(Math.random() * 1000) + 500} views
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
