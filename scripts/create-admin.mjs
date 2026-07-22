/**
 * Creates an admin user in both Cognito and MongoDB.
 *
 * Usage:
 *   node scripts/create-admin.mjs <email> <name> <password>
 *
 * Example:
 *   node scripts/create-admin.mjs paul@nexoracare.com "Paul Aderoju" "Admin@1234"
 */

import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import mongoose from "mongoose"
import { config } from "dotenv"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../.env.local") })

const [, , email, name, password] = process.argv

if (!email || !name || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <name> <password>")
  process.exit(1)
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters")
  process.exit(1)
}

const REGION = process.env.AWS_REGION || "us-east-1"
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID
const MONGODB_URI = process.env.MONGODB_URI

if (!USER_POOL_ID || !MONGODB_URI) {
  console.error("COGNITO_USER_POOL_ID and MONGODB_URI must be set in .env.local")
  process.exit(1)
}

// Admin operations require the nexora-admin profile, not the app user
import { fromIni } from "@aws-sdk/credential-providers"

const cognito = new CognitoIdentityProviderClient({
  region: REGION,
  credentials: fromIni({ profile: "nexora-admin" }),
})

// ── 1. Create Cognito user ────────────────────────────────────────────────────
console.log(`\nCreating Cognito user for ${email}...`)

let cognitoId

try {
  const result = await cognito.send(new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    TemporaryPassword: password,
    MessageAction: "SUPPRESS", // don't send welcome email
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "email_verified", Value: "true" },
      { Name: "name", Value: name },
      { Name: "custom:role", Value: "admin" },
    ],
  }))

  cognitoId = result.User.Attributes.find(a => a.Name === "sub")?.Value

  // Set permanent password (bypass FORCE_CHANGE_PASSWORD state)
  await cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    Password: password,
    Permanent: true,
  }))

  // Add to admins group
  await cognito.send(new AdminAddUserToGroupCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    GroupName: "admins",
  }))

  console.log(`✓ Cognito user created (sub: ${cognitoId})`)
} catch (err) {
  if (err.name === "UsernameExistsException") {
    console.error("A Cognito user with this email already exists.")
  } else {
    console.error("Cognito error:", err.message)
  }
  process.exit(1)
}

// ── 2. Create MongoDB profile ────────────────────────────────────────────────
console.log("Creating MongoDB profile...")

await mongoose.connect(MONGODB_URI)

const UserSchema = new mongoose.Schema({
  cognitoId: String,
  email: String,
  name: String,
  role: String,
  phone: String,
  location: String,
  profileImage: String,
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model("User", UserSchema)

const existing = await User.findOne({ email: email.toLowerCase() })
if (existing) {
  console.log("MongoDB profile already exists — updating role to admin...")
  await User.findByIdAndUpdate(existing._id, { role: "admin", cognitoId })
} else {
  await User.create({ cognitoId, email: email.toLowerCase(), name, role: "admin" })
}

console.log("✓ MongoDB profile saved")

await mongoose.disconnect()

console.log(`\n✅ Admin account ready.`)
console.log(`   Email:    ${email}`)
console.log(`   Password: ${password}`)
console.log(`   Sign in at /login\n`)
