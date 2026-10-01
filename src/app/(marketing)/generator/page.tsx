import type { Metadata } from "next"

import { QrEditor } from "@/components/editor/qr-editor"
import { isQrType } from "@/lib/qr/content"

export const metadata: Metadata = {
  title: "Générateur de QR code gratuit",
  description:
    "Générateur de QR code gratuit et sans inscription : lien, vCard, Wi-Fi, WhatsApp, événement. Logo, couleurs, cadres et exports PNG, SVG, PDF.",
}

export default async function GeneratorPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams
  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Générateur de QR code</h1>
        <p className="mt-3 text-muted-foreground">
          Gratuit, sans inscription et sans filigrane. Créez un compte pour des QR codes dynamiques modifiables et leurs
          statistiques.
        </p>
      </div>
      <QrEditor mode="public" initialType={type && isQrType(type) ? type : undefined} />
    </div>
  )
}
