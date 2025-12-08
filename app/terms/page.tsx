import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfServicePage() {
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
            <CardTitle className="text-3xl font-bold text-slate-900">Terms of Service</CardTitle>
            <p className="text-slate-600 mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-700 mb-4">
                By accessing or using Nexora ("the Platform"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the Platform. These terms constitute a legally binding 
                agreement between you and Nexora.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
              <p className="text-slate-700 mb-4">
                Nexora is a platform that connects caregivers and family members with healthcare professionals specializing 
                in intellectual and developmental disabilities (IDD). The Platform facilitates:
              </p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
                <li>Professional profile discovery and search</li>
                <li>Appointment booking and scheduling</li>
                <li>Communication between caregivers and professionals</li>
                <li>Reviews and ratings</li>
              </ul>
              <p className="text-slate-700 mb-4">
                <strong>Important:</strong> Nexora is a platform service only. We do not provide medical advice, diagnosis, 
                or treatment. All healthcare services are provided directly by independent healthcare professionals.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.1 Account Creation</h3>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.2 Professional Accounts</h3>
              <p className="text-slate-700 mb-4">Healthcare professionals must:</p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
                <li>Hold valid licenses and credentials in their jurisdiction</li>
                <li>Maintain current professional liability insurance</li>
                <li>Provide accurate information about qualifications and experience</li>
                <li>Comply with all applicable healthcare regulations and standards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. User Conduct</h2>
              <p className="text-slate-700 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
                <li>Provide false or misleading information</li>
                <li>Impersonate another person or entity</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any laws or regulations</li>
                <li>Interfere with the Platform's operation or security</li>
                <li>Use the Platform for unauthorized commercial purposes</li>
                <li>Share or disclose confidential patient information without authorization</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Bookings and Appointments</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.1 Booking Process</h3>
              <p className="text-slate-700 mb-4">
                Caregivers can book appointments with professionals through the Platform. All bookings are subject to 
                professional availability and acceptance.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.2 Cancellations</h3>
              <p className="text-slate-700 mb-4">
                Cancellation policies are set by individual professionals. Users should review cancellation terms before booking.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.3 No-Shows</h3>
              <p className="text-slate-700 mb-4">
                Repeated no-shows may result in account restrictions or termination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Payments and Fees</h2>
              <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
                <li>Payment terms and fees are determined by individual professionals</li>
                <li>Nexora may charge platform fees for facilitating connections</li>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>You are responsible for any applicable taxes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Intellectual Property</h2>
              <p className="text-slate-700 mb-4">
                All content on the Platform, including text, graphics, logos, and software, is owned by Nexora or its licensors 
                and protected by intellectual property laws. You may not copy, modify, or distribute Platform content without permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-slate-700 mb-4">
                Your use of the Platform is subject to our Privacy Policy. By using the Platform, you consent to our collection 
                and use of information as described in the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Disclaimers</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">9.1 No Medical Advice</h3>
              <p className="text-slate-700 mb-4">
                Nexora does not provide medical advice, diagnosis, or treatment. All healthcare services are provided by 
                independent professionals. We are not responsible for the quality or outcomes of services provided.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">9.2 Platform Availability</h3>
              <p className="text-slate-700 mb-4">
                The Platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">9.3 Professional Verification</h3>
              <p className="text-slate-700 mb-4">
                While we make reasonable efforts to verify professional credentials, we do not guarantee the accuracy of 
                information provided by professionals. Users should conduct their own due diligence.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-slate-700 mb-4">
                To the maximum extent permitted by law, Nexora shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of the Platform. Our total liability shall not exceed 
                the amount you paid to Nexora in the past 12 months.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Indemnification</h2>
              <p className="text-slate-700 mb-4">
                You agree to indemnify and hold harmless Nexora from any claims, damages, or expenses arising from your use 
                of the Platform, violation of these terms, or infringement of any rights of another party.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Termination</h2>
              <p className="text-slate-700 mb-4">
                We reserve the right to suspend or terminate your account at any time for violation of these terms or for any 
                other reason. You may terminate your account at any time by contacting us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Dispute Resolution</h2>
              <p className="text-slate-700 mb-4">
                Any disputes arising from these terms shall be resolved through binding arbitration in accordance with the 
                rules of the American Arbitration Association. You waive your right to participate in class action lawsuits.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Changes to Terms</h2>
              <p className="text-slate-700 mb-4">
                We may modify these terms at any time. We will notify you of material changes via email or platform notification. 
                Your continued use after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">15. Governing Law</h2>
              <p className="text-slate-700 mb-4">
                These terms are governed by the laws of [Your State/Country], without regard to conflict of law principles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">16. Contact Information</h2>
              <p className="text-slate-700 mb-4">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700">Email: admin@nexoracare.com</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">17. Severability</h2>
              <p className="text-slate-700 mb-4">
                If any provision of these terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
