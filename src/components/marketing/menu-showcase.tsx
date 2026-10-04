"use client"

import { MenuView } from "@/components/menu/menu-view"
import { sampleMenu, toViewMenu } from "@/lib/qr/menu"

// Identifiants déterministes : rendu identique côté serveur et client.
let seq = 0
const DEMO = toViewMenu({ ...sampleMenu(() => `demo-${seq++}`), accent: "#b45309", theme: "modern" })

/** Carte de démonstration interactive, dans un cadre de smartphone. */
export function MenuShowcasePhone() {
  return (
    <div className="relative mx-auto w-[min(340px,86vw)]">
      <div className="absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(closest-side,oklch(0.75_0.15_70/0.35),transparent)] blur-2xl" />
      <div className="relative h-[640px] overflow-hidden rounded-[2.75rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-2xl ring-1 ring-black/5">
        <div className="absolute top-2 left-1/2 z-30 h-6 w-24 -translate-x-1/2 rounded-full bg-zinc-900" />
        <div className="h-full overflow-hidden rounded-[2.1rem]">
          <MenuView menu={DEMO} embedded />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Démo interactive : faites défiler, filtrez, touchez un plat</p>
    </div>
  )
}
