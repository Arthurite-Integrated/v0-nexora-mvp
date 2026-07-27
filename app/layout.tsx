import type React from "react"
import type { Metadata } from "next"
import { Work_Sans } from "next/font/google"
import { Crimson_Text } from "next/font/google"
import { Suspense } from "react"
import FloatingChatbot from "@/components/floatingChatbot"
import { Header } from "@/components/header"
import { AuthProvider } from "@/contexts/AuthContext"
import { CookieConsentProvider } from "@/contexts/CookieConsentContext"
import { CookieBanner } from "@/components/cookie-banner"
import { GoogleAnalytics } from "@/components/google-analytics"
import { OrganizationSchema, WebsiteSchema } from "@/components/structured-data"
import { Toaster } from "sonner"
import "./globals.css"

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Nexora — Together in Care",
    template: "%s | Nexora",
  },
  description:
    "Connect with verified healthcare professionals specialising in Intellectual and Developmental Disabilities (IDD) across Nigeria. Book consultations, access resources, and join a supportive community.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://nexoracare.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://nexoracare.com",
    siteName: "Nexora",
    title: "Nexora — Together in Care",
    description:
      "Connect with verified IDD healthcare professionals across Nigeria. Book consultations and access expert resources.",
    images: [
      {
        url: "https://nexora-care-graphics.s3.us-east-1.amazonaws.com/nexora-icon.png",
        width: 512,
        height: 512,
        alt: "Nexora",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Nexora — Together in Care",
    description: "Connect with verified IDD healthcare professionals across Nigeria.",
    images: ["https://nexora-care-graphics.s3.us-east-1.amazonaws.com/nexora-icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body className={`font-sans ${workSans.variable} ${crimsonText.variable}`}>
        <CookieConsentProvider>
          <AuthProvider>
            <Header />
            <main>
              <Suspense fallback={null}>{children}</Suspense>
            </main>
            <FloatingChatbot />
            <CookieBanner />
          </AuthProvider>
        </CookieConsentProvider>
        <GoogleAnalytics />
        <Toaster
          position="top-right"
          closeButton
          gap={8}
          toastOptions={{
            duration: 4000,
            classNames: {
              toast: "font-sans text-sm bg-white border border-border shadow-md rounded-lg px-4 py-3 text-foreground",
              title: "font-medium text-sm text-foreground",
              description: "text-xs text-muted-foreground mt-0.5",
              closeButton: "text-muted-foreground hover:text-foreground",
              success: "border-l-2 border-l-primary",
              error: "border-l-2 border-l-destructive",
              info: "border-l-2 border-l-muted-foreground",
              warning: "border-l-2 border-l-yellow-500",
            },
          }}
        />
      </body>
    </html>
  )
}
