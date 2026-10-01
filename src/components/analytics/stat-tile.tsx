import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn, formatNumber, percentChange } from "@/lib/utils"

type Props = {
  label: string
  value: number | string
  icon?: React.ComponentType<{ className?: string }>
  current?: number
  previous?: number
  hint?: string
}

/** Tuile chiffre clé : libellé, valeur, variation signée par rapport à la période précédente. */
export function StatTile({ label, value, icon: Icon, current, previous, hint }: Props) {
  const delta = current !== undefined && previous !== undefined ? percentChange(current, previous) : undefined
  return (
    <Card className="gap-0 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && (
          <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{typeof value === "number" ? formatNumber(value) : value}</p>
      <div className="mt-1 flex items-center gap-1.5 text-xs">
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
              delta === null || delta > 0
                ? "bg-success/10 text-success"
                : delta < 0
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {delta === null || delta > 0 ? (
              <ArrowUpRight className="size-3" aria-hidden />
            ) : delta < 0 ? (
              <ArrowDownRight className="size-3" aria-hidden />
            ) : (
              <Minus className="size-3" aria-hidden />
            )}
            {delta === null ? "Nouveau" : `${delta > 0 ? "+" : ""}${delta.toFixed(Math.abs(delta) < 10 ? 1 : 0).replace(".", ",")} %`}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  )
}
