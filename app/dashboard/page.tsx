"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BarChart3,
  Download,
  Edit,
  Grid,
  List,
  MoreHorizontal,
  Plus,
  QrCode,
  Search,
  Share2,
  Trash,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getQRCodes, deleteQRCode } from "@/lib/qr-service"
import type { QRCodeData } from "@/lib/qr-service"
import { toast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingQRCodes, setIsLoadingQRCodes] = useState(true)

  useEffect(() => {
    // Charger les QR codes depuis localStorage
    const loadQRCodes = () => {
      try {
        setIsLoadingQRCodes(true)
        const storedQRCodes = getQRCodes()
        console.log("QR codes chargés:", storedQRCodes)
        setQrCodes(storedQRCodes)
      } catch (error) {
        console.error("Erreur lors du chargement des QR codes:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger vos QR codes",
          variant: "destructive",
        })
      } finally {
        setIsLoadingQRCodes(false)
      }
    }

    loadQRCodes()
  }, [])

  const handleDeleteQRCode = (id: string) => {
    try {
      const success = deleteQRCode(id)
      if (success) {
        // Mettre à jour la liste des QR codes après suppression
        setQrCodes(qrCodes.filter((qrCode) => qrCode.id !== id))
        toast({
          title: "Succès",
          description: "QR code supprimé avec succès",
        })
      } else {
        throw new Error("Échec de la suppression")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du QR code:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le QR code",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (qrCode: QRCodeData) => {
    // Créer un élément canvas temporaire pour générer l'image
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      // Convertir le canvas en URL de données
      const dataUrl = canvas.toDataURL("image/png")

      // Créer un lien de téléchargement
      const link = document.createElement("a")
      link.download = `${qrCode.name.replace(/\s+/g, "-")}.png`
      link.href = dataUrl
      link.click()
    }

    // Utiliser l'image du QR code ou une image par défaut
    img.src = qrCode.logoImage || "/placeholder.svg?height=300&width=300"

    toast({
      title: "Téléchargement",
      description: "Téléchargement du QR code en cours...",
    })
  }

  const handleShare = (qrCode: QRCodeData) => {
    // Vérifier si l'API Web Share est disponible
    if (navigator.share) {
      navigator
        .share({
          title: `QR Code: ${qrCode.name}`,
          text: `Voici mon QR code pour ${qrCode.content}`,
          url: window.location.origin + `/scan/${qrCode.id}`,
        })
        .then(() => {
          toast({
            title: "Partagé",
            description: "QR code partagé avec succès",
          })
        })
        .catch((error) => {
          console.error("Erreur lors du partage:", error)
          // Fallback pour le partage
          handleCopyShareLink(qrCode)
        })
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      handleCopyShareLink(qrCode)
    }
  }

  const handleCopyShareLink = (qrCode: QRCodeData) => {
    const shareUrl = window.location.origin + `/scan/${qrCode.id}`
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast({
          title: "Lien copié",
          description: "Lien de partage copié dans le presse-papiers",
        })
      })
      .catch((error) => {
        console.error("Erreur lors de la copie:", error)
        toast({
          title: "Erreur",
          description: "Impossible de copier le lien",
          variant: "destructive",
        })
      })
  }

  const filteredQRCodes = qrCodes.filter(
    (qrCode) =>
      qrCode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qrCode.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qrCode.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const dynamicQRCodes = filteredQRCodes.filter((qrCode) => qrCode.isDynamic)
  const staticQRCodes = filteredQRCodes.filter((qrCode) => !qrCode.isDynamic)
  const recentQRCodes = [...filteredQRCodes]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 6)

  const totalScans = qrCodes.reduce((total, qrCode) => total + (qrCode.scans || 0), 0)

  // Fonction pour formater la date
  const formatDate = (dateString: any) => {
    if (!dateString) return "Date inconnue"

    let date
    if (typeof dateString === "string") {
      date = new Date(dateString)
    } else {
      date = new Date(dateString)
    }

    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Fonction pour rendre les QR codes en mode grille
  const renderQRCodesGrid = (qrCodesToRender: QRCodeData[]) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {qrCodesToRender.map((qrCode) => (
        <Card key={qrCode.id}>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{qrCode.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/edit/${qrCode.id}`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload(qrCode)}>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(qrCode)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteQRCode(qrCode.id || "")}>
                    <Trash className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>
              {qrCode.type} • {qrCode.isDynamic ? "Dynamique" : "Statique"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex justify-center">
              <img
                src={qrCode.logoImage || "/placeholder.svg?height=300&width=300"}
                alt={qrCode.name}
                className="h-40 w-40 rounded-md"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-4 pt-0">
            <div className="text-sm text-muted-foreground">Créé le {formatDate(qrCode.createdAt)}</div>
            {qrCode.isDynamic && (
              <div className="flex items-center gap-1 text-sm">
                <BarChart3 className="h-4 w-4" />
                {qrCode.scans || 0} scans
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  // Fonction pour rendre les QR codes en mode liste
  const renderQRCodesList = (qrCodesToRender: QRCodeData[]) => (
    <div className="rounded-md border">
      <div className="grid grid-cols-12 gap-4 p-4 font-medium">
        <div className="col-span-4">Nom</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Date de création</div>
        <div className="col-span-2">Scans</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      {qrCodesToRender.map((qrCode) => (
        <div key={qrCode.id} className="grid grid-cols-12 gap-4 border-t p-4">
          <div className="col-span-4 flex items-center gap-3">
            <img
              src={qrCode.logoImage || "/placeholder.svg?height=100&width=100"}
              alt={qrCode.name}
              className="h-10 w-10 rounded-md"
            />
            <div>
              <div className="font-medium">{qrCode.name}</div>
              <div className="text-sm text-muted-foreground">{qrCode.isDynamic ? "Dynamique" : "Statique"}</div>
            </div>
          </div>
          <div className="col-span-2 flex items-center">{qrCode.type}</div>
          <div className="col-span-2 flex items-center">{formatDate(qrCode.createdAt)}</div>
          <div className="col-span-2 flex items-center">{qrCode.isDynamic ? `${qrCode.scans || 0} scans` : "-"}</div>
          <div className="col-span-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/edit/${qrCode.id}`)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDownload(qrCode)}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleShare(qrCode)}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteQRCode(qrCode.id || "")}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 font-bold">
            <QrCode className="h-6 w-6" />
            <span>QR Creator</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" onClick={() => router.push("/")}>
              Accueil
            </Button>
          </div>
        </div>
      </header>
      <main className="container flex-1 py-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <Link href="/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un QR code
            </Button>
          </Link>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total QR codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qrCodes.length}</div>
              <p className="text-xs text-muted-foreground">Tous vos QR codes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScans}</div>
              <p className="text-xs text-muted-foreground">Tous QR codes confondus</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">QR codes dynamiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qrCodes.filter((qr) => qr.isDynamic).length}</div>
              <p className="text-xs text-muted-foreground">Sur {qrCodes.length} QR codes</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Mes QR codes</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="dynamic">Dynamiques</TabsTrigger>
            <TabsTrigger value="static">Statiques</TabsTrigger>
            <TabsTrigger value="recent">Récents</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoadingQRCodes ? (
              <div className="flex justify-center py-12">
                <p>Chargement des QR codes...</p>
              </div>
            ) : filteredQRCodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-center text-muted-foreground">Aucun QR code trouvé</p>
                <Link href="/create">
                  <Button>Créer un QR code</Button>
                </Link>
              </div>
            ) : viewMode === "grid" ? (
              renderQRCodesGrid(filteredQRCodes)
            ) : (
              renderQRCodesList(filteredQRCodes)
            )}
          </TabsContent>

          <TabsContent value="dynamic">
            {isLoadingQRCodes ? (
              <div className="flex justify-center py-12">
                <p>Chargement des QR codes...</p>
              </div>
            ) : dynamicQRCodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-center text-muted-foreground">Aucun QR code dynamique trouvé</p>
                <Link href="/create">
                  <Button>Créer un QR code dynamique</Button>
                </Link>
              </div>
            ) : viewMode === "grid" ? (
              renderQRCodesGrid(dynamicQRCodes)
            ) : (
              renderQRCodesList(dynamicQRCodes)
            )}
          </TabsContent>

          <TabsContent value="static">
            {isLoadingQRCodes ? (
              <div className="flex justify-center py-12">
                <p>Chargement des QR codes...</p>
              </div>
            ) : staticQRCodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-center text-muted-foreground">Aucun QR code statique trouvé</p>
                <Link href="/create">
                  <Button>Créer un QR code statique</Button>
                </Link>
              </div>
            ) : viewMode === "grid" ? (
              renderQRCodesGrid(staticQRCodes)
            ) : (
              renderQRCodesList(staticQRCodes)
            )}
          </TabsContent>

          <TabsContent value="recent">
            {isLoadingQRCodes ? (
              <div className="flex justify-center py-12">
                <p>Chargement des QR codes...</p>
              </div>
            ) : recentQRCodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-center text-muted-foreground">Aucun QR code récent trouvé</p>
                <Link href="/create">
                  <Button>Créer un QR code</Button>
                </Link>
              </div>
            ) : viewMode === "grid" ? (
              renderQRCodesGrid(recentQRCodes)
            ) : (
              renderQRCodesList(recentQRCodes)
            )}
          </TabsContent>
        </Tabs>
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
