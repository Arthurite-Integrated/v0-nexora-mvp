"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string) => void
  folder?: string
  shape?: "circle" | "square"
  size?: number
  label?: string
  role?: string
}

export function ImageUpload({
  value,
  onChange,
  folder = "general",
  shape = "circle",
  size = 96,
  label = "Upload photo",
  role,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB")
      return
    }

    setError("")
    setIsUploading(true)

    try {
      // 1. Get presigned POST data
      const presignRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, folder }),
      })

      if (!presignRes.ok) {
        const d = await presignRes.json()
        throw new Error(d.error || "Failed to get upload URL")
      }

      const { uploadUrl, publicUrl } = await presignRes.json()

      // 2. Upload directly to S3 using presigned PUT
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!uploadRes.ok) throw new Error("Upload to S3 failed")

      onChange(publicUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-lg"

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 ${radiusClass} flex items-center justify-center cursor-pointer hover:border-primary transition-colors`}
        style={{ width: size, height: size }}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <Image
            src={value}
            alt="Profile"
            fill
            className={`object-cover ${radiusClass}`}
          />
        ) : (
          <Image
            src={role === "professional" ? "/avatar-professional.svg" : "/avatar-caregiver.svg"}
            alt="Default avatar"
            fill
            className={`object-cover ${radiusClass} opacity-60`}
          />
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="text-xs"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Uploading...
          </>
        ) : (
          label
        )}
      </Button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
