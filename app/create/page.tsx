"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, QrCode, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRCodePreview } from "@/components/qr-code-preview"
import { ColorPicker } from "@/components/color-picker"
import { createQRCode } from "@/lib/qr-service"
import { toast } from "@/hooks/use-toast"

export default function CreatePage() {
  const router = useRouter()
  const [qrData, setQrData] = useState({
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
  })
  const [isCreating, setIsCreating] = useState(false)

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setQrData({ ...qrData, content: e.target.value })
  }

  const handleTypeChange = (value: string) => {
    setQrData({ ...qrData, type: value, content: "" })
  }

  const handleDynamicChange = (value: string) => {
    setQrData({ ...qrData, isDynamic: value === "dynamic" })
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

  const handleSaveQRCode = async () => {
    if (!qrData.content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le contenu du QR code",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)

      // Générer un nom par défaut si nécessaire
      let qrName = ""
      if (qrData.type === "url") {
        try {
          qrName = new URL(qrData.content).hostname
        } catch {
          qrName = `QR Code ${new Date().toLocaleDateString()}`
        }
      } else {
        qrName = `QR Code ${new Date().toLocaleDateString()}`
      }

      const newQRCode = createQRCode({
        name: qrName,
        type: qrData.type,
        content: qrData.content,
        isDynamic: qrData.isDynamic,
        foregroundColor: qrData.foregroundColor,
        backgroundColor: qrData.backgroundColor,
        cornerSquareColor: qrData.cornerSquareColor,
        cornerDotColor: qrData.cornerDotColor,
        logoImage: qrData.logoImage,
        logoWidth: qrData.logoWidth,
        logoHeight: qrData.logoHeight,
        dotStyle: qrData.dotStyle,
        cornerSquareStyle: qrData.cornerSquareStyle,
        cornerDotStyle: qrData.cornerDotStyle,
      })

      toast({
        title: "Succès",
        description: "QR code enregistré avec succès",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du QR code:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du QR code",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDownload = () => {
    if (!qrData.content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le contenu du QR code avant de télécharger",
        variant: "destructive",
      })
      return
    }

    // Trouver l'élément canvas du QR code
    const qrCanvas = document.querySelector(".qr-code-preview canvas") as HTMLCanvasElement

    if (!qrCanvas) {
      toast({
        title: "Erreur",
        description: "Impossible de trouver le QR code à télécharger",
        variant: "destructive",
      })
      return
    }

    // Créer un lien de téléchargement
    const link = document.createElement("a")
    link.download = `qrcode-${Date.now()}.png`
    link.href = qrCanvas.toDataURL("image/png")
    link.click()

    toast({
      title: "Téléchargement",
      description: "Téléchargement du QR code en cours...",
    })
  }

  const getContentPlaceholder = () => {
    switch (qrData.type) {
      case "url":
        return "https://example.com"
      case "text":
        return "Entrez votre texte ici"
      case "email":
        return "contact@example.com"
      case "phone":
        return "+33612345678"
      case "sms":
        return "+33612345678"
      case "wifi":
        return "SSID"
      default:
        return ""
    }
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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/">
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
          <Link href="/dashboard">
            <Button variant="ghost">Tableau de bord</Button>
          </Link>
        </div>
      </header>
      <main className="container flex-1 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type de QR code</Label>
                    <Tabs defaultValue="url" onValueChange={handleTypeChange}>
                      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                        <TabsTrigger value="url">URL</TabsTrigger>
                        <TabsTrigger value="text">Texte</TabsTrigger>
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="phone">Téléphone</TabsTrigger>
                        <TabsTrigger value="sms">SMS</TabsTrigger>
                        <TabsTrigger value="wifi">Wi-Fi</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">{getContentLabel()}</Label>
                    <Input
                      id="content"
                      placeholder={getContentPlaceholder()}
                      value={qrData.content}
                      onChange={handleContentChange}
                    />
                  </div>
                  {renderAdditionalFields()}
                  <div className="space-y-2">
                    <Label>Type de QR code</Label>
                    <RadioGroup defaultValue="static" className="flex" onValueChange={handleDynamicChange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="static" id="static" />
                        <Label htmlFor="static">Statique</Label>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <RadioGroupItem value="dynamic" id="dynamic" />
                        <Label htmlFor="dynamic">Dynamique</Label>
                      </div>
                    </RadioGroup>
                  </div>
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
                        <Select defaultValue="square" onValueChange={(value) => handleStyleChange(value, "dot")}>
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
                          defaultValue="square"
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
                        <Select defaultValue="square" onValueChange={(value) => handleStyleChange(value, "cornerDot")}>
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
                <div className="qr-code-preview">
                  <QRCodePreview qrData={qrData} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-medium">Télécharger & Partager</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select defaultValue="png">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="svg">SVG</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Taille</Label>
                    <Select defaultValue="1000">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500">500 x 500 px</SelectItem>
                        <SelectItem value="1000">1000 x 1000 px</SelectItem>
                        <SelectItem value="2000">2000 x 2000 px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Button className="w-full gap-2" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    Télécharger
                  </Button>
                  <Button variant="outline" className="w-full gap-2" disabled={!qrData.content}>
                    <Share2 className="h-4 w-4" />
                    Partager
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-medium">Enregistrer ce QR code</h3>
                <Button className="w-full" onClick={handleSaveQRCode} disabled={isCreating || !qrData.content}>
                  {isCreating ? "Sauvegarde en cours..." : "Sauvegarder"}
                </Button>
              </CardContent>
            </Card>
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
