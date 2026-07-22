/** @type {import('next').NextConfig} */
const isStaging = process.env.NEXT_PUBLIC_APP_URL?.includes("staging")

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable Next.js image optimisation (was off, hurts Core Web Vitals)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "nexora-care-assets.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "nexora-care-graphics.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Block staging from search engines at the HTTP header level
          ...(isStaging
            ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
            : []),

          // Security headers
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",          value: "DENY" },
          { key: "X-XSS-Protection",         value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // Redirect www → apex (canonical)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.nexoracare.com" }],
        destination: "https://nexoracare.com/:path*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
