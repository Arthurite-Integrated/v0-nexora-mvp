import { BadgeCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CredentialBadgeProps {
  size?: number
  className?: string
}

export function CredentialBadge({ size = 16, className = "" }: CredentialBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <BadgeCheck
            className={`text-emerald-500 shrink-0 ${className}`}
            style={{ width: size, height: size }}
            aria-label="Credentials verified"
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Credentials verified by Nexora
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
