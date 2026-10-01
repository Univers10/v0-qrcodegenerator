import type { Metadata } from "next"

import { PageHeader } from "@/components/dashboard/page-header"
import { QrEditor } from "@/components/editor/qr-editor"
import { isQrType } from "@/lib/qr/content"

export const metadata: Metadata = { title: "Nouveau QR code" }

export default async function NewCodePage({ searchParams }: { searchParams: Promise<{ type?: string; draft?: string }> }) {
  const { type, draft } = await searchParams
  return (
    <>
      <PageHeader title="Nouveau QR code" description="Choisissez un contenu, personnalisez le design, puis enregistrez." />
      <QrEditor mode="create" fromDraft={draft === "1"} initialType={type && isQrType(type) ? type : undefined} />
    </>
  )
}
