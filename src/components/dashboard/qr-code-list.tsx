"use client"

import { BarChart3, LayoutGrid, List, Lock, Pause, Plus, Search, SearchX, Zap } from "lucide-react"
import Link from "next/link"
import { useMemo, useRef, useState } from "react"

import { QrImage } from "@/components/qr/qr-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { summarizeContent, type QrContent, type QrType } from "@/lib/qr/content"
import type { QrDesign } from "@/lib/qr/design"
import { TYPE_META, TYPE_ORDER } from "@/lib/qr/meta"
import { qrPayload } from "@/lib/qr/payload"
import { cn, formatDate, formatNumber, timeAgo } from "@/lib/utils"
import { QrActionsMenu } from "./qr-actions"

export type ListedCode = {
  id: string
  name: string
  type: QrType
  data: QrContent
  design: QrDesign
  isDynamic: boolean
  shortCode: string
  status: "active" | "paused"
  scanCount: number
  lastScannedAt: Date | null
  createdAt: Date
}

type Sort = "recent" | "name" | "scans"
type Kind = "all" | "dynamic" | "static" | "paused"

export function QrCodeList({ codes }: { codes: ListedCode[] }) {
  const [query, setQuery] = useState("")
  const [type, setType] = useState<"all" | QrType>("all")
  const [kind, setKind] = useState<Kind>("all")
  const [sort, setSort] = useState<Sort>("recent")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return codes
      .filter((c) => type === "all" || c.type === type)
      .filter((c) =>
        kind === "all" ? true : kind === "dynamic" ? c.isDynamic : kind === "static" ? !c.isDynamic : c.status === "paused",
      )
      .filter((c) => !q || c.name.toLowerCase().includes(q) || summarizeContent(c.type, c.data).toLowerCase().includes(q))
      .sort((a, b) =>
        sort === "name"
          ? a.name.localeCompare(b.name, "fr")
          : sort === "scans"
            ? b.scanCount - a.scanCount
            : +new Date(b.createdAt) - +new Date(a.createdAt),
      )
  }, [codes, query, type, kind, sort])

  const presentTypes = TYPE_ORDER.filter((t) => codes.some((c) => c.type === t))

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom ou contenu…"
            className="bg-card pl-9"
            aria-label="Rechercher"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
            <SelectTrigger className="w-40 bg-card" aria-label="Filtrer par mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les modes</SelectItem>
              <SelectItem value="dynamic">Dynamiques</SelectItem>
              <SelectItem value="static">Statiques</SelectItem>
              <SelectItem value="paused">En pause</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={(v) => setType(v as "all" | QrType)}>
            <SelectTrigger className="w-40 bg-card" aria-label="Filtrer par type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {presentTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_META[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="w-40 bg-card" aria-label="Trier">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récents</SelectItem>
              <SelectItem value="scans">Plus scannés</SelectItem>
              <SelectItem value="name">Nom (A → Z)</SelectItem>
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as "grid" | "list")}
            variant="outline"
            className="bg-card"
          >
            <ToggleGroupItem value="grid" aria-label="Vue en grille">
              <LayoutGrid />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Vue en liste">
              <List />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} QR code{filtered.length > 1 ? "s" : ""}
        {filtered.length !== codes.length && ` sur ${codes.length}`}
      </p>

      {filtered.length === 0 ? (
        <Card className="items-center py-16 text-center">
          <SearchX className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Aucun résultat</p>
            <p className="text-sm text-muted-foreground">Modifiez vos filtres ou créez un nouveau QR code.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/codes/new">
              <Plus /> Créer un QR code
            </Link>
          </Button>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((code) => (
            <GridCard key={code.id} code={code} />
          ))}
        </div>
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <div className="hidden grid-cols-[minmax(0,1fr)_120px_110px_130px_44px] gap-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid">
            <span>QR code</span>
            <span>Mode</span>
            <span className="text-right">Scans</span>
            <span>Créé le</span>
            <span />
          </div>
          {filtered.map((code) => (
            <ListRow key={code.id} code={code} />
          ))}
        </Card>
      )}
    </div>
  )
}

function ModeBadge({ code }: { code: ListedCode }) {
  if (code.isDynamic && code.status === "paused")
    return (
      <Badge variant="outline" className="gap-1 border-warning/40 text-warning">
        <Pause className="size-3" /> En pause
      </Badge>
    )
  return code.isDynamic ? (
    <Badge variant="secondary" className="gap-1">
      <Zap className="size-3 text-primary" /> Dynamique
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Lock className="size-3" /> Statique
    </Badge>
  )
}

function GridCard({ code }: { code: ListedCode }) {
  const svgRef = useRef<string | null>(null)
  const meta = TYPE_META[code.type]
  return (
    <Card className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg">
      <Link
        href={`/dashboard/codes/${code.id}`}
        className="relative grid place-items-center border-b bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklch,var(--primary)_7%,transparent),transparent_70%)] p-6"
      >
        <div className={cn("w-40 transition-transform duration-300 group-hover:scale-[1.03]", code.status === "paused" && "opacity-40 grayscale")}>
          <QrImage payload={qrPayload(code)} design={code.design} onRender={(svg) => (svgRef.current = svg)} alt={code.name} />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md"
            style={{ background: `color-mix(in oklch, ${meta.accent} 14%, transparent)`, color: meta.accent }}
          >
            <meta.icon className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <Link href={`/dashboard/codes/${code.id}`} className="block truncate font-medium hover:underline">
              {code.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{summarizeContent(code.type, code.data)}</p>
          </div>
          <QrActionsMenu code={code} getSvg={() => svgRef.current} />
        </div>
        <div className="flex items-center justify-between">
          <ModeBadge code={code} />
          {code.isDynamic ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <BarChart3 className="size-3.5" />
              <span className="font-medium text-foreground tabular-nums">{formatNumber(code.scanCount)}</span> scans
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{formatDate(code.createdAt)}</span>
          )}
        </div>
      </div>
    </Card>
  )
}

function ListRow({ code }: { code: ListedCode }) {
  const svgRef = useRef<string | null>(null)
  const meta = TYPE_META[code.type]
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-4 border-b px-4 py-3 last:border-0 hover:bg-muted/30 md:grid-cols-[minmax(0,1fr)_120px_110px_130px_44px]">
      <Link href={`/dashboard/codes/${code.id}`} className="flex min-w-0 items-center gap-3">
        <div className={cn("size-12 shrink-0 overflow-hidden rounded-md border bg-white p-0.5", code.status === "paused" && "opacity-40")}>
          <QrImage payload={qrPayload(code)} design={code.design} onRender={(svg) => (svgRef.current = svg)} alt={code.name} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{code.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {meta.label} · {summarizeContent(code.type, code.data)}
          </p>
        </div>
      </Link>
      <div className="hidden md:block">
        <ModeBadge code={code} />
      </div>
      <div className="hidden text-right text-sm tabular-nums md:block">
        {code.isDynamic ? (
          <>
            <span className="font-medium">{formatNumber(code.scanCount)}</span>
            {code.lastScannedAt && (
              // Le temps relatif peut différer d'une minute entre le rendu serveur et l'hydratation.
              <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                {timeAgo(code.lastScannedAt)}
              </p>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      <span className="hidden text-sm text-muted-foreground md:block">{formatDate(code.createdAt)}</span>
      <QrActionsMenu code={code} getSvg={() => svgRef.current} />
    </div>
  )
}
