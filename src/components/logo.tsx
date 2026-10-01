import Link from "next/link"

import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.6 0.22 277)" />
          <stop offset="1" stopColor="oklch(0.62 0.2 320)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#logo-g)" />
      <g fill="none" stroke="white" strokeWidth="2.2">
        <rect x="7" y="7" width="7.5" height="7.5" rx="2.4" />
        <rect x="17.5" y="7" width="7.5" height="7.5" rx="2.4" />
        <rect x="7" y="17.5" width="7.5" height="7.5" rx="2.4" />
      </g>
      <g fill="white">
        <circle cx="19.2" cy="19.2" r="1.7" />
        <circle cx="23.6" cy="19.2" r="1.7" opacity=".7" />
        <circle cx="19.2" cy="23.6" r="1.7" opacity=".7" />
        <circle cx="23.6" cy="23.6" r="1.7" />
      </g>
    </svg>
  )
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span className="text-[15px] whitespace-nowrap">
        QR <span className="text-muted-foreground">Creator</span>
      </span>
    </Link>
  )
}
