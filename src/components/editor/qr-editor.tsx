"use client"

import { BarChart3, Eye, Link2, Loader2, Lock, Pencil, Save, Sparkles, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react"
import { toast } from "sonner"

import { DownloadPanel } from "@/components/qr/download-panel"
import { QrImage } from "@/components/qr/qr-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createQrAction, updateQrAction } from "@/lib/actions"
import { useSession } from "@/lib/auth/client"
import {
  defaultContent,
  DYNAMIC_ONLY_TYPES,
  encodeContent,
  fitsInQr,
  parseContent,
  summarizeContent,
  type QrContent,
  type QrType,
} from "@/lib/qr/content"
import { DEFAULT_DESIGN, parseDesign, type QrDesign } from "@/lib/qr/design"
import { TYPE_META } from "@/lib/qr/meta"
import { shortUrl } from "@/lib/site"
import { cn } from "@/lib/utils"
import { ContentForm } from "./content-form"
import { DesignPanel } from "./design-panel"
import { MenuPreviewButton } from "./menu-preview"
import { ScanabilityBadge } from "./scanability-badge"
import { TypePicker } from "./type-picker"

export const DRAFT_KEY = "qrc:draft"
const PLACEHOLDER_PAYLOAD = "https://qrcreator.app"
const PLACEHOLDER_SHORT = "aBcD3fG"

export type EditorInitial = {
  id: string
  name: string
  type: QrType
  data: QrContent
  design: QrDesign
  isDynamic: boolean
  shortCode: string
}

type Props =
  | { mode: "public"; initial?: undefined; fromDraft?: undefined; initialType?: QrType }
  | { mode: "create"; initial?: undefined; fromDraft?: boolean; initialType?: QrType }
  | { mode: "edit"; initial: EditorInitial; fromDraft?: undefined; initialType?: undefined }

type Values = Record<string, unknown>

type Draft = { type: QrType; data: Values; design: QrDesign }

// Lecture unique et mise en cache : l'instantané reste stable même après suppression du brouillon.
// Le cache est invalidé à chaque écriture d'un nouveau brouillon (enregistrement depuis le générateur public).
let cachedDraft: Draft | null | undefined
function readDraft(): Draft | null {
  if (cachedDraft !== undefined) return cachedDraft
  cachedDraft = null
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    const draft = raw ? (JSON.parse(raw) as { type: QrType; data: Values; design: unknown }) : null
    if (draft && draft.type in TYPE_META) cachedDraft = { type: draft.type, data: draft.data, design: parseDesign(draft.design) }
  } catch {
    /* brouillon illisible : ignoré */
  }
  return cachedDraft
}
const noopSubscribe = () => () => {}

export function QrEditor(props: Props) {
  // Reprise d'un brouillon créé depuis le générateur public avant l'inscription.
  const draft = useSyncExternalStore(
    noopSubscribe,
    () => (props.mode === "create" && props.fromDraft ? readDraft() : null),
    () => null,
  )
  // La clé force un nouveau montage quand le brouillon devient disponible après hydratation.
  return <EditorInner key={draft ? "draft" : "base"} {...props} draft={draft} />
}

