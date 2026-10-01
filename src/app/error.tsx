"use client"

import { RotateCcw, TriangleAlert } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div className="grid min-h-[60svh] place-items-center p-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nous n&apos;avons pas pu afficher cette page. Réessayez dans un instant.
          {error.digest && <span className="mt-2 block font-mono text-xs">Réf. {error.digest}</span>}
        </p>
        <Button className="mt-6" onClick={reset}>
          <RotateCcw /> Réessayer
        </Button>
      </div>
    </div>
  )
}
