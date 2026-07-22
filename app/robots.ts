import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const isStaging = process.env.NEXT_PUBLIC_APP_URL?.includes("staging")

  // Block all crawlers on staging
  if (isStaging) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/settings",
          "/bookings",
          "/onboarding",
          "/admin/",
          "/studio/",
          "/login",
          "/register",
          "/forgot-password",
          "/book/",
        ],
      },
    ],
    sitemap: "https://nexoracare.com/sitemap.xml",
    host: "https://nexoracare.com",
  }
}
