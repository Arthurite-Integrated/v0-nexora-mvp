import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { google } from "googleapis"

// Configure Zoho mail transporter
const createZohoTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.ZOHO_EMAIL,
      pass: process.env.ZOHO_PASSWORD,
    },
  })
}

// Configure Google Sheets API
const getGoogleSheetsClient = async () => {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  
  if (!privateKey || !process.env.GOOGLE_CLIENT_EMAIL) {
    throw new Error('Missing Google credentials')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file"
    ],
  })

  const sheets = google.sheets({ version: "v4", auth })
  return sheets
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Check if required environment variables exist
    if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD) {
      console.error('Missing Zoho credentials')
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      console.error('Missing Google Sheets credentials')
      return NextResponse.json({ error: "Spreadsheet service not configured" }, { status: 500 })
    }

    let emailSent = false
    let sheetUpdated = false

    // 1. Send welcome email via Zoho
    try {
      const transporter = createZohoTransporter()
      
      const mailOptions = {
       from: `"Nexora Care Team" <${process.env.ZOHO_EMAIL}>`,
        to: email,
        subject: "Thank you for your interest in Nexora Care!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Nexora Care</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0f766e; margin-bottom: 10px;">Thank You for Your Interest!</h1>
            </div>
            
            <div style="background-color: #f0fdfa; padding: 20px; border-radius: 8px; border-left: 4px solid #0f766e; margin-bottom: 20px;">
              <p style="margin: 0 0 15px 0;">Hello!</p>
              <p style="margin: 0 0 15px 0;">Thank you for signing up to be notified about our healthcare professionals directory. We're working hard to connect families and caregivers with qualified specialists in Intellectual and Developmental Disabilities.</p>
              <p style="margin: 0;">We'll keep you updated on our progress and let you know as soon as the directory is available!</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #0f766e; margin-bottom: 15px;">What to Expect:</h3>
              <ul style="padding-left: 20px;">
                <li style="margin-bottom: 8px;">Updates on our launch timeline</li>
                <li style="margin-bottom: 8px;">Early access to the professionals directory</li>
                <li style="margin-bottom: 8px;">Resources and tips for IDD care</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Best regards,<br>
                The Nexora Care Team
              </p>
            </div>
          </body>
          </html>
        `,
        text: `
          Thank You for Your Interest!
          
          Hello!
          
          Thank you for signing up to be notified about our healthcare professionals directory. We're working hard to connect families and caregivers with qualified specialists in Intellectual and Developmental Disabilities.
          
          We'll keep you updated on our progress and let you know as soon as the directory is available!
          
          What to Expect:
          - Updates on our launch timeline
          - Early access to the professionals directory
          - Resources and tips for IDD care
          
          Best regards,
          The Nexora Care Team
        `
      }

      await transporter.sendMail(mailOptions)
      emailSent = true
      console.log('Email sent successfully to:', email)

    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Continue to try Google Sheets even if email fails
    }

    // 2. Add email to Google Sheets
    try {
      const sheets = await getGoogleSheetsClient()
      const spreadsheetId = process.env.GOOGLE_SHEET_ID
      
      const currentDate = new Date().toISOString()
      const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })

      const result = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A:C", // Assumes columns: Email, Date, Timestamp
        valueInputOption: "RAW",
        requestBody: {
          values: [[email, formattedDate, currentDate]]
        }
      })

      sheetUpdated = true
      console.log('Sheet updated successfully:', result.data)

    } catch (sheetError) {
      console.error('Google Sheets update failed:', sheetError)
      
      // Provide specific error messages
      if (
        typeof sheetError === "object" &&
        sheetError !== null &&
        "code" in sheetError &&
        (sheetError as { code?: number }).code === 403
      ) {
        console.error('Permission denied. Make sure:')
        console.error('1. Service account email has been shared with the sheet')
        console.error('2. Service account has Editor permissions')
        console.error('3. Google Sheets API is enabled')
      }
      
      // Don't fail the entire request if only sheets fails
    }

    // Return success if at least one service worked
    if (emailSent || sheetUpdated) {
      let message = "Thank you! You'll be notified when we launch."
      
      if (!emailSent) {
        message += " (Note: Confirmation email may be delayed)"
      }
    //   if (!sheetUpdated) {
    //     console.log("Sheet update failed but email was sent")
    //   }

      return NextResponse.json({ 
        success: true, 
        message,
        emailSent,
        sheetUpdated
      })
    } else {
      return NextResponse.json(
        { error: "Both email and sheet services failed. Please try again." },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Notification signup error:", error)
    return NextResponse.json(
      { error: "Failed to process signup. Please try again." },
      { status: 500 }
    )
  }
}
