import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { appendNewsletterToSheet } from "@/lib/notifications"

// Simple in-memory dedup isn't enough across Lambda instances —
// use MongoDB as the source of truth for already-subscribed emails
import mongoose, { Schema, model, models } from "mongoose"

const SubscriberSchema = new Schema(
  { email: { type: String, required: true, unique: true, lowercase: true } },
  { timestamps: true }
)
const Subscriber = models.Subscriber || model("Subscriber", SubscriberSchema)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    await connectDB()

    // Check for existing subscriber
    const existing = await Subscriber.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ message: "You're already subscribed — thank you!" })
    }

    await Subscriber.create({ email: email.toLowerCase() })

    await appendNewsletterToSheet({ email: email.toLowerCase() })
      .catch(err => console.error("[newsletter] sheet error:", err))

    return NextResponse.json({ message: "Subscribed! Thank you for joining." }, { status: 201 })
  } catch (err: unknown) {
    const e = err as { code?: number }
    if (e?.code === 11000) {
      return NextResponse.json({ message: "You're already subscribed — thank you!" })
    }
    console.error("[newsletter] error:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
