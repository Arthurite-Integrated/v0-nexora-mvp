import { MetadataRoute } from "next"
import { client, blogSlugsQuery } from "@/lib/sanity"
import { connectDB } from "@/lib/mongodb"
import { Professional } from "@/lib/models/Professional"

const BASE = "https://nexoracare.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/professionals`,     lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/resources`,         lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/resources/blog`,    lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/about`,             lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/support`,           lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/privacy`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,             lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ]

  // ── Dynamic: verified professional profiles ───────────────────────────────
  let professionalPages: MetadataRoute.Sitemap = []
  try {
    await connectDB()
    const professionals = await Professional.find({ isVerified: true }, "_id updatedAt").lean()
    professionalPages = professionals.map((p) => ({
      url: `${BASE}/professionals/${(p as { _id: { toString(): string } })._id.toString()}`,
      lastModified: (p as { updatedAt?: Date }).updatedAt || now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  } catch {
    // Non-fatal — sitemap still generates without professional URLs
  }

  // ── Dynamic: blog posts from Sanity ──────────────────────────────────────
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const slugs: { slug: string }[] = await client.fetch(blogSlugsQuery).catch(() => [])
    blogPages = slugs.map((s) => ({
      url: `${BASE}/resources/blog/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  } catch {
    // Non-fatal
  }

  return [...staticPages, ...professionalPages, ...blogPages]
}
