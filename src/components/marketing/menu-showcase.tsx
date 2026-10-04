"use client"

import { useMemo, useState } from "react"

import { MenuView } from "@/components/menu/menu-view"
import { MENU_THEMES, sampleMenu, toViewMenu, type MenuTheme } from "@/lib/qr/menu"
import { cn } from "@/lib/utils"

// Identifiants déterministes : rendu identique côté serveur et client.
let seq = 0
const BASE = sampleMenu(() => `demo-${seq++}`)

const ACCENTS: Record<MenuTheme, string> = {
  modern: "#b45309",
  classic: "#9f1239",
  bistro: "#9a3412",
  elegant: "#c2a15b",
}

/** Carte de démonstration interactive, dans un cadre de smartphone, avec choix du style. */
export function MenuShowcasePhone() {
  const [theme, setTheme] = useState<MenuTheme>("modern")
  const menu = useMemo(() => toViewMenu({ ...BASE, theme, accent: ACCENTS[theme] }), [theme])

  return (
    <div className="relative mx-auto w-[min(340px,86vw)]">
      <div className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,oklch(0.75_0.15_70/0.35),transparent)] blur-2xl" />
      <div className="mb-4 flex justify-center">
        <div className="inline-flex rounded-full border bg-card p-1 shadow-sm" role="radiogroup" aria-label="Style de carte">
          {MENU_THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={theme === t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                theme === t.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-[660px] overflow-hidden rounded-[2.75rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-2xl ring-1 ring-black/5">
        <div className="absolute top-2 left-1/2 z-30 h-6 w-24 -translate-x-1/2 rounded-full bg-zinc-900" />
        <div className="h-full overflow-hidden rounded-[2.1rem]">
          {/* La clé réinitialise le défilement et les filtres à chaque changement de style. */}
          <MenuView key={theme} menu={menu} embedded />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Démo interactive : faites défiler, recherchez, touchez un plat</p>
    </div>
  )
}
