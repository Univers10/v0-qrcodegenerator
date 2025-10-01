"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, QrCode } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getQRCodeById } from "@/lib/local-storage"

export default function ContentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [qrCode, setQrCode] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const qrCodeData = getQRCodeById(params.id)

    if (qrCodeData) {
      setQrCode(qrCodeData)
    }
    setIsLoading(false)
  }, [params.id, router])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!qrCode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">QR code non trouvé</h1>
          <Link href="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (qrCode.type) {
      case "text":
        return <div className="whitespace-pre-wrap">{qrCode.content}</div>
      case "email":
        return (
          <div>
            <p>
              Email:{" "}
              <a href={`mailto:${qrCode.content}`} className="text-primary underline">
                {qrCode.content}
              </a>
            </p>
          </div>
        )
      case "phone":
        return (
          <div>
            <p>
              Téléphone:{" "}
              <a href={`tel:${qrCode.content}`} className="text-primary underline">
                {qrCode.content}
              </a>
            </p>
          </div>
        )
      case "wifi":
        return (
          <div>
            <p>Réseau Wi-Fi: {qrCode.content}</p>
            <p className="text-muted-foreground">Connectez-vous au réseau en utilisant les informations fournies</p>
          </div>
        )
      default:
        return (
          <div>
            <p>{qrCode.content}</p>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center py-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 font-bold">
          <QrCode className="h-6 w-6" />
          <span>QR Creator</span>
        </div>
      </header>
      <main className="container flex flex-1 items-center justify-center py-6">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle>{qrCode.name}</CardTitle>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-bold">
            <QrCode className="h-6 w-6" />
            <span>QR Creator</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} QR Creator | UNIVERS10. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}

