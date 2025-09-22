import { Header } from "@/components/header"
import { ProfessionalCard } from "@/components/professional-card"
import { ProfessionalFilters } from "@/components/professional-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Filter } from "lucide-react"

// Mock data - in real app this would come from Supabase
const mockProfessionals = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialization: "Developmental Pediatrics",
    location: "Lagos, Nigeria",
    bio: "Specialized in early intervention and developmental assessments for children with IDDs. Over 15 years of experience working with families.",
    rating: 4.9,
    reviewCount: 127,
    verified: true,
    yearsExperience: 15,
    consultationFee: 25000,
    languages: ["English", "Yoruba"],
    image: "/professional-doctor-woman.jpg",
  },
  {
    id: "2",
    name: "Dr. Michael Adebayo",
    specialization: "Speech Therapy",
    location: "Abuja, Nigeria",
    bio: "Expert in communication disorders and speech development for individuals with autism and other developmental disabilities.",
    rating: 4.8,
    reviewCount: 89,
    verified: true,
    yearsExperience: 12,
    consultationFee: 20000,
    languages: ["English", "Hausa"],
    image: "/professional-doctor-man.jpg",
  },
  {
    id: "3",
    name: "Dr. Fatima Hassan",
    specialization: "Occupational Therapy",
    location: "Port Harcourt, Nigeria",
    bio: "Helping individuals with IDDs develop daily living skills and achieve greater independence through personalized therapy programs.",
    rating: 5.0,
    reviewCount: 156,
    verified: true,
    yearsExperience: 18,
    consultationFee: 22000,
    languages: ["English", "Igbo"],
    image: "/professional-therapist-woman.png",
  },
  {
    id: "4",
    name: "Dr. Ahmed Musa",
    specialization: "Behavioral Therapy",
    location: "Kano, Nigeria",
    bio: "Specialized in Applied Behavior Analysis (ABA) and positive behavior support for individuals with autism and developmental disabilities.",
    rating: 4.7,
    reviewCount: 94,
    verified: true,
    yearsExperience: 10,
    consultationFee: 18000,
    languages: ["English", "Hausa"],
    image: "/professional-therapist-man.jpg",
  },
  {
    id: "5",
    name: "Dr. Grace Okafor",
    specialization: "Special Education",
    location: "Enugu, Nigeria",
    bio: "Educational specialist focusing on individualized learning plans and academic support for students with intellectual disabilities.",
    rating: 4.9,
    reviewCount: 112,
    verified: false,
    yearsExperience: 8,
    consultationFee: 15000,
    languages: ["English", "Igbo"],
    image: "/professional-educator-woman.jpg",
  },
  {
    id: "6",
    name: "Dr. Ibrahim Yusuf",
    specialization: "Psychiatry",
    location: "Kaduna, Nigeria",
    bio: "Child and adolescent psychiatrist with expertise in mental health support for individuals with developmental disabilities.",
    rating: 4.6,
    reviewCount: 78,
    verified: true,
    yearsExperience: 14,
    consultationFee: 30000,
    languages: ["English", "Hausa"],
    image: "/professional-psychiatrist-man.jpg",
  },
]

export default function ProfessionalsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Healthcare Professionals</h1>
          <p className="text-lg text-gray-600">
            Connect with verified specialists in Intellectual and Developmental Disabilities
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input placeholder="Search by name, specialization, or location..." className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <MapPin className="w-4 h-4" />
                Location
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <ProfessionalFilters />
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">Showing {mockProfessionals.length} professionals</p>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>Sort by Rating</option>
                <option>Sort by Experience</option>
                <option>Sort by Price</option>
                <option>Sort by Location</option>
              </select>
            </div>

            <div className="grid gap-6">
              {mockProfessionals.map((professional) => (
                <ProfessionalCard key={professional.id} professional={professional} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button variant="outline" className="bg-primary text-white">
                  1
                </Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
