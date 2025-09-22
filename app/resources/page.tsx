import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, MessageCircle, Users, Brain, Stethoscope, Calendar, Phone } from "lucide-react"
import Link from "next/link"
import GeminiChatbot from "@/components/gemini-chatbot"

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Resources & Support</h1>
            <p className="text-xl text-teal-100 mb-8 leading-relaxed">
              Access expert guidance, educational content, and community support for IDD care. Get answers from our AI
              assistant or explore our comprehensive blog.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="chatbot" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="chatbot" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                AI Care Assistant
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Blog & Articles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chatbot" className="space-y-8">
              {/* Chatbot Section */}
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="h-[600px]">
                    <CardHeader className="border-b">
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-teal-600" />
                        IDD Care Assistant
                      </CardTitle>
                      <CardDescription>
                        Ask questions about intellectual and developmental disabilities care, treatment options, and
                        support strategies.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 h-full">
                      <GeminiChatbot />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Quick Topics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Topics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start text-left h-auto p-3 bg-transparent">
                        <div>
                          <div className="font-medium">Early Intervention</div>
                          <div className="text-sm text-gray-500">Strategies for young children</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-left h-auto p-3 bg-transparent">
                        <div>
                          <div className="font-medium">Behavioral Support</div>
                          <div className="text-sm text-gray-500">Managing challenging behaviors</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-left h-auto p-3 bg-transparent">
                        <div>
                          <div className="font-medium">Educational Planning</div>
                          <div className="text-sm text-gray-500">IEP and school support</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-left h-auto p-3 bg-transparent">
                        <div>
                          <div className="font-medium">Adult Transition</div>
                          <div className="text-sm text-gray-500">Planning for independence</div>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Emergency Resources */}
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Emergency Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">
                        <div className="font-medium text-red-800">Crisis Hotline</div>
                        <div className="text-red-600">1-800-XXX-XXXX</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-red-800">Emergency Services</div>
                        <div className="text-red-600">Call 911 for immediate help</div>
                      </div>
                      <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                        Find Local Emergency Services
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="blog" className="space-y-8">
              {/* Blog Section */}
              <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold font-serif">Latest Articles</h2>
                    <Button variant="outline" asChild>
                      <Link href="/resources/blog">View All Articles</Link>
                    </Button>
                  </div>

                  {/* Featured Article */}
                  <Card className="mb-8">
                    <div className="aspect-video bg-gradient-to-r from-teal-100 to-coral-100 rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">Featured</Badge>
                        <Badge variant="outline">Early Intervention</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-3 font-serif">
                        Understanding Early Signs of Developmental Delays
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Learn to recognize early indicators of developmental delays and understand when to seek
                        professional evaluation. Early intervention can make a significant difference in outcomes.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">By Dr. Sarah Johnson • March 15, 2024</div>
                        <Button variant="link" className="p-0">
                          Read More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Articles Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      {
                        title: "Creating Sensory-Friendly Environments",
                        excerpt:
                          "Tips for designing spaces that support individuals with sensory processing differences.",
                        category: "Environment",
                        author: "Maria Rodriguez",
                        date: "March 12, 2024",
                      },
                      {
                        title: "Communication Strategies for Non-Verbal Individuals",
                        excerpt: "Explore alternative communication methods and assistive technologies.",
                        category: "Communication",
                        author: "Dr. James Chen",
                        date: "March 10, 2024",
                      },
                      {
                        title: "Navigating Healthcare Systems",
                        excerpt: "A guide for families on accessing specialized healthcare services.",
                        category: "Healthcare",
                        author: "Lisa Thompson",
                        date: "March 8, 2024",
                      },
                      {
                        title: "Building Independence Skills",
                        excerpt: "Age-appropriate strategies for developing daily living skills.",
                        category: "Independence",
                        author: "Dr. Michael Brown",
                        date: "March 5, 2024",
                      },
                    ].map((article, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <Badge variant="outline" className="mb-3">
                            {article.category}
                          </Badge>
                          <h3 className="font-bold mb-2 font-serif">{article.title}</h3>
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">{article.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              By {article.author} • {article.date}
                            </div>
                            <Button variant="link" size="sm" className="p-0">
                              Read More
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Categories */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { name: "Early Intervention", count: 12 },
                        { name: "Behavioral Support", count: 8 },
                        { name: "Communication", count: 15 },
                        { name: "Healthcare", count: 10 },
                        { name: "Education", count: 18 },
                        { name: "Independence", count: 7 },
                        { name: "Family Support", count: 14 },
                      ].map((category, index) => (
                        <div key={index} className="flex items-center justify-between py-1">
                          <Button variant="link" className="p-0 h-auto text-left">
                            {category.name}
                          </Button>
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Newsletter Signup */}
                  <Card className="bg-teal-50 border-teal-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-teal-800">Stay Updated</CardTitle>
                      <CardDescription className="text-teal-600">
                        Get the latest articles and resources delivered to your inbox.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700">Subscribe to Newsletter</Button>
                    </CardContent>
                  </Card>

                  {/* Popular Articles */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Popular This Week</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        "Understanding Autism Spectrum Disorders",
                        "IEP Meeting Preparation Guide",
                        "Managing Meltdowns and Tantrums",
                      ].map((title, index) => (
                        <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                          <Button variant="link" className="p-0 h-auto text-left text-sm font-medium">
                            {title}
                          </Button>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.floor(Math.random() * 500) + 100} views
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-serif">Additional Support</h2>
            <p className="text-gray-600 leading-relaxed">
              Connect with our community and access professional support services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Support Groups</h3>
                <p className="text-gray-600 text-sm mb-4">Connect with other families and caregivers in your area.</p>
                <Button variant="outline" size="sm">
                  Find Groups
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Stethoscope className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Professional Network</h3>
                <p className="text-gray-600 text-sm mb-4">Browse our directory of verified healthcare professionals.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/professionals">Browse Professionals</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Calendar className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Book Consultation</h3>
                <p className="text-gray-600 text-sm mb-4">Schedule a consultation with our specialists.</p>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
