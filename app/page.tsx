import Link from "next/link"
import { ArrowRight, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 font-bold">
          <QrCode className="h-6 w-6" />
          <span>QR Creator</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost">Tableau de bord</Button>
          </Link>
          <Link href="/create">
            <Button>Créer un QR code</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-gray-100 py-20 dark:from-background dark:to-background/80">
          <div className="container flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Créez des QR codes <span className="text-primary">personnalisés</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                Générez des QR codes uniques avec des couleurs, logos et formes personnalisées. Suivez les statistiques
                et gérez tous vos codes en un seul endroit.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/create">
                <Button size="lg" className="gap-1">
                  Créer un QR code
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Voir mes QR codes
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-24">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">QR Codes Statiques & Dynamiques</h3>
              <p className="text-muted-foreground">
                Créez des QR codes statiques ou dynamiques que vous pourrez modifier après leur création.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <circle cx="13.5" cy="6.5" r="2.5" />
                  <path d="M21.64 12.26a3 3 0 0 0-1.4-4 3 3 0 0 0-4 1.4l-3.5 6.08a3 3 0 0 0 1.4 4 3 3 0 0 0 4-1.4l3.5-6.08z" />
                  <path d="M11.5 15.5 8.58 10A3.69 3.69 0 0 0 6.75 8c-1.5 0-2.75.5-2.75 2s1.25 2 2.75 2c.97 0 1.97-.25 2.75-1" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">Personnalisation Avancée</h3>
              <p className="text-muted-foreground">
                Modifiez les couleurs, ajoutez un logo, choisissez la forme des pixels et bien plus encore.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="M4.93 4.93l2.83 2.83" />
                  <path d="M16.24 16.24l2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                  <path d="M4.93 19.07l2.83-2.83" />
                  <path d="M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">Statistiques et Suivi</h3>
              <p className="text-muted-foreground">
                Suivez le nombre de scans, la localisation et les appareils utilisés pour vos QR codes dynamiques.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-100 py-12 dark:bg-muted/30 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-[800px] text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Fonctionnalités</h2>
              <p className="text-muted-foreground">
                Tout ce dont vous avez besoin pour créer des QR codes professionnels
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">Simple</h3>
                  <p className="text-muted-foreground">Pour les besoins basiques</p>
                </div>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    QR codes statiques
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Personnalisation basique
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Export PNG
                  </li>
                </ul>
                <Link href="/create">
                  <Button className="w-full">Commencer</Button>
                </Link>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">Avancé</h3>
                  <p className="text-muted-foreground">Pour les professionnels</p>
                </div>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    QR codes dynamiques
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Personnalisation avancée
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Statistiques de scan
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Export PNG, SVG, PDF
                  </li>
                </ul>
                <Link href="/create">
                  <Button className="w-full">Essayer</Button>
                </Link>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">Personnalisé</h3>
                  <p className="text-muted-foreground">Pour les grandes équipes</p>
                </div>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Toutes les fonctionnalités
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Création en masse
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Tous formats d'export
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Statistiques avancées
                  </li>
                </ul>
                <Link href="/create">
                  <Button className="w-full">Essayer</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
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

