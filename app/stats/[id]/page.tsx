"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { getQRCodeById } from "@/lib/local-storage"

export default function StatsPage({ params }: { params: { id: string } }) {
  const [timeRange, setTimeRange] = useState("7days")
  const [qrCode, setQrCode] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadQRCode = () => {
      const qrCodeData = getQRCodeById(params.id)
      if (qrCodeData) {
        setQrCode(qrCodeData)
      }
      setIsLoading(false)
    }

    loadQRCode()
  }, [params.id])

  // Données fictives pour les statistiques
  const dailyData = [
    { date: "2023-11-01", scans: 12 },
    { date: "2023-11-02", scans: 18 },
    { date: "2023-11-03", scans: 15 },
    { date: "2023-11-04", scans: 25 },
    { date: "2023-11-05", scans: 32 },
    { date: "2023-11-06", scans: 28 },
    { date: "2023-11-07", scans: 20 },
  ]

  const deviceData = [
    { device: "Mobile", scans: 85 },
    { device: "Desktop", scans: 35 },
    { device: "Tablet", scans: 20 },
  ]

  const locationData = [
    { location: "France", scans: 65 },
    { location: "États-Unis", scans: 25 },
    { location: "Allemagne", scans: 15 },
    { location: "Royaume-Uni", scans: 12 },
    { location: "Canada", scans: 8 },
    { location: "Autres", scans: 15 },
  ]

  const timeData = [
    { hour: "00:00", scans: 2 },
    { hour: "02:00", scans: 1 },
    { hour: "04:00", scans: 0 },
    { hour: "06:00", scans: 3 },
    { hour: "08:00", scans: 10 },
    { hour: "10:00", scans: 15 },
    { hour: "12:00", scans: 22 },
    { hour: "14:00", scans: 18 },
    { hour: "16:00", scans: 25 },
    { hour: "18:00", scans: 30 },
    { hour: "20:00", scans: 20 },
    { hour: "22:00", scans: 8 },
  ]

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  if (!qrCode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">QR code non trouvé</h1>
          <Link href="/dashboard">
            <Button>Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    )
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
          <Link href="/dashboard">
            <Button variant="ghost">Tableau de bord</Button>
          </Link>
        </div>
      </header>
      <main className="container flex-1 py-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Statistiques</h1>
            <p className="text-muted-foreground">
              QR Code: {qrCode.name} (ID: {params.id})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 derniers jours</SelectItem>
                <SelectItem value="30days">30 derniers jours</SelectItem>
                <SelectItem value="90days">90 derniers jours</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
                <SelectItem value="all">Tout le temps</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qrCode.scans || 0}</div>
              <p className="text-xs text-muted-foreground">+18% par rapport à la période précédente</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scans uniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor((qrCode.scans || 0) * 0.76)}</div>
              <p className="text-xs text-muted-foreground">+12% par rapport à la période précédente</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scans aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">+5 par rapport à hier</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.8%</div>
              <p className="text-xs text-muted-foreground">+2.3% par rapport à la période précédente</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="devices">Appareils</TabsTrigger>
              <TabsTrigger value="locations">Localisations</TabsTrigger>
              <TabsTrigger value="time">Heures</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Scans quotidiens</CardTitle>
                  <CardDescription>Nombre de scans par jour sur la période sélectionnée</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        scans: {
                          label: "Scans",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <LineChart
                        accessibilityLayer
                        data={dailyData}
                        margin={{
                          top: 20,
                          right: 20,
                          bottom: 20,
                          left: 20,
                        }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="scans"
                          stroke="var(--color-scans)"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="devices">
              <Card>
                <CardHeader>
                  <CardTitle>Scans par appareil</CardTitle>
                  <CardDescription>Répartition des scans par type d'appareil</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        scans: {
                          label: "Scans",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <BarChart
                        accessibilityLayer
                        data={deviceData}
                        margin={{
                          top: 20,
                          right: 20,
                          bottom: 20,
                          left: 20,
                        }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="device" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="scans" fill="var(--color-scans)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="locations">
              <Card>
                <CardHeader>
                  <CardTitle>Scans par pays</CardTitle>
                  <CardDescription>Répartition des scans par localisation géographique</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        scans: {
                          label: "Scans",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <BarChart
                        accessibilityLayer
                        data={locationData}
                        layout="vertical"
                        margin={{
                          top: 20,
                          right: 20,
                          bottom: 20,
                          left: 80,
                        }}
                      >
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="location" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="scans" fill="var(--color-scans)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="time">
              <Card>
                <CardHeader>
                  <CardTitle>Scans par heure</CardTitle>
                  <CardDescription>Répartition des scans par tranche horaire</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        scans: {
                          label: "Scans",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <BarChart
                        accessibilityLayer
                        data={timeData}
                        margin={{
                          top: 20,
                          right: 20,
                          bottom: 20,
                          left: 20,
                        }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="scans" fill="var(--color-scans)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