function EditorInner({ mode, initial, initialType, draft }: Props & { draft: Draft | null }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [type, setType] = useState<QrType>(initial?.type ?? draft?.type ?? initialType ?? "url")
  const [dataByType, setDataByType] = useState<Partial<Record<QrType, Values>>>(() =>
    initial ? { [initial.type]: initial.data as Values } : draft ? { [draft.type]: draft.data } : {},
  )
  const [design, setDesign] = useState<QrDesign>(
    () =>
      initial?.design ??
      draft?.design ??
      // Arrivée directe sur un menu : cadre « MENU » proposé d'emblée.
      (initialType === "menu"
        ? { ...DEFAULT_DESIGN, frame: { ...DEFAULT_DESIGN.frame, style: "bottom", text: "MENU" } }
        : DEFAULT_DESIGN),
  )
  const [dynamicChoice, setIsDynamic] = useState(initial?.isDynamic ?? mode !== "public")
  // Un menu n'existe qu'en dynamique (la carte est une page web modifiable).
  const forcedDynamic = DYNAMIC_ONLY_TYPES.includes(type)
  const isDynamic = forcedDynamic || dynamicChoice
  const [name, setName] = useState(initial?.name ?? "")
  const [nameTouched, setNameTouched] = useState(Boolean(initial))
  const [attempted, setAttempted] = useState(false)
  const [pending, startTransition] = useTransition()
  const svgRef = useRef<string | null>(null)

  useEffect(() => {
    if (!draft) return
    localStorage.removeItem(DRAFT_KEY)
    toast.success("Votre QR code a été récupéré", { description: "Finalisez-le puis enregistrez-le." })
  }, [draft])

  const data = useMemo(() => dataByType[type] ?? defaultContent(type), [dataByType, type])
  const level = design.logo.src && design.errorCorrection === "L" ? "M" : design.errorCorrection
  const parsed = useMemo<ReturnType<typeof parseContent>>(() => {
    const result = parseContent(type, data)
    // Un QR statique encode tout le contenu : il doit tenir dans la capacité du symbole.
    if (result.success && !isDynamic && !fitsInQr(encodeContent(type, result.data), level)) {
      // L'erreur s'affiche sous le champ le plus long, principal responsable du dépassement.
      const field = Object.keys(data).reduce((a, b) => (String(data[b] ?? "").length > String(data[a] ?? "").length ? b : a))
      return { success: false, errors: { [field]: "Contenu trop long pour un QR statique : réduisez-le, baissez la correction ou passez en dynamique" } }
    }
    return result
  }, [type, data, isDynamic, level])
  const valid = parsed.success
  const errors = parsed.success ? {} : parsed.errors
  const visibleErrors = attempted
    ? errors
    : Object.fromEntries(Object.entries(errors).filter(([key]) => String(data[key] ?? "") !== ""))

  const autoName = valid ? summarizeContent(type, parsed.data).slice(0, 60) || TYPE_META[type].label : TYPE_META[type].label
  const effectiveName = nameTouched && name.trim() ? name.trim() : autoName

  const payload = useMemo(() => {
    if (isDynamic) return shortUrl(initial?.shortCode ?? PLACEHOLDER_SHORT)
    return parsed.success ? encodeContent(type, parsed.data) : PLACEHOLDER_PAYLOAD
  }, [isDynamic, initial?.shortCode, parsed, type])

  const unsavedDynamic = isDynamic && !initial
  const staticChanged = mode === "edit" && initial && !initial.isDynamic && (isDynamic || payload !== encodeStatic(initial))

  const setData = (values: Values) => setDataByType((prev) => ({ ...prev, [type]: values }))

  const save = useCallback(() => {
    setAttempted(true)
    if (!parsed.success) {
      toast.error("Vérifiez le contenu du QR code", { description: Object.values(parsed.errors)[0] })
      return
    }
    if (mode === "public") {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ type, data, design }))
      cachedDraft = undefined
      const target = "/dashboard/codes/new?draft=1"
      // Déjà connecté : on passe directement à l'éditeur, sinon par l'inscription.
      router.push(session ? target : `/signup?next=${encodeURIComponent(target)}`)
      return
    }
    const input = { name: effectiveName, type, data, design, isDynamic }
    startTransition(async () => {
      const result = mode === "edit" ? await updateQrAction(initial.id, input) : await createQrAction(input)
      if (!result.ok) {
        toast.error(result.error, { description: result.fieldErrors ? Object.values(result.fieldErrors)[0] : undefined })
        return
      }
      toast.success(mode === "edit" ? "Modifications enregistrées" : "QR code créé", {
        description: isDynamic ? "Votre lien dynamique est actif." : undefined,
      })
      router.push(`/dashboard/codes/${result.data.id}`)
      router.refresh()
    })
  }, [parsed, mode, type, data, design, router, effectiveName, isDynamic, initial, session])

  // Raccourci Ctrl/Cmd + S
  useEffect(() => {
    if (mode === "public") return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        save()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mode, save])

  const onRender = useCallback((svg: string) => {
    svgRef.current = svg
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] [&>*]:min-w-0">
      <div className="min-w-0 space-y-6">
        <Section step={1} title="Type de contenu" description="Que doit ouvrir votre QR code ?">
          <TypePicker
            value={type}
            onChange={(t) => {
              setType(t)
              setAttempted(false)
              // Pour un menu, un cadre « MENU » invite clairement au scan sur les tables.
              if (t === "menu" && mode !== "edit" && design.frame.style === "none")
                setDesign({ ...design, frame: { ...design.frame, style: "bottom", text: "MENU" }, errorCorrection: "Q" })
            }}
          />
        </Section>

        <Section step={2} title={TYPE_META[type].label} description={TYPE_META[type].description}>
          <ContentForm type={type} values={data} errors={visibleErrors} onChange={setData} canUpload={mode !== "public"} />
        </Section>

        <Section step={3} title="Design" description="Modèles, couleurs, logo et cadre : rendez-le unique.">
          <DesignPanel design={design} onChange={setDesign} />
        </Section>
      </div>

      <aside id="apercu" className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card className="overflow-hidden py-0">
          <div className="relative border-b bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_70%)] p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">Aperçu en direct</span>
              <ScanabilityBadge design={design} />
            </div>
            <div className="relative mx-auto max-w-[300px]">
              <div className={cn("rounded-2xl bg-white/50 p-1 shadow-xl shadow-black/5 transition-opacity", !valid && !isDynamic && "opacity-30")}>
                <QrImage payload={payload} design={design} debounce={120} onRender={onRender} alt="Aperçu du QR code" />
              </div>
              {!valid && !isDynamic && (
                <div className="absolute inset-0 grid place-items-center">
                  <span className="rounded-full border bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
                    Complétez le contenu
                  </span>
                </div>
              )}
            </div>
          </div>

          <CardContent className="space-y-5 p-5">
            {type === "menu" && <MenuPreviewButton data={data} />}

            <ModeChoice
              mode={mode}
              isDynamic={isDynamic}
              onChange={setIsDynamic}
              locked={mode === "public"}
              forced={forcedDynamic}
            />

            {isDynamic && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
                <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate font-mono">
                  {initial?.shortCode ? shortUrl(initial.shortCode) : "Lien court généré à l'enregistrement"}
                </span>
              </div>
            )}

            {mode === "edit" && initial?.isDynamic && isDynamic && (
              <p className="flex gap-2 rounded-lg border border-success/25 bg-success/5 p-3 text-xs text-success">
                <Zap className="size-3.5 shrink-0" />
                Le QR code imprimé reste valide : seule la destination est mise à jour.
              </p>
            )}
            {staticChanged && (
              <p className="flex gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
                <Pencil className="size-3.5 shrink-0" />
                Le motif du QR code change : les exemplaires déjà imprimés renverront l&apos;ancien contenu.
              </p>
            )}

            {mode !== "public" && (
              <div className="space-y-1.5">
                <Label htmlFor="qr-name">Nom (visible uniquement par vous)</Label>
                <Input
                  id="qr-name"
                  value={nameTouched ? name : ""}
                  placeholder={autoName}
                  maxLength={80}
                  onChange={(e) => {
                    setName(e.target.value)
                    setNameTouched(true)
                  }}
                />
              </div>
            )}

            <Button className="w-full shadow-md shadow-primary/20" size="lg" onClick={save} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : mode === "public" ? <Sparkles /> : <Save />}
              {mode === "public" ? "Enregistrer et suivre les scans" : mode === "edit" ? "Enregistrer les modifications" : "Créer le QR code"}
              {mode !== "public" && <kbd className="ml-auto hidden rounded bg-primary-foreground/15 px-1.5 text-[10px] font-normal sm:inline">Ctrl S</kbd>}
            </Button>

            <div className="border-t pt-5">
              <p className="mb-3 text-sm font-medium">Télécharger</p>
              <DownloadPanel
                getSvg={() => svgRef.current}
                name={effectiveName}
                disabled={!valid || unsavedDynamic}
                disabledReason={
                  !valid
                    ? "Complétez le contenu pour télécharger."
                    : mode === "public" && unsavedDynamic
                      ? "Créez un compte gratuit pour publier ce menu et télécharger son QR code."
                      : unsavedDynamic
                      ? "Créez le QR code pour obtenir son lien dynamique définitif."
                      : undefined
                }
              />
            </div>
          </CardContent>
        </Card>
      </aside>

      <Button
        asChild
        size="lg"
        className="fixed right-4 bottom-4 z-40 rounded-full shadow-xl lg:hidden"
      >
        <a href="#apercu">
          <Eye /> Aperçu
        </a>
      </Button>
    </div>
  )
}

