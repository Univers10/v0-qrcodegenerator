"use client"

import { Eye, EyeOff, LocateFixed } from "lucide-react"
import { useId, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { QrType } from "@/lib/qr/content"
import { cn } from "@/lib/utils"

type Values = Record<string, unknown>

type Props = {
  type: QrType
  values: Values
  errors: Record<string, string>
  onChange: (values: Values) => void
}

type FieldProps = {
  name: string
  label: string
  placeholder?: string
  type?: string
  multiline?: boolean
  hint?: string
  className?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  autoComplete?: string
  maxLength?: number
}

export function ContentForm({ type, values, errors, onChange }: Props) {
  const set = (patch: Values) => onChange({ ...values, ...patch })
  const str = (name: string) => String(values[name] ?? "")

  function renderField({ name, label, placeholder, type: inputType = "text", multiline, hint, className, ...rest }: FieldProps) {
    const id = `${name}-field`
    const error = errors[name]
    const Comp = multiline ? Textarea : Input
    return (
      <div className={cn("space-y-1.5", className)}>
        <Label htmlFor={id}>{label}</Label>
        <Comp
          id={id}
          type={multiline ? undefined : inputType}
          placeholder={placeholder}
          value={str(name)}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set({ [name]: e.target.value })}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          rows={multiline ? 4 : undefined}
          {...rest}
        />
        {error ? (
          <p id={`${id}-error`} className="text-xs text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    )
  }

  // Rendu par simple appel de fonction (et non comme composant) : le focus est conservé à chaque frappe.
  const field = renderField

  switch (type) {
    case "url":
      return (
        <div className="space-y-4">
          {field({
            name: "url",
            label: "Adresse de destination",
            placeholder: "https://votre-site.fr/page",
            type: "url",
            inputMode: "url",
            autoComplete: "url",
            hint: "Le protocole https:// est ajouté automatiquement si besoin.",
          })}
        </div>
      )
    case "text":
      return (
        <div className="space-y-4">
          {field({ name: "text", label: "Texte", placeholder: "Votre message…", multiline: true, maxLength: 1500 })}
          <p className="text-right text-xs text-muted-foreground">{str("text").length} / 1 500</p>
        </div>
      )
    case "email":
      return (
        <div className="space-y-4">
          {field({ name: "email", label: "Destinataire", placeholder: "contact@entreprise.fr", type: "email", autoComplete: "email" })}
          {field({ name: "subject", label: "Objet", placeholder: "Demande d'information" })}
          {field({ name: "body", label: "Message", placeholder: "Bonjour…", multiline: true })}
        </div>
      )
    case "phone":
      return (
        <div className="space-y-4">
          {field({ name: "phone", label: "Numéro de téléphone", placeholder: "+33 6 12 34 56 78", type: "tel", inputMode: "tel" })}
        </div>
      )
    case "sms":
      return (
        <div className="space-y-4">
          {field({ name: "phone", label: "Numéro du destinataire", placeholder: "+33 6 12 34 56 78", type: "tel", inputMode: "tel" })}
          {field({ name: "message", label: "Message prérempli", placeholder: "Bonjour, je souhaite…", multiline: true })}
        </div>
      )
    case "whatsapp":
      return (
        <div className="space-y-4">
          {field({
            name: "phone",
            label: "Numéro WhatsApp",
            placeholder: "+33 6 12 34 56 78",
            type: "tel",
            inputMode: "tel",
            hint: "Format international avec l'indicatif du pays.",
          })}
          {field({ name: "message", label: "Message prérempli", placeholder: "Bonjour ! Je vous contacte depuis…", multiline: true })}
        </div>
      )
    case "wifi":
      return <WifiFields values={values} errors={errors} set={set} field={field} />
    case "vcard":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {field({ name: "firstName", label: "Prénom", placeholder: "Camille", autoComplete: "given-name" })}
          {field({ name: "lastName", label: "Nom", placeholder: "Martin", autoComplete: "family-name" })}
          {field({ name: "organization", label: "Entreprise", placeholder: "UNIVERS10", autoComplete: "organization" })}
          {field({ name: "title", label: "Fonction", placeholder: "Directrice commerciale" })}
          {field({ name: "mobile", label: "Mobile", placeholder: "+33 6 12 34 56 78", type: "tel" })}
          {field({ name: "phone", label: "Téléphone fixe", placeholder: "+33 1 23 45 67 89", type: "tel" })}
          {field({ name: "email", label: "Email", placeholder: "camille@entreprise.fr", type: "email" })}
          {field({ name: "website", label: "Site web", placeholder: "entreprise.fr", type: "url" })}
          {field({ name: "street", label: "Adresse", placeholder: "12 rue de la Paix", className: "sm:col-span-2" })}
          {field({ name: "zip", label: "Code postal", placeholder: "75002" })}
          {field({ name: "city", label: "Ville", placeholder: "Paris" })}
          {field({ name: "country", label: "Pays", placeholder: "France", className: "sm:col-span-2" })}
          {field({ name: "note", label: "Note", placeholder: "Disponible du lundi au vendredi", multiline: true, className: "sm:col-span-2" })}
        </div>
      )
    case "location":
      return <LocationFields set={set} field={field} />
    case "event":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {field({ name: "title", label: "Titre de l'événement", placeholder: "Soirée de lancement", className: "sm:col-span-2" })}
          {field({ name: "start", label: "Début", type: "datetime-local" })}
          {field({ name: "end", label: "Fin", type: "datetime-local" })}
          {field({ name: "location", label: "Lieu", placeholder: "Station F, Paris", className: "sm:col-span-2" })}
          {field({ name: "description", label: "Description", placeholder: "Programme, accès…", multiline: true, className: "sm:col-span-2" })}
        </div>
      )
  }
}

type SubProps = {
  values: Values
  set: (patch: Values) => void
  field: (props: FieldProps) => React.ReactNode
}

function WifiFields({ values, errors, set, field }: SubProps & { errors: Record<string, string> }) {
  const [visible, setVisible] = useState(false)
  const id = useId()
  const encryption = String(values.encryption ?? "WPA")
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {field({ name: "ssid", label: "Nom du réseau (SSID)", placeholder: "Wifi-Boutique", className: "sm:col-span-2" })}
      <div className="space-y-1.5">
        <Label>Sécurité</Label>
        <Select value={encryption} onValueChange={(v) => set({ encryption: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WPA">WPA / WPA2 / WPA3</SelectItem>
            <SelectItem value="WEP">WEP</SelectItem>
            <SelectItem value="nopass">Aucune (réseau ouvert)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {encryption !== "nopass" && (
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-pwd`}>Mot de passe</Label>
          <div className="relative">
            <Input
              id={`${id}-pwd`}
              type={visible ? "text" : "password"}
              value={String(values.password ?? "")}
              onChange={(e) => set({ password: e.target.value })}
              autoComplete="off"
              className="pr-10"
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-foreground"
              aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      )}
      <label className="flex items-center justify-between gap-4 rounded-lg border p-3 sm:col-span-2">
        <span>
          <span className="block text-sm font-medium">Réseau masqué</span>
          <span className="text-xs text-muted-foreground">Activez si le réseau ne diffuse pas son nom</span>
        </span>
        <Switch checked={Boolean(values.hidden)} onCheckedChange={(v) => set({ hidden: v })} />
      </label>
    </div>
  )
}

function LocationFields({ set, field }: Omit<SubProps, "values">) {
  const [locating, setLocating] = useState(false)
  const [link, setLink] = useState("")

  const locate = () => {
    if (!navigator.geolocation) return toast.error("La géolocalisation n'est pas disponible")
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({ latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) })
        setLocating(false)
      },
      () => {
        toast.error("Impossible d'obtenir votre position")
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const parseLink = (value: string) => {
    setLink(value)
    const match = value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ?? value.match(/[?&](?:q|query|ll)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
    if (match) {
      set({ latitude: match[1], longitude: match[2] })
      toast.success("Coordonnées extraites du lien")
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {field({ name: "label", label: "Nom du lieu", placeholder: "Notre boutique", className: "sm:col-span-2" })}
      {field({ name: "latitude", label: "Latitude", placeholder: "48.8584", inputMode: "decimal" })}
      {field({ name: "longitude", label: "Longitude", placeholder: "2.2945", inputMode: "decimal" })}
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="maps-link">Ou collez un lien Google Maps</Label>
        <Input id="maps-link" value={link} onChange={(e) => parseLink(e.target.value)} placeholder="https://www.google.com/maps/@48.8584,2.2945,17z" />
      </div>
      <Button type="button" variant="outline" onClick={locate} disabled={locating} className="sm:col-span-2">
        <LocateFixed className={cn(locating && "animate-pulse")} />
        {locating ? "Localisation…" : "Utiliser ma position actuelle"}
      </Button>
    </div>
  )
}
