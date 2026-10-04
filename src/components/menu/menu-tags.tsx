import { BadgeCheck, Flame, Leaf, MilkOff, Sparkles, Sprout, Star, WheatOff, type LucideIcon } from "lucide-react"

import { MENU_TAGS, type MenuTag } from "@/lib/qr/menu"

export const TAG_ICONS: Record<MenuTag, LucideIcon> = {
  popular: Star,
  new: Sparkles,
  vegetarian: Leaf,
  vegan: Sprout,
  "gluten-free": WheatOff,
  "lactose-free": MilkOff,
  spicy: Flame,
  halal: BadgeCheck,
}

/** Teinte propre à chaque tag (identité constante, indépendante du thème du menu). */
export const TAG_COLORS: Record<MenuTag, string> = {
  popular: "#d97706",
  new: "#7c3aed",
  vegetarian: "#16a34a",
  vegan: "#15803d",
  "gluten-free": "#a16207",
  "lactose-free": "#0284c7",
  spicy: "#dc2626",
  halal: "#0f766e",
}

export const TAG_LABELS = Object.fromEntries(MENU_TAGS.map((t) => [t.value, t.label])) as Record<MenuTag, string>
