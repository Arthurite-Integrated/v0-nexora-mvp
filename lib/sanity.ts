import { createClient } from "next-sanity"
import imageUrlBuilder from "@sanity/image-url"

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "fii7xfvx",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: process.env.NODE_ENV === "production",
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: unknown) {
  return builder.image(source as Parameters<typeof builder.image>[0])
}

// Blog
export const blogPostsQuery = `
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id, title, slug, excerpt, publishedAt,
    author->{ name, image },
    categories[]->{ title, slug },
    mainImage, estimatedReadingTime
  }
`

export const blogPostQuery = `
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id, title, slug, excerpt, publishedAt,
    author->{ name, bio, image },
    categories[]->{ title, slug },
    mainImage, body, estimatedReadingTime, seo
  }
`

export const categoriesQuery = `
  *[_type == "category"] | order(title asc) {
    _id, title, slug, description
  }
`

export const featuredPostsQuery = `
  *[_type == "blogPost" && featured == true] | order(publishedAt desc) [0...3] {
    _id, title, slug, excerpt, publishedAt,
    author->{ name, image },
    categories[]->{ title, slug },
    mainImage, estimatedReadingTime
  }
`

export const blogSlugsQuery = `*[_type == "blogPost"]{ "slug": slug.current }`

// Resources
export const resourcesQuery = `
  *[_type == "resource"] | order(publishedAt desc) {
    _id, title, slug, description, type, featured, publishedAt,
    categories[]->{ title, slug },
    thumbnail, downloadUrl, externalUrl
  }
`

export const featuredResourcesQuery = `
  *[_type == "resource" && featured == true] | order(publishedAt desc) [0...6] {
    _id, title, slug, description, type, thumbnail, downloadUrl, externalUrl
  }
`

// Static pages
export const staticPageQuery = `
  *[_type == "staticPage" && slug.current == $slug][0] {
    _id, title, slug, body, seo
  }
`
