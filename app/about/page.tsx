import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, Shield, Target, CheckCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="container mx-auto text-center">
          <Heart className="w-16 h-16 mx-auto mb-6 text-white/80" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Nexora</h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            Together in Care - Bridging the gap between families and specialized healthcare professionals
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-teal-600" />
                <CardTitle className="text-3xl">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-lg text-slate-700 space-y-4">
              <p>
                Nexora was founded with a simple yet powerful mission: to make specialized healthcare for individuals 
                with Intellectual and Developmental Disabilities (IDD) more accessible, connected, and compassionate.
              </p>
              <p>
                We understand the unique challenges families face when seeking qualified professionals who truly 
                understand IDD care. Our platform bridges this gap by creating a trusted community where caregivers 
                can easily find, connect with, and book appointments with verified healthcare specialists.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Our Core Values</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-teal-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Compassion</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-slate-600">
                We lead with empathy and understanding, recognizing the emotional journey of every family and caregiver.
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-teal-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Trust</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-slate-600">
                Every professional is thoroughly vetted and verified to ensure the highest standards of care and expertise.
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-teal-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-slate-600">
                We foster a supportive network where families and professionals collaborate for better care outcomes.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-3xl">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-slate-700 space-y-4">
              <p>
                Nexora was born from personal experience. Our founders witnessed firsthand the challenges families face 
                when searching for qualified healthcare professionals who specialize in IDD care. The process was often 
                fragmented, time-consuming, and overwhelming during already difficult times.
              </p>
              <p>
                We envisioned a platform that would simplify this journey - a place where families could easily discover 
                verified professionals, read authentic reviews, and book appointments with confidence. A platform that 
                would empower healthcare providers to reach the families who need them most.
              </p>
              <p>
                Today, Nexora serves thousands of families and hundreds of healthcare professionals across the region, 
                creating meaningful connections that improve lives and strengthen communities.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">What We Offer</h2>
          
          <div className="space-y-6">
            {[
              {
                title: "For Families & Caregivers",
                items: [
                  "Access to verified healthcare professionals specializing in IDD",
                  "Easy search and filtering by specialization, location, and availability",
                  "Transparent reviews and ratings from other families",
                  "Simple online booking and appointment management",
                  "Secure messaging with healthcare providers"
                ]
              },
              {
                title: "For Healthcare Professionals",
                items: [
                  "Platform to showcase expertise and credentials",
                  "Tools to manage availability and appointments",
                  "Direct connection with families seeking specialized care",
                  "Professional community and networking opportunities",
                  "Resources and support for IDD care providers"
                ]
              }
            ].map((section, idx) => (
              <Card key={idx} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl text-teal-700">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-teal-600 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-teal-50 mb-8">
            Whether you're seeking care or providing it, Nexora is here to support your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register?role=caregiver">Find Care</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-teal-600 bg-transparent"
              asChild
            >
              <Link href="/register?role=professional">Join as Professional</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-8 px-4 text-center">
        <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
          ← Back to Home
        </Link>
      </section>
    </div>
  )
}
