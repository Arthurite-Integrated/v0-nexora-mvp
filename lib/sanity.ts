import { createClient } from "next-sanity"
import imageUrlBuilder from "@sanity/image-url"

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false, // Set to true for production
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// GROQ queries for blog posts
export const blogPostsQuery = `
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    author->{
      name,
      image
    },
    categories[]->{
      title,
      slug
    },
    mainImage,
    estimatedReadingTime
  }
`

export const blogPostQuery = `
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    author->{
      name,
      bio,
      image
    },
    categories[]->{
      title,
      slug
    },
    mainImage,
    body,
    estimatedReadingTime,
    seo
  }
`

export const categoriesQuery = `
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description
  }
`

export const featuredPostsQuery = `
  *[_type == "blogPost" && featured == true] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    author->{
      name,
      image
    },
    categories[]->{
      title,
      slug
    },
    mainImage,
    estimatedReadingTime
  }
`
