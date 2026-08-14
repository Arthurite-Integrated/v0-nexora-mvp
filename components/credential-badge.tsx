import { BadgeCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CredentialBadgeProps {
  size?: number
  className?: string
  label?: string
  description?: string
}

export function CredentialBadge({
  size = 16,
  className = "",
  label = "Credentials verified",
  description = "This professional's degrees, licences, and certifications have been reviewed and confirmed by Nexora.",
}: CredentialBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <BadgeCheck
            className={`fill-primary text-primary-foreground shrink-0 drop-shadow-sm ${className}`}
            style={{ width: size, height: size }}
            aria-label={label}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[220px]">
          <p className="font-semibold mb-0.5">{label}</p>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
