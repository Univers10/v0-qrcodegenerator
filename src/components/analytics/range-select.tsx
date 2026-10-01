"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "90d", label: "90 derniers jours" },
  { value: "365d", label: "12 derniers mois" },
]

export function RangeSelect({ value }: { value: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        const next = new URLSearchParams(params)
        next.set("range", v)
        startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }))
      }}
    >
      <SelectTrigger className={cn("w-44 bg-card", pending && "opacity-60")} aria-label="Période">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
