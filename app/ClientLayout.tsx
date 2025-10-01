"use client"

import type React from "react"
import { useEffect } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"
import { initLocalStorage } from "@/lib/init-storage"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Initialiser le localStorage au chargement de l'application
  useEffect(() => {
    initLocalStorage()
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}

