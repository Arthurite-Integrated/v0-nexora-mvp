import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import { connectDB } from "@/lib/mongodb"
import { Professional } from "@/lib/models/Professional"

export async function GET(req: NextRequest) {
  return requireAdmin(req, async (req) => {
    try {
      await connectDB()

      const { searchParams } = new URL(req.url)
      const status = searchParams.get("status") || "pending"

      const query: Record<string, unknown> = {}
      if (status === "completed") {
        query.verificationStatus = { $in: ["verified", "rejected"] }
      } else {
        query.verificationStatus = status
      }

      const professionals = await Professional.find(query)
        .sort({ createdAt: -1 })
        .lean()

      const counts = await Professional.aggregate([
        { $group: { _id: "$verificationStatus", count: { $sum: 1 } } },
      ])

      const stats = { pending: 0, under_review: 0, verified: 0, rejected: 0 }
      for (const c of counts) {
        if (c._id in stats) stats[c._id as keyof typeof stats] = c.count
      }

      return NextResponse.json({ professionals, stats })
    } catch {
      return NextResponse.json({ error: "Failed to fetch verifications" }, { status: 500 })
    }
  })
}
