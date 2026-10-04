"use client"

import { Smartphone } from "lucide-react"
import { useMemo } from "react"

import { MenuView } from "@/components/menu/menu-view"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toViewMenu } from "@/lib/qr/menu"

/** Ouvre la carte telle que vos clients la verront, dans un cadre de smartphone. */
export function MenuPreviewButton({ data }: { data: Record<string, unknown> }) {
  const menu = useMemo(() => toViewMenu(data), [data])
  const empty = menu.sections.length === 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <Smartphone /> Voir le menu comme vos clients
        </Button>
      </DialogTrigger>
      <DialogContent className="w-auto max-w-none border-0 bg-transparent p-0 shadow-none sm:max-w-none [&>button]:text-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Aperçu du menu</DialogTitle>
          <DialogDescription>Rendu de la carte sur smartphone</DialogDescription>
        </DialogHeader>
        <div className="relative h-[min(780px,88svh)] w-[min(380px,92vw)] overflow-hidden rounded-[2.75rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-2xl ring-1 ring-white/10">
          <div className="absolute top-2 left-1/2 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-zinc-900" />
          <div className="h-full overflow-hidden rounded-[2.1rem]">
            {empty ? (
              <div className="grid h-full place-items-center bg-white p-8 text-center text-sm text-zinc-500">
                Ajoutez un nom de catégorie et au moins un plat pour prévisualiser la carte.
              </div>
            ) : (
              <MenuView menu={menu} embedded />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
