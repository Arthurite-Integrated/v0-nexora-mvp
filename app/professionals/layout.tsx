import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find IDD Specialists",
  description:
    "Browse and book verified healthcare professionals specialising in Intellectual and Developmental Disabilities across Nigeria — speech therapists, developmental paediatricians, ABA practitioners, and more.",
  alternates: { canonical: "/professionals" },
  openGraph: {
    title: "Find IDD Healthcare Professionals in Nigeria — Nexora",
    description:
      "Verified IDD specialists across Nigeria. Filter by specialisation, location, and language. Book a consultation today.",
  },
}

export default function ProfessionalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
