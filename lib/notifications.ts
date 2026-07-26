import nodemailer from "nodemailer"
import { google } from "googleapis"

// ── Config ────────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nexoracare.com"
const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const BOOKINGS_SHEET_NAME = "Bookings"

// ── Zoho transporter ──────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: { user: process.env.ZOHO_EMAIL, pass: process.env.ZOHO_PASSWORD },
  })
}

// ── Email HTML template ───────────────────────────────────────────────────────

function buildEmailHtml({
  preheader,
  body,
  ctaLabel,
  ctaUrl,
}: {
  preheader: string
  body: string
  ctaLabel?: string
  ctaUrl?: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nexora</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;">
  <!-- Preheader (hidden) -->
  <span style="display:none;font-size:1px;color:#f4f5f7;max-height:0;overflow:hidden;">${preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);" cellpadding="0" cellspacing="0">

        <!-- Header -->
        <tr>
          <td style="background:#1a4a45;padding:24px 32px;text-align:center;">
            <img src="https://nexora-care-graphics.s3.us-east-1.amazonaws.com/nexora-icon.png" alt="Nexora"
              height="56" width="56"
              style="height:56px;width:56px;display:inline-block;border-radius:12px;" />
            <div style="color:#fff;font-size:16px;font-weight:700;margin-top:10px;letter-spacing:0.3px;">Nexora</div>
            <div style="color:#fff;font-size:12px;margin-top:3px;opacity:0.65;letter-spacing:0.5px;">Together in Care</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 24px;">
            ${body}
          </td>
        </tr>

        ${ctaLabel && ctaUrl ? `
        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <a href="${ctaUrl}"
              style="display:inline-block;background:#1a4a45;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:13px 28px;border-radius:8px;letter-spacing:0.3px;">
              ${ctaLabel}
            </a>
          </td>
        </tr>` : ""}

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
              Nexora &mdash; Together in Care &nbsp;&bull;&nbsp; <a href="${APP_URL}" style="color:#9ca3af;">nexoracare.com</a>
            </p>
            <p style="margin:0;font-size:11px;color:#c4c9d4;">
              You received this email because of an activity on your Nexora account.<br/>
              If you believe this is a mistake, please contact <a href="mailto:admin@nexoracare.com" style="color:#9ca3af;">admin@nexoracare.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Email types ───────────────────────────────────────────────────────────────

export interface BookingEmailData {
  bookingId: string
  caregiverName: string
  caregiverEmail: string
  professionalName: string
  professionalEmail: string
  specialization: string
  appointmentDate: Date
  duration: number
  consultationType: string
  fee: number
  notes?: string
}

async function sendMail(to: string, subject: string, html: string) {
  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"Nexora Care" <${process.env.ZOHO_EMAIL}>`,
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error(`[notifications] Failed to send email to ${to}:`, err)
    // Non-fatal — booking is already saved
  }
}

const formatDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

const formatTime = (d: Date) =>
  new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

// ── 1. New booking → caregiver receipt ───────────────────────────────────────

export async function sendBookingRequestedCaregiver(data: BookingEmailData) {
  const html = buildEmailHtml({
    preheader: `Your booking request with ${data.professionalName} has been sent`,
    body: `
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#111827;">Booking Request Sent</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">We've sent your request to ${data.professionalName}. They'll confirm shortly.</p>

      <div style="background:#f0fdf9;border:1px solid #d1fae5;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;width:40%;">Professional</td>
            <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${data.professionalName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Specialization</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;">${data.specialization}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Date</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;">${formatDate(data.appointmentDate)}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Time</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;">${formatTime(data.appointmentDate)}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Duration</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;">${data.duration} minutes</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Type</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;text-transform:capitalize;">${data.consultationType}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Fee</td>
            <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">₦${data.fee.toLocaleString()}</td>
          </tr>
          ${data.notes ? `
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;vertical-align:top;">Notes</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;">${data.notes}</td>
          </tr>` : ""}
        </table>
      </div>

      <p style="margin:0;font-size:13px;color:#6b7280;">
        You will receive another email once ${data.professionalName} confirms or declines your request.
        You can also track this booking in your <strong>Nexora dashboard</strong>.
      </p>`,
    ctaLabel: "View My Bookings",
    ctaUrl: `${APP_URL}/bookings`,
  })

  await sendMail(data.caregiverEmail, `Booking Request Sent — ${data.professionalName}`, html)
}

// ── 2. New booking → professional alert ──────────────────────────────────────

export async function sendBookingRequestedProfessional(data: BookingEmailData) {
  const html = buildEmailHtml({
    preheader: `${data.caregiverName} has requested an appointment with you`,
    body: `
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#111827;">New Booking Request</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
        <strong>${data.caregiverName}</strong> has requested an appointment. Please confirm or decline in your dashboard.
      </p>

      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;width:40%;">From</td>
            <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${data.caregiverName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Date Requested</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;">${formatDate(data.appointmentDate)}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Time</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;">${formatTime(data.appointmentDate)}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Duration</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;">${data.duration} minutes</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Type</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;text-transform:capitalize;">${data.consultationType}</td>
          </tr>
          ${data.notes ? `
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;vertical-align:top;">Notes</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;">${data.notes}</td>
          </tr>` : ""}
        </table>
      </div>

      <p style="margin:0;font-size:13px;color:#6b7280;">
        Please respond within 24 hours to confirm availability for this session.
      </p>`,
    ctaLabel: "Review Request",
    ctaUrl: `${APP_URL}/bookings`,
  })

  await sendMail(data.professionalEmail, `New Booking Request from ${data.caregiverName}`, html)
}

// ── 3. Booking confirmed → caregiver ─────────────────────────────────────────

export async function sendBookingConfirmedCaregiver(data: BookingEmailData) {
  const html = buildEmailHtml({
    preheader: `Your appointment with ${data.professionalName} is confirmed`,
    body: `
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#d1fae5;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:24px;text-align:center;">✓</div>
      </div>
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#111827;text-align:center;">Appointment Confirmed</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
        ${data.professionalName} has confirmed your appointment.
      </p>

      <div style="background:#f0fdf9;border:1px solid #d1fae5;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;width:40%;">Professional</td>
            <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${data.professionalName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Date</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;">${formatDate(data.appointmentDate)}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Time</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;">${formatTime(data.appointmentDate)}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Type</td>
            <td style="padding:5px 0;font-size:13px;color:#374151;text-transform:capitalize;">${data.consultationType}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6b7280;">Fee</td>
            <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">₦${data.fee.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <p style="margin:0;font-size:13px;color:#6b7280;">
        Please be ready at the scheduled time. If you need to reschedule or cancel, log in to your dashboard as early as possible.
      </p>`,
    ctaLabel: "View Appointment",
    ctaUrl: `${APP_URL}/bookings`,
  })

  await sendMail(data.caregiverEmail, `Appointment Confirmed — ${data.professionalName}`, html)
}

// ── 4. Booking declined → caregiver ──────────────────────────────────────────

export async function sendBookingDeclinedCaregiver(data: BookingEmailData) {
  const html = buildEmailHtml({
    preheader: `Your booking request with ${data.professionalName} was declined`,
    body: `
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#111827;">Booking Request Declined</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
        Unfortunately, <strong>${data.professionalName}</strong> was unable to accept your request for
        ${formatDate(data.appointmentDate)} at ${formatTime(data.appointmentDate)}.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
        This may be due to a scheduling conflict. You can try requesting a different time
        or browse other qualified professionals on Nexora.
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280;">
        We're sorry for the inconvenience. Our team is always working to connect you with the right care.
      </p>`,
    ctaLabel: "Find Another Professional",
    ctaUrl: `${APP_URL}/professionals`,
  })

  await sendMail(data.caregiverEmail, `Booking Request Declined — ${data.professionalName}`, html)
}

// ── 5. Professional approved ──────────────────────────────────────────────────

export async function sendProfessionalApproved(professionalEmail: string, professionalName: string) {
  const html = buildEmailHtml({
    preheader: `Your Nexora professional profile has been approved`,
    body: `
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#d1fae5;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:24px;text-align:center;">✓</div>
      </div>
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#111827;text-align:center;">Profile Approved!</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
        Congratulations, <strong>${professionalName}</strong>! Your professional profile has been reviewed and approved by the Nexora team.
      </p>
      <div style="background:#f0fdf9;border:1px solid #d1fae5;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:14px;color:#374151;font-weight:600;">What this means:</p>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:#6b7280;line-height:1.8;">
          <li>Your profile is now visible to caregivers on Nexora</li>
          <li>Caregivers can find you and book consultations</li>
          <li>You will receive booking requests via email and on your dashboard</li>
        </ul>
      </div>
      <p style="margin:0;font-size:13px;color:#6b7280;">
        Make sure your availability and consultation fee are up to date in your settings so caregivers can book you.
      </p>`,
    ctaLabel: "Go to Dashboard",
    ctaUrl: `${APP_URL}/dashboard`,
  })
  await sendMail(professionalEmail, "Your Nexora Profile Has Been Approved 🎉", html)
}

// ── 6. Professional rejected ──────────────────────────────────────────────────

export async function sendProfessionalRejected(professionalEmail: string, professionalName: string) {
  const html = buildEmailHtml({
    preheader: `An update on your Nexora professional profile application`,
    body: `
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#111827;">Application Update</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
        Dear <strong>${professionalName}</strong>, thank you for applying to join Nexora as a healthcare professional.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
        After reviewing your application, we are unable to approve your profile at this time. This may be due to incomplete information or credentials that could not be verified.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#6b7280;">
          If you believe this is an error or would like to provide additional information, please contact us at
          <a href="mailto:admin@nexoracare.com" style="color:#0f766e;">admin@nexoracare.com</a> and we will be happy to review your application again.
        </p>
      </div>`,
    ctaLabel: "Update Your Profile",
    ctaUrl: `${APP_URL}/settings`,
  })
  await sendMail(professionalEmail, "Update on Your Nexora Professional Application", html)
}

// ── Google Sheets ─────────────────────────────────────────────────────────────

function parsePrivateKey(raw: string | undefined): string {
  if (!raw) return ""
  // Amplify may store the key with literal \n or with real newlines — handle both
  let key = raw
  // If it doesn't contain real newlines but has \n sequences, replace them
  if (!key.includes("\n")) {
    key = key.replace(/\\n/g, "\n")
  }
  // Ensure the key has proper PEM structure
  key = key.trim()
  if (!key.startsWith("-----BEGIN")) {
    // May be base64-only without headers — unlikely but guard it
    console.error("[notifications] GOOGLE_PRIVATE_KEY does not start with PEM header")
  }
  return key
}

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
  return google.sheets({ version: "v4", auth })
}

const SHEET_HEADERS = [
  "Booking ID", "Date Submitted", "Caregiver Name", "Caregiver Email",
  "Professional Name", "Professional Email", "Specialization",
  "Appointment Date", "Appointment Time", "Duration (min)",
  "Consultation Type", "Fee (₦)", "Notes", "Status",
]

async function ensureSheetHeaders() {
  try {
    const sheets = await getSheetsClient()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${BOOKINGS_SHEET_NAME}!A1:N1`,
    })
    const existing = res.data.values?.[0]
    if (!existing || existing.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${BOOKINGS_SHEET_NAME}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [SHEET_HEADERS] },
      })
    }
  } catch {
    // Sheet tab may not exist — create it
    try {
      const sheets = await getSheetsClient()
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: BOOKINGS_SHEET_NAME } } }],
        },
      })
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${BOOKINGS_SHEET_NAME}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [SHEET_HEADERS] },
      })
    } catch (err) {
      console.error("[notifications] Could not create Bookings sheet tab:", err)
    }
  }
}

