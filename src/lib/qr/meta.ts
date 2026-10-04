import {
  CalendarDays,
  Contact,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Phone,
  Type,
  UtensilsCrossed,
  Wifi,
  type LucideIcon,
} from "lucide-react"

import type { QrType } from "./content"

export const TYPE_META: Record<QrType, { label: string; description: string; icon: LucideIcon; accent: string }> = {
  menu: { label: "Menu restaurant", description: "Carte digitale avec photos et prix", icon: UtensilsCrossed, accent: "#d97706" },
  url: { label: "Site web", description: "Redirigez vers n'importe quelle page", icon: Globe, accent: "#6366f1" },
  vcard: { label: "Carte de visite", description: "Partagez vos coordonnées", icon: Contact, accent: "#0ea5e9" },
  wifi: { label: "Wi-Fi", description: "Connexion au réseau en un scan", icon: Wifi, accent: "#14b8a6" },
  whatsapp: { label: "WhatsApp", description: "Ouvrez une conversation", icon: MessageCircle, accent: "#22c55e" },
  email: { label: "Email", description: "Email prérempli", icon: Mail, accent: "#f59e0b" },
  phone: { label: "Appel", description: "Lancez un appel", icon: Phone, accent: "#ef4444" },
  sms: { label: "SMS", description: "SMS prérempli", icon: MessageSquareText, accent: "#ec4899" },
  event: { label: "Événement", description: "Ajout à l'agenda", icon: CalendarDays, accent: "#8b5cf6" },
  location: { label: "Localisation", description: "Ouvrez un lieu sur la carte", icon: MapPin, accent: "#f97316" },
  text: { label: "Texte", description: "Affichez un message", icon: Type, accent: "#64748b" },
}

/** Ordre d'affichage des types dans l'interface. */
export const TYPE_ORDER: QrType[] = ["url", "menu", "vcard", "wifi", "whatsapp", "email", "phone", "sms", "event", "location", "text"]
