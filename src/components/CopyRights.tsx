import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function CopyRights() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a className="text-sm text-muted-foreground">
          © Farhan Shahriyar | 2025-26
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <a className="text-sm text-muted-foreground" href="https://mdfarhanshahriyar2024.netlify.app/" target="_blank" rel="noreferrer">Portfolio</a>
      </TooltipContent>
    </Tooltip>
  )
}
