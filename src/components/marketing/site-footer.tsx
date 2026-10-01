import Link from "next/link"

import { Logo } from "@/components/logo"
import { site } from "@/lib/site"

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { href: "/generator", label: "Générateur gratuit" },
      { href: "/#fonctionnalites", label: "Fonctionnalités" },
      { href: "/#analytique", label: "Analytique" },
      { href: "/#types", label: "Types de QR codes" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: "/#faq", label: "Questions fréquentes" },
      { href: "/#comparatif", label: "Statique ou dynamique ?" },
      { href: "/signup", label: "Créer un compte" },
      { href: "/login", label: "Connexion" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/legal/terms", label: "Conditions d'utilisation" },
      { href: "/legal/privacy", label: "Confidentialité" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{site.description}</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="space-y-3">
            <h3 className="text-sm font-medium">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name} · {site.company}. Tous droits réservés.
          </p>
          <p>Sans publicité · Sans traceur tiers</p>
        </div>
      </div>
    </footer>
  )
}