function encodeStatic(initial: EditorInitial) {
  const parsed = parseContent(initial.type, initial.data)
  return parsed.success ? encodeContent(initial.type, parsed.data) : ""
}

function Section({ step, title, description, children }: { step: number; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {step}
          </span>
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function ModeChoice({
  mode,
  isDynamic,
  onChange,
  locked,
  forced,
}: {
  mode: Props["mode"]
  isDynamic: boolean
  onChange: (v: boolean) => void
  locked: boolean
  forced: boolean
}) {
  const options = [
    {
      value: true,
      title: "Dynamique",
      text: "Modifiable après impression, statistiques de scan",
      icon: BarChart3,
      badge: "Recommandé",
    },
    { value: false, title: "Statique", text: "Contenu encodé définitivement", icon: Lock },
  ]
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type de QR code">
        {options.map((opt) => {
          const active = isDynamic === opt.value
          const disabled = forced ? !opt.value : locked && opt.value
          return (
            <button
              key={opt.title}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative rounded-xl border p-3 text-left transition-all hover:border-primary/40 disabled:cursor-not-allowed",
                active && "border-primary bg-primary/5 ring-1 ring-primary",
                disabled && "opacity-60 hover:border-border",
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <opt.icon className="size-3.5" />
                {opt.title}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">{opt.text}</span>
              {opt.badge && !locked && !forced && (
                <Badge className="absolute -top-2 right-2 h-4 px-1.5 text-[9px]">{opt.badge}</Badge>
              )}
            </button>
          )
        })}
      </div>
      {forced ? (
        <p className="text-xs text-muted-foreground">
          Un menu est toujours dynamique : modifiez plats et prix à tout moment, sans réimprimer le QR code.
        </p>
      ) : locked && (
        <p className="text-xs text-muted-foreground">
          Les QR dynamiques nécessitent un{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            compte gratuit
          </Link>
          .
        </p>
      )}
      {mode === "create" && !isDynamic && (
        <p className="text-xs text-muted-foreground">Un QR statique ne pourra plus être modifié ni suivi une fois imprimé.</p>
      )}
    </div>
  )
}
