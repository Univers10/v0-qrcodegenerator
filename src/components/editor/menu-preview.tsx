"use client"

import { Maximize2 } from "lucide-react"
import { useDeferredValue, useMemo } from "react"

import { MenuView } from "@/components/menu/menu-view"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toViewMenu } from "@/lib/qr/menu"
import { cn } from "@/lib/utils"

/** Carte telle que vos clients la verront, dans un cadre de smartphone (rendu en direct). */
export function MenuPhone({ data, className }: { data: Record<string, unknown>; className?: string }) {
  // Valeur différée : la saisie reste fluide même sur une grande carte.
  const deferred = useDeferredValue(data)
  const menu = useMemo(() => toViewMenu(deferred), [deferred])
  const empty = menu.sections.length === 0

  return (
    <div className={cn("relative mx-auto aspect-[9/18.5] w-full max-w-[300px] overflow-hidden rounded-[2.4rem] border-[9px] border-zinc-900 bg-zinc-900 shadow-2xl ring-1 ring-black/10", className)}>
      <div className="absolute top-1.5 left-1/2 z-30 h-5 w-20 -translate-x-1/2 rounded-full bg-zinc-900" />
      <div className="h-full overflow-hidden rounded-[1.8rem] bg-white">
        {empty ? (
          <div className="grid h-full place-items-center p-8 text-center text-sm text-zinc-500">
            Donnez un nom à une catégorie et ajoutez un plat pour voir la carte prendre forme.
          </div>
        ) : (
          <MenuView menu={menu} embedded />
        )}
      </div>
    </div>
  )
}

export function MenuPreviewButton({ data }: { data: Record<string, unknown> }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
          <Maximize2 /> Agrandir
        </Button>
      </DialogTrigger>
      <DialogContent className="w-auto max-w-none border-0 bg-transparent p-0 shadow-none sm:max-w-none [&>button]:text-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Aperçu du menu</DialogTitle>
          <DialogDescription>Rendu de la carte sur smartphone</DialogDescription>
        </DialogHeader>
        <MenuPhone data={data} className="h-[min(800px,90svh)] w-auto max-w-none" />
      </DialogContent>
    </Dialog>
  )
}
