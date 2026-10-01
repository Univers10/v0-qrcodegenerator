import { cn, formatNumber } from "@/lib/utils"

type Item = { key: string; value: number; label?: React.ReactNode }

/** Classement horizontal : une seule couleur, barre fine, valeur et part visibles en texte. */
export function BreakdownList({ items, empty = "Aucune donnée", className }: { items: Item[]; empty?: string; className?: string }) {
  const total = items.reduce((sum, i) => sum + i.value, 0)
  const max = Math.max(1, ...items.map((i) => i.value))
  if (items.length === 0 || total === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>
  }
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item.key} className="group">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{item.label ?? item.key}</span>
            <span className="shrink-0 tabular-nums">
              <span className="font-medium">{formatNumber(item.value)}</span>
              <span className="ml-1.5 text-xs text-muted-foreground">{Math.round((item.value / total) * 100)} %</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-chart-1 transition-[width] duration-700"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
