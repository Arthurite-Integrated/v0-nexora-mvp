"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Heart, Users, Shield, Calendar, Star, MapPin } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { CookiePreferencesButton } from "@/components/cookie-banner"

interface FeaturedProfessional {
  _id: string
  name: string
  specialization: string
  location: string
  averageRating: number
  reviewCount: number
  profileImage?: string
}

export default function HomePage() {
  const { user } = useAuth()
  const [featuredProfessionals, setFeaturedProfessionals] = useState<FeaturedProfessional[]>([])
  const [proLoading, setProLoading] = useState(true)

  useEffect(() => {
    fetch("/api/professionals?verified=true&limit=3")
      .then((r) => r.json())
      .then((d) => setFeaturedProfessionals(d.professionals || []))
      .catch(() => {})
      .finally(() => setProLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-balance">
              Connecting Families with
              <span className="text-primary"> IDD Healthcare</span> Professionals
            </h1>
            <p className="text-xl text-gray-600 mb-8 text-pretty max-w-2xl mx-auto">
              Find qualified healthcare professionals specializing in Intellectual and Developmental Disabilities. Book
              consultations, access resources, and join a supportive community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/register?role=caregiver">Find a Professional</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/register?role=professional">Join as Professional</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Nexora?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're dedicated to improving access to specialized healthcare for individuals with IDDs and their
              families.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Verified Professionals</CardTitle>
                <CardDescription>
                  All healthcare professionals are thoroughly vetted and verified for their credentials and
                  specializations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Easy Booking</CardTitle>
                <CardDescription>
                  Schedule consultations with specialists at times that work for your family's schedule.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Supportive Community</CardTitle>
                <CardDescription>
                  Connect with other families and caregivers who understand your journey and challenges.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Professionals Preview */}
      {(proLoading || featuredProfessionals.length > 0) && (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Professionals</h2>
            <p className="text-lg text-gray-600">Meet some of our verified healthcare specialists</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded" />
                    </CardContent>
                  </Card>
                ))
              : featuredProfessionals.map((professional) => (
                  <Card key={professional._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                        <img
                          src={professional.profileImage || "/avatar-professional.svg"}
                          alt={professional.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-lg">{professional.name}</CardTitle>
                      <Badge variant="secondary" className="w-fit mx-auto">
                        {professional.specialization}
                      </Badge>
                    </CardHeader>
                    <CardContent className="text-center space-y-2">
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {professional.location}
                      </div>
                      <div className="flex items-center justify-center text-sm">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{professional.averageRating.toFixed(1)}</span>
                        <span className="text-gray-600 ml-1">({professional.reviewCount} reviews)</span>
                      </div>
                      <Button size="sm" className="w-full mt-4" asChild>
                        <Link href={`/professionals/${professional._id}`}>View Profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {!proLoading && featuredProfessionals.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/professionals">View All Professionals</Link>
            </Button>
          </div>
          )}
        </div>
      </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Heart className="w-16 h-16 mx-auto mb-6 text-white/80" />
            {user ? (
              <>
                <h2 className="text-3xl font-bold mb-4">Welcome back!</h2>
                <p className="text-xl text-primary-foreground/80 mb-8">
                  Continue your journey with Nexora. Access your dashboard to manage appointments and connect with professionals.
                </p>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-xl text-primary-foreground/80 mb-8">
                  Join thousands of families who have found the right care for their loved ones through Nexora.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/register?role=caregiver">Find Care Today</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
                    asChild
                  >
                    <Link href="/register?role=professional">Become a Provider</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/images/nexora-icon.png" alt="Nexora" className="w-8 h-8" />
                <span className="text-xl font-bold">Nexora</span>
              </div>
              <p className="text-gray-400 mb-4">
                Together in Care - Connecting families with specialized healthcare professionals for Intellectual and
                Developmental Disabilities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Families</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/professionals" className="hover:text-white transition-colors">
                    Find Professionals
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="hover:text-white transition-colors">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-white transition-colors">
                    Support Groups
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Professionals</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/register?role=professional" className="hover:text-white transition-colors">
                    Join Network
                  </Link>
                </li>
                <li>
                  <Link href="/professional-resources" className="hover:text-white transition-colors">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link href="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
              <span className="hidden sm:inline">•</span>
              <CookiePreferencesButton />
            </div>
            <p>&copy; {new Date().getFullYear()} Nexora. All rights reserved. Together in Care.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
