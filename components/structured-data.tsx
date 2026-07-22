/**
 * JSON-LD structured data components for SEO rich results.
 * Drop these into server components — they render as <script> tags in <head>.
 */

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nexora",
    alternateName: "Nexora Care",
    url: "https://nexoracare.com",
    logo: "https://nexora-care-graphics.s3.us-east-1.amazonaws.com/nexora-icon.png",
    description:
      "Nexora connects caregivers and families with verified healthcare professionals specialising in Intellectual and Developmental Disabilities (IDD) across Nigeria.",
    foundingLocation: {
      "@type": "Place",
      addressCountry: "NG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "admin@nexoracare.com",
      contactType: "customer service",
    },
    sameAs: [],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nexora",
    url: "https://nexoracare.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://nexoracare.com/professionals?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ProfessionalSchemaProps {
  name: string
  specialization: string
  location?: string
  bio?: string
  profileUrl: string
  imageUrl?: string
  rating?: number
  reviewCount?: number
  consultationFee?: number
}

export function ProfessionalSchema({
  name,
  specialization,
  location,
  bio,
  profileUrl,
  imageUrl,
  rating,
  reviewCount,
  consultationFee,
}: ProfessionalSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name,
    description: bio,
    medicalSpecialty: specialization,
    url: profileUrl,
    ...(imageUrl && { image: imageUrl }),
    ...(location && {
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
        addressCountry: "NG",
      },
    }),
    ...(rating && reviewCount && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(consultationFee && {
      priceRange: `₦${consultationFee.toLocaleString()}`,
    }),
    availableService: {
      "@type": "MedicalTherapy",
      name: `${specialization} consultation`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BlogPostSchemaProps {
  title: string
  excerpt: string
  publishedAt: string
  authorName?: string
  slug: string
  imageUrl?: string
}

export function BlogPostSchema({ title, excerpt, publishedAt, authorName, slug, imageUrl }: BlogPostSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    datePublished: publishedAt,
    url: `https://nexoracare.com/resources/blog/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "Nexora",
      logo: "https://nexora-care-graphics.s3.us-east-1.amazonaws.com/nexora-icon.png",
    },
    ...(authorName && {
      author: { "@type": "Person", name: authorName },
    }),
    ...(imageUrl && { image: imageUrl }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
