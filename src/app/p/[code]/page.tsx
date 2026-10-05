import {
  Building2,
  CalendarPlus,
  Download,
  Globe,
  Mail,
  MapPin,
  MessageSquareText,
  PauseCircle,
  Phone,
  SearchX,
  Smartphone,
  Wifi,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { CopyButton, RevealSecret } from "@/components/landing/copy-button"
import { LogoMark } from "@/components/logo"
import { MenuView } from "@/components/menu/menu-view"
import { Button } from "@/components/ui/button"
import { encodeContent, formatWallTime, mapsUrl, normalizeUrl, toIcsDate, type QrContent } from "@/lib/qr/content"
import { toViewMenu, type MenuData } from "@/lib/qr/menu"
import { TYPE_META } from "@/lib/qr/meta"
import { getQrCodeByShortCode, type QrCodeRecord } from "@/lib/server/qr-service"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const qr = await getQrCodeByShortCode((await params).code)
  if (qr?.status === "active" && qr.type === "menu") {
    const menu = qr.data as MenuData
    return {
      title: { absolute: `${menu.restaurant.name} — Menu` },
      description: menu.restaurant.tagline || `La carte de ${menu.restaurant.name}`,
      robots: { index: false },
    }
  }
  return { title: qr && qr.status === "active" ? qr.name : "QR code", robots: { index: false } }
}

export default async function LandingPage({ params }: Props) {
  const { code } = await params
  const qr = await getQrCodeByShortCode(code)

  // La carte d'un restaurant occupe tout l'écran, avec sa propre identité visuelle.
  if (qr?.status === "active" && qr.type === "menu") return <MenuView menu={toViewMenu(qr.data)} shortCode={qr.shortCode} />

  return (
    <div className="relative flex min-h-svh flex-col items-center bg-muted/40 px-4 py-10">
      <div
        className="absolute inset-x-0 top-0 -z-0 h-64"
        style={{ background: `radial-gradient(ellipse at top, color-mix(in oklch, ${accentOf(qr)} 22%, transparent), transparent 70%)` }}
      />
      <main className="relative w-full max-w-md flex-1">
        {!qr ? (
          <State icon={SearchX} title="QR code introuvable" text="Ce lien n'existe pas ou a été supprimé par son propriétaire." />
        ) : qr.status === "paused" ? (
          <State icon={PauseCircle} title="QR code momentanément inactif" text="Son propriétaire l'a mis en pause. Réessayez plus tard." />
        ) : (
          <Content qr={qr} />
        )}
      </main>
      <footer className="relative mt-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <LogoMark className="size-5" /> Créé avec QR Creator
        </Link>
      </footer>
    </div>
  )
}

function accentOf(qr: QrCodeRecord | null) {
  return qr ? TYPE_META[qr.type].accent : "#6366f1"
}

function State({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="mt-16 rounded-3xl border bg-card p-8 text-center shadow-xl">
      <Icon className="mx-auto size-12 text-muted-foreground" />
      <h1 className="mt-4 text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/">Découvrir QR Creator</Link>
      </Button>
    </div>
  )
}

function Shell({ qr, title, subtitle, children }: { qr: QrCodeRecord; title: string; subtitle?: string; children: React.ReactNode }) {
  const meta = TYPE_META[qr.type]
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-xl">
      <div className="flex flex-col items-center px-6 pt-10 pb-6 text-center">
        <span
          className="grid size-16 place-items-center rounded-2xl shadow-lg"
          style={{ background: meta.accent, color: "white", boxShadow: `0 12px 30px -10px ${meta.accent}` }}
        >
          <meta.icon className="size-8" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-3 border-t px-6 py-6">{children}</div>
    </div>
  )
}

function Row({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href?: string }) {
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="block truncate text-sm font-medium">{value}</span>
      </span>
    </>
  )
  return href ? (
    <a href={href} className="flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-muted/60">
      {body}
    </a>
  ) : (
    <div className="flex items-center gap-3 p-1">{body}</div>
  )
}

