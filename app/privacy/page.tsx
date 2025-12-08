import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
            ← Back to Home
          </Link>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-slate-900">Privacy Policy</CardTitle>
            <p className="text-slate-600 mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 mb-4">
                Welcome to Nexora. We are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform 
                to connect caregivers with healthcare professionals specializing in intellectual and developmental disabilities (IDD).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Account credentials (encrypted passwords)</li>
                <li>Profile information including role (caregiver or professional)</li>
                <li>For professionals: credentials, specializations, experience, and location</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">2.2 Health Information</h3>
              <p className="text-slate-700 mb-4">
                We may collect limited health-related information necessary to facilitate care coordination. 
                This information is handled with the highest level of security and in compliance with applicable healthcare privacy laws.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">2.3 Usage Data</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
                <li>Log data including IP address, browser type, and access times</li>
                <li>Platform usage patterns and interactions</li>
                <li>Booking and appointment information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
                <li>To create and manage your account</li>
                <li>To facilitate connections between caregivers and healthcare professionals</li>
                <li>To process bookings and appointments</li>
                <li>To communicate with you about services, updates, and support</li>
                <li>To improve our platform and user experience</li>
                <li>To ensure platform security and prevent fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-slate-700 mb-4">We do not sell your personal information. We may share your information only in the following circumstances:</p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
                <li><strong>With Other Users:</strong> Profile information is shared to facilitate connections (e.g., professional profiles visible to caregivers)</li>
                <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform (e.g., hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Data Security</h2>
              <p className="text-slate-700 mb-4">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and monitoring</li>
                <li>Compliance with healthcare data protection standards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-slate-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
                <li>Access and review your personal information</li>
                <li>Request corrections to inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Data Retention</h2>
              <p className="text-slate-700 mb-4">
                We retain your information for as long as your account is active or as needed to provide services. 
                After account deletion, we may retain certain information for legal compliance, dispute resolution, and legitimate business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Children's Privacy</h2>
              <p className="text-slate-700 mb-4">
                Our platform is not intended for children under 18. We do not knowingly collect information from children. 
                If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-slate-700 mb-4">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notification. 
                Your continued use of the platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Contact Us</h2>
              <p className="text-slate-700 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700">Email: admin@nexoracare.com</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
