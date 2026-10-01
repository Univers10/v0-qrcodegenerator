import { Plus, QrCode } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/dashboard/page-header"
import { QrCodeList } from "@/components/dashboard/qr-code-list"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { requireSession } from "@/lib/auth"
import { listQrCodes } from "@/lib/server/qr-service"

export const metadata: Metadata = { title: "Mes QR codes" }

export default async function CodesPage() {
  const session = await requireSession()
  const codes = await listQrCodes(session.user.id)

  return (
    <>
      <PageHeader
        title="Mes QR codes"
        description="Gérez, modifiez et téléchargez tous vos QR codes."
        actions={
          <Button asChild>
            <Link href="/dashboard/codes/new">
              <Plus /> Créer un QR code
            </Link>
          </Button>
        }
      />
      {codes.length === 0 ? (
        <Card className="items-center py-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <QrCode className="size-7" />
          </span>
          <div>
            <p className="text-lg font-medium">Aucun QR code pour l&apos;instant</p>
            <p className="text-sm text-muted-foreground">Créez votre premier QR code en moins d&apos;une minute.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/codes/new">
              <Plus /> Créer un QR code
            </Link>
          </Button>
        </Card>
      ) : (
        <QrCodeList
          codes={codes.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            data: c.data,
            design: c.design,
            isDynamic: c.isDynamic,
            shortCode: c.shortCode,
            status: c.status,
            scanCount: c.scanCount,
            lastScannedAt: c.lastScannedAt,
            createdAt: c.createdAt,
          }))}
        />
      )}
    </>
  )
}