export async function appendBookingToSheet(data: BookingEmailData) {
  try {
    await ensureSheetHeaders()
    const sheets = await getSheetsClient()
    const now = new Date().toLocaleString("en-GB")
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${BOOKINGS_SHEET_NAME}!A:N`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          data.bookingId,
          now,
          data.caregiverName,
          data.caregiverEmail,
          data.professionalName,
          data.professionalEmail,
          data.specialization,
          formatDate(data.appointmentDate),
          formatTime(data.appointmentDate),
          data.duration,
          data.consultationType,
          data.fee,
          data.notes || "",
          "pending",
        ]],
      },
    })
  } catch (err) {
    console.error("[notifications] Failed to append booking to sheet:", err)
  }
}

export async function updateSheetBookingStatus(bookingId: string, status: string) {
  try {
    const sheets = await getSheetsClient()
    // Find the row with this booking ID (column A)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${BOOKINGS_SHEET_NAME}!A:A`,
    })
    const rows = res.data.values || []
    const rowIndex = rows.findIndex(r => r[0] === bookingId)
    if (rowIndex < 1) return // not found (0 = header)

    // Column N = Status (index 13, 1-based = 14)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${BOOKINGS_SHEET_NAME}!N${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [[status]] },
    })
  } catch (err) {
    console.error("[notifications] Failed to update sheet status:", err)
  }
}

