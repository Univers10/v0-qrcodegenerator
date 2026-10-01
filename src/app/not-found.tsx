import Link from "next/link"

import { LogoMark } from "@/components/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center p-6">
      <div className="text-center">
        <LogoMark className="mx-auto size-12" />
        <p className="mt-8 font-mono text-sm text-primary">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="mt-3 text-muted-foreground">Le lien est peut-être erroné ou la page a été déplacée.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Tableau de bord</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
