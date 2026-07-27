import Image from "next/image"

interface UserAvatarProps {
  src?: string | null
  name: string
  role?: "professional" | "caregiver" | "admin" | string
  size?: number
  className?: string
}

function fallbackSrc(role?: string) {
  if (role === "professional") return "/avatar-professional.svg"
  return "/avatar-caregiver.svg"
}

export function UserAvatar({ src, name, role, size = 40, className = "" }: UserAvatarProps) {
  const fb = fallbackSrc(role)

  if (src) {
    return (
      <div
        className={`relative overflow-hidden rounded-full bg-muted shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = fb }}
        />
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-full shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image src={fb} alt={name} fill className="object-cover" />
    </div>
  )
}

/** Inline version with initials fallback for places where Next/Image isn't needed */
export function AvatarInitials({
  name,
  role,
  size = 36,
  className = "",
}: {
  name: string
  role?: string
  size?: number
  className?: string
}) {
  const bg = role === "professional" ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"
  const initials = name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 font-semibold ${bg} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={name}
    >
      {initials}
    </div>
  )
}