// ── Helper: ensure any tab exists with given headers ─────────────────────────

async function ensureTab(tabName: string, headers: string[]) {
  // Two separate try/catch so a failure in one doesn't hide the real error
  let needsCreate = false

  try {
    const sheets = await getSheetsClient()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${tabName}!A1:1`,
    })
    if (!res.data.values?.[0]?.length) {
      // Tab exists but has no header — write headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${tabName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      })
    }
    return // tab exists and has headers — done
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string }
    if (e?.code === 400 || (e?.message && e.message.includes("Unable to parse range"))) {
      needsCreate = true
    } else {
      console.error(`[notifications] ensureTab check failed for "${tabName}":`, e?.message)
      needsCreate = true
    }
  }

  if (!needsCreate) return

  try {
    const sheets = await getSheetsClient()
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
    })
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${tabName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    })
  } catch (err: unknown) {
    const e = err as { message?: string }
    // If tab already exists (race condition), just continue — next append will work
    if (!e?.message?.includes("already exists")) {
      console.error(`[notifications] ensureTab create failed for "${tabName}":`, e?.message)
      throw err // re-throw so the caller's catch logs it
    }
  }
}

// ── Signups sheet ─────────────────────────────────────────────────────────────

const SIGNUP_HEADERS = ["Timestamp", "Role", "State", "Country", "IsSelfAdvocate"]

export async function appendSignupToSheet(data: { role: string; state: string; country: string; isSelfAdvocate: boolean }) {
  try {
    const sheets = await getSheetsClient()
    await ensureTab("Signups", SIGNUP_HEADERS)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Signups!A:E",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          new Date().toLocaleString("en-GB"),
          data.role,
          data.state,
          data.country,
          data.isSelfAdvocate ? "Yes" : "No",
        ]],
      },
    })
  } catch (err) {
    console.error("[notifications] Failed to append signup to sheet:", err)
  }
}

// ── Professionals sheet ───────────────────────────────────────────────────────

const PROFESSIONAL_HEADERS = [
  "Timestamp", "Name", "Email", "Specialization", "Location", "Experience (yrs)",
  "Consultation Fee (₦)", "Languages", "Verification Status", "Credential Verified",
]

export async function appendProfessionalToSheet(data: {
  name: string; email: string; specialization: string; location: string
  experience: number; consultationFee: number; languages: string[]
  verificationStatus: string; credentialVerified: boolean
}) {
  try {
    const sheets = await getSheetsClient()
    await ensureTab("Professionals", PROFESSIONAL_HEADERS)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Professionals!A:J",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          new Date().toLocaleString("en-GB"),
          data.name,
          data.email,
          data.specialization,
          data.location,
          data.experience,
          data.consultationFee,
          data.languages.join(", "),
          data.verificationStatus,
          data.credentialVerified ? "Yes" : "No",
        ]],
      },
    })
  } catch (err) {
    console.error("[notifications] Failed to append professional to sheet:", err)
  }
}

// ── ResearchEvents sheet ──────────────────────────────────────────────────────

const RESEARCH_HEADERS = [
  "Recorded At", "Pseudo Caregiver ID", "Specialization", "State",
  "Consultation Type", "Outcome", "Session Date", "Presenting Concern", "Confirmed Concern",
]

export async function appendResearchEventToSheet(data: {
  pseudoCaregiverId: string; specialization: string; state: string
  consultationType: string; outcome: string; sessionDate: Date
  presentingConcern?: string; confirmedConcern?: string
}) {
  try {
    const sheets = await getSheetsClient()
    await ensureTab("ResearchEvents", RESEARCH_HEADERS)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "ResearchEvents!A:I",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          new Date().toLocaleString("en-GB"),
          data.pseudoCaregiverId,
          data.specialization,
          data.state,
          data.consultationType,
          data.outcome,
          data.sessionDate.toLocaleDateString("en-GB"),
          data.presentingConcern || "",
          data.confirmedConcern || "",
        ]],
      },
    })
  } catch (err) {
    console.error("[notifications] Failed to append research event to sheet:", err)
  }
}