function Content({ qr }: { qr: QrCodeRecord }) {
  const d = qr.data as Record<string, string>
  switch (qr.type) {
    case "text": {
      const c = qr.data as QrContent<"text">
      return (
        <Shell qr={qr} title={qr.name}>
          <p className="rounded-xl bg-muted/60 p-4 text-[15px] leading-relaxed whitespace-pre-wrap">{c.text}</p>
          <CopyButton value={c.text} label="Copier le texte" className="w-full" />
        </Shell>
      )
    }
    case "email": {
      const c = qr.data as QrContent<"email">
      return (
        <Shell qr={qr} title={c.subject || "Envoyer un email"} subtitle={c.email}>
          {c.body && <p className="rounded-xl bg-muted/60 p-4 text-sm whitespace-pre-wrap">{c.body}</p>}
          <Button asChild size="lg" className="w-full">
            <a href={encodeContent("email", c)}>
              <Mail /> Écrire l&apos;email
            </a>
          </Button>
          <CopyButton value={c.email} label="Copier l'adresse" className="w-full" />
        </Shell>
      )
    }
    case "phone":
      return (
        <Shell qr={qr} title={d.phone} subtitle="Appuyez pour appeler">
          <Button asChild size="lg" className="w-full">
            <a href={encodeContent("phone", qr.data)}>
              <Phone /> Appeler
            </a>
          </Button>
          <CopyButton value={d.phone} label="Copier le numéro" className="w-full" />
        </Shell>
      )
    case "sms": {
      const c = qr.data as QrContent<"sms">
      const href = `sms:${c.phone.replace(/[^\d+]/g, "")}${c.message ? `?&body=${encodeURIComponent(c.message)}` : ""}`
      return (
        <Shell qr={qr} title="Envoyer un SMS" subtitle={c.phone}>
          {c.message && <p className="rounded-xl bg-muted/60 p-4 text-sm whitespace-pre-wrap">{c.message}</p>}
          <Button asChild size="lg" className="w-full">
            <a href={href}>
              <MessageSquareText /> Ouvrir les messages
            </a>
          </Button>
        </Shell>
      )
    }
    case "wifi": {
      const c = qr.data as QrContent<"wifi">
      return (
        <Shell qr={qr} title={c.ssid} subtitle="Réseau Wi-Fi">
          <Row icon={Wifi} label="Nom du réseau" value={c.ssid} />
          <Row icon={Smartphone} label="Sécurité" value={c.encryption === "nopass" ? "Réseau ouvert" : c.encryption === "WEP" ? "WEP" : "WPA / WPA2"} />
          {c.encryption !== "nopass" && c.password && (
            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground">Mot de passe</p>
              <RevealSecret value={c.password} />
              <CopyButton value={c.password} label="Copier le mot de passe" className="w-full" />
            </div>
          )}
          <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
            Ouvrez les réglages Wi-Fi de votre appareil, sélectionnez « {c.ssid} » et collez le mot de passe.
          </p>
        </Shell>
      )
    }
    case "vcard": {
      const c = qr.data as QrContent<"vcard">
      const fullName = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.organization
      const address = [c.street, [c.zip, c.city].filter(Boolean).join(" "), c.country].filter(Boolean).join(", ")
      return (
        <Shell qr={qr} title={fullName} subtitle={[c.title, c.firstName || c.lastName ? c.organization : ""].filter(Boolean).join(" · ")}>
          <Button asChild size="lg" className="w-full">
            <a href={`/p/${qr.shortCode}/download`}>
              <Download /> Ajouter aux contacts
            </a>
          </Button>
          <div className="space-y-1 pt-2">
            {c.mobile && <Row icon={Smartphone} label="Mobile" value={c.mobile} href={`tel:${c.mobile.replace(/[^\d+]/g, "")}`} />}
            {c.phone && <Row icon={Phone} label="Téléphone" value={c.phone} href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} />}
            {c.email && <Row icon={Mail} label="Email" value={c.email} href={`mailto:${c.email}`} />}
            {c.website && <Row icon={Globe} label="Site web" value={c.website.replace(/^https?:\/\//, "")} href={normalizeUrl(c.website)} />}
            {c.organization && <Row icon={Building2} label="Entreprise" value={c.organization} />}
            {address && (
              <Row icon={MapPin} label="Adresse" value={address} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} />
            )}
          </div>
          {c.note && <p className="rounded-xl bg-muted/60 p-4 text-sm whitespace-pre-wrap">{c.note}</p>}
        </Shell>
      )
    }
    case "event": {
      const c = qr.data as QrContent<"event">
      const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(c.title)}&dates=${toIcsDate(c.start)}/${toIcsDate(c.end)}&details=${encodeURIComponent(c.description)}&location=${encodeURIComponent(c.location)}`
      return (
        <Shell qr={qr} title={c.title} subtitle="Événement">
          <Row icon={CalendarPlus} label="Début" value={formatWallTime(c.start)} />
          <Row icon={CalendarPlus} label="Fin" value={formatWallTime(c.end)} />
          {c.location && (
            <Row icon={MapPin} label="Lieu" value={c.location} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.location)}`} />
          )}
          {c.description && <p className="rounded-xl bg-muted/60 p-4 text-sm whitespace-pre-wrap">{c.description}</p>}
          <Button asChild size="lg" className="w-full">
            <a href={`/p/${qr.shortCode}/download`}>
              <CalendarPlus /> Ajouter à mon agenda
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href={google} target="_blank" rel="noopener noreferrer">
              Google Agenda
            </a>
          </Button>
        </Shell>
      )
    }
    case "location": {
      const c = qr.data as QrContent<"location">
      const delta = 0.006
      const bbox = [c.longitude - delta, c.latitude - delta, c.longitude + delta, c.latitude + delta].join("%2C")
      return (
        <Shell qr={qr} title={c.label || "Localisation"} subtitle={`${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`}>
          <iframe
            title="Carte"
            className="h-56 w-full rounded-xl border"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${c.latitude}%2C${c.longitude}`}
          />
          <Button asChild size="lg" className="w-full">
            <a href={mapsUrl(c)}>
              <MapPin /> Ouvrir dans Google Maps
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href={`https://maps.apple.com/?ll=${c.latitude},${c.longitude}&q=${encodeURIComponent(c.label || "Lieu")}`}>Plans (Apple)</a>
          </Button>
        </Shell>
      )
    }
    default: {
      const target = encodeContent(qr.type, qr.data)
      return (
        <Shell qr={qr} title={qr.name}>
          <Button asChild size="lg" className="w-full">
            <a href={target}>Ouvrir</a>
          </Button>
        </Shell>
      )
    }
  }
}
