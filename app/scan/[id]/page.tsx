"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
// import { getQRCodeById, recordScan } from "@/lib/qr-service"

export default function ScanPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  useEffect(() => {
    const getQRCodeById = (id: string) => {
      const qrCodes = JSON.parse(localStorage.getItem("qrCodes") || "[]") as any[]
      return qrCodes.find((qrCode) => qrCode.id === id)
    }

    const recordScan = (id: string) => {
      const scans = JSON.parse(localStorage.getItem("scans") || "[]") as any[]
      localStorage.setItem("scans", JSON.stringify([...scans, { id, timestamp: new Date() }]))
    }

    const qrCode = getQRCodeById(params.id)

    if (!qrCode) {
      router.push("/")
      return
    }

    // Enregistrer le scan si c'est un QR code dynamique
    if (qrCode.isDynamic) {
      recordScan(params.id)
    }

    // Rediriger vers le contenu du QR code si c'est une URL
    if (qrCode.type === "url") {
      window.location.href = qrCode.content
    } else {
      // Pour les autres types, afficher le contenu
      router.push(`/content/${params.id}`)
    }
  }, [params.id, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirection en cours...</p>
    </div>
  )
}

