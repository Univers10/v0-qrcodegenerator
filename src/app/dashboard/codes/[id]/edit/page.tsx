import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/dashboard/page-header"
import { QrEditor } from "@/components/editor/qr-editor"
import { requireSession } from "@/lib/auth"
import { getQrCode } from "@/lib/server/qr-service"

export const metadata: Metadata = { title: "Modifier le QR code" }

export default async function EditCodePage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, requireSession()])
  const code = await getQrCode(session.user.id, id)
  if (!code) notFound()

  return (
    <>
      <PageHeader title={`Modifier « ${code.name} »`} description="Les QR dynamiques gardent le même motif : seule la destination change." />
      <QrEditor
        mode="edit"
        initial={{
          id: code.id,
          name: code.name,
          type: code.type,
          data: code.data,
          design: code.design,
          isDynamic: code.isDynamic,
          shortCode: code.shortCode,
        }}
      />
    </>
  )
}
