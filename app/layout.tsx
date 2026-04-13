import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./ClientLayout"

const inter = Inter({ subsets: ["latin"] })

// Métadonnées exportées séparément pour éviter les erreurs avec "use client"
export const metadata: Metadata = {
  title: "QR Creator - Générateur de QR Codes Personnalisés",
  description:
    "Créez des QR codes uniques avec des couleurs, logos et formes personnalisées. Suivez les statistiques et gérez tous vos codes en un seul endroit.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
