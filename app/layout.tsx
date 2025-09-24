import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Crimson_Text } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import FloatingChatbot from "@/components/floatingChatbot"
import { Header } from "@/components/header"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Nexora - Together in Care",
  description:
    "Connecting caregivers and families with healthcare professionals specializing in Intellectual and Developmental Disabilities",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${crimsonText.variable}`}>
        <Header />
        <main>
          <Suspense fallback={null}>{children}</Suspense>
        </main>
        <FloatingChatbot />
        <Analytics />
      </body>
    </html>
  )
}