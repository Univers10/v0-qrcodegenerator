"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, QrCode, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRCodePreview } from "@/components/qr-code-preview"
import { ColorPicker } from "@/components/color-picker"
import { getQRCodeById, updateQRCode } from "@/lib/qr-service"
import { toast } from "@/hooks/use-toast"

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [qrData, setQrData] = useState({
    id: "",
    name: "",
    type: "url",
    content: "",
    isDynamic: false,
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    cornerSquareColor: "#000000",
    cornerDotColor: "#000000",
    logoImage: "",
    logoWidth: 50,
    logoHeight: 50,
    dotStyle: "square",
    cornerSquareStyle: "square",
    cornerDotStyle: "square",
    createdAt: "",
    scans: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Charger les données du QR code
    const qrCode = getQRCodeById(params.id)
    if (qrCode) {
      setQrData(qrCode)
      setIsLoading(false)
    } else {
      toast({
        title: "Erreur",
        description: "QR code non trouvé",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [params.id, router])

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setQrData({ ...qrData, content: e.target.value })
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQrData({ ...qrData, name: e.target.value })
  }

  const handleColorChange = (color: string, type: "foreground" | "background" | "cornerSquare" | "cornerDot") => {
    if (type === "foreground") {
      setQrData({ ...qrData, foregroundColor: color })
    } else if (type === "background") {
      setQrData({ ...qrData, backgroundColor: color })
    } else if (type === "cornerSquare") {
      setQrData({ ...qrData, cornerSquareColor: color })
    } else if (type === "cornerDot") {
      setQrData({ ...qrData, cornerDotColor: color })
    }
  }

  const handleStyleChange = (value: string, type: "dot" | "cornerSquare" | "cornerDot") => {
    if (type === "dot") {
      setQrData({ ...qrData, dotStyle: value })
    } else if (type === "cornerSquare") {
      setQrData({ ...qrData, cornerSquareStyle: value })
    } else if (type === "cornerDot") {
      setQrData({ ...qrData, cornerDotStyle: value })
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setQrData({ ...qrData, logoImage: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveQRCode = () => {
    if (!qrData.content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le contenu du QR code",
        variant: "destructive",
      })
      return
    }

    updateQRCode(qrData.id, qrData)

    toast({
      title: "Succès",
      description: "QR code mis à jour avec succès",
    })

    router.push("/dashboard")
  }

  const getContentLabel = () => {
    switch (qrData.type) {
      case "url":
        return "URL"
      case "text":
        return "Texte"
      case "email":
        return "Adresse email"
      case "phone":
        return "Numéro de téléphone"
      case "sms":
        return "Numéro de téléphone"
      case "wifi":
        return "Nom du réseau (SSID)"
      default:
        return "Contenu"
    }
  }

  const renderAdditionalFields = () => {
    switch (qrData.type) {
      case "wifi":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" placeholder="Mot de passe du réseau" />
            </div>
            <div className="space-y-2">
              <Label>Type de sécurité</Label>
              <Select defaultValue="WPA">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="NONE">Aucun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )
      case "sms":
        return (
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input id="message" placeholder="Message (optionnel)" />
          </div>
        )
      case "email":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input id="subject" placeholder="Sujet de l'email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Corps du message</Label>
              <Input id="body" placeholder="Corps du message" />
            </div>
          </>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 font-bold">
            <QrCode className="h-6 w-6" />
            <span>QR Creator</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleSaveQRCode} className="gap-2">
            <Save className="h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </header>
      <main className="container flex-1 py-6">
        <h1 className="mb-6 text-2xl font-bold">Modifier le QR code</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du QR code</Label>
                    <Input id="name" placeholder="Nom du QR code" value={qrData.name} onChange={handleNameChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Type de QR code</Label>
                    <div className="rounded-md border px-4 py-2 text-sm text-muted-foreground">
                      {qrData.type.charAt(0).toUpperCase() + qrData.type.slice(1)}
                      {qrData.isDynamic ? " (Dynamique)" : " (Statique)"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">{getContentLabel()}</Label>
                    <Input id="content" placeholder="Contenu" value={qrData.content} onChange={handleContentChange} />
                  </div>
                  {renderAdditionalFields()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personnalisation</h3>
                  <Tabs defaultValue="colors">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="colors">Couleurs</TabsTrigger>
                      <TabsTrigger value="style">Style</TabsTrigger>
                      <TabsTrigger value="logo">Logo</TabsTrigger>
                    </TabsList>
                    <TabsContent value="colors" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Couleur des points</Label>
                        <ColorPicker
                          color={qrData.foregroundColor}
                          onChange={(color) => handleColorChange(color, "foreground")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Couleur de fond</Label>
                        <ColorPicker
                          color={qrData.backgroundColor}
                          onChange={(color) => handleColorChange(color, "background")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Couleur des coins carrés</Label>
                        <ColorPicker
                          color={qrData.cornerSquareColor}
                          onChange={(color) => handleColorChange(color, "cornerSquare")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Couleur des points de coin</Label>
                        <ColorPicker
                          color={qrData.cornerDotColor}
                          onChange={(color) => handleColorChange(color, "cornerDot")}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="style" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Style des points</Label>
                        <Select value={qrData.dotStyle} onValueChange={(value) => handleStyleChange(value, "dot")}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Carré</SelectItem>
                            <SelectItem value="dots">Rond</SelectItem>
                            <SelectItem value="rounded">Arrondi</SelectItem>
                            <SelectItem value="classy">Élégant</SelectItem>
                            <SelectItem value="classy-rounded">Élégant arrondi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Style des coins carrés</Label>
                        <Select
                          value={qrData.cornerSquareStyle}
                          onValueChange={(value) => handleStyleChange(value, "cornerSquare")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Carré</SelectItem>
                            <SelectItem value="dots">Rond</SelectItem>
                            <SelectItem value="extra-rounded">Extra arrondi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Style des points de coin</Label>
                        <Select
                          value={qrData.cornerDotStyle}
                          onValueChange={(value) => handleStyleChange(value, "cornerDot")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Carré</SelectItem>
                            <SelectItem value="dots">Rond</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                    <TabsContent value="logo" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Ajouter un logo</Label>
                        <Input type="file" accept="image/*" onChange={handleLogoUpload} />
                      </div>
                      <div className="space-y-2">
                        <Label>Taille du logo</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="logoWidth">Largeur</Label>
                            <Input
                              id="logoWidth"
                              type="number"
                              min="20"
                              max="150"
                              value={qrData.logoWidth}
                              onChange={(e) => setQrData({ ...qrData, logoWidth: Number.parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="logoHeight">Hauteur</Label>
                            <Input
                              id="logoHeight"
                              type="number"
                              min="20"
                              max="150"
                              value={qrData.logoHeight}
                              onChange={(e) => setQrData({ ...qrData, logoHeight: Number.parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <h3 className="mb-4 text-lg font-medium">Aperçu</h3>
                <QRCodePreview qrData={qrData} />
              </CardContent>
            </Card>
            {qrData.isDynamic && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-medium">Statistiques</h3>
                  <div className="flex items-center justify-between">
                    <span>Nombre de scans</span>
                    <span className="font-bold">{qrData.scans}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Conditions d'utilisation
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
