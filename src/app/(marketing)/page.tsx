import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  FileDown,
  GraduationCap,
  HeartPulse,
  Hotel,
  ImageIcon,
  Infinity as InfinityIcon,
  Minus,
  Package,
  Palette,
  PencilLine,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Zap,
} from "lucide-react"
import Link from "next/link"

import { HeroDemo } from "@/components/marketing/hero-demo"
import { MenuShowcasePhone } from "@/components/marketing/menu-showcase"
import { Reveal } from "@/components/marketing/reveal"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TYPE_META, TYPE_ORDER } from "@/lib/qr/meta"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <>
      <Hero />
      <UseCases />
      <Features />
      <Types />
      <RestaurantMenus />
      <Steps />
      <AnalyticsShowcase />
      <Comparison />
      <Faq />
      <FinalCta />
    </>
  )
}

/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="absolute top-[-20%] left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_18%,transparent),transparent)]" />
      <div className="container-page grid items-center gap-16 pt-14 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-24 lg:pb-28">
        <div className="text-center lg:text-left">
          <Reveal>
            <Link
              href="/generator"
              className="group inline-flex items-center gap-2 rounded-full border bg-card/60 py-1 pr-3 pl-1 text-xs shadow-sm backdrop-blur transition-colors hover:border-primary/40"
            >
              <Badge className="rounded-full px-2 py-0.5 text-[10px]">Nouveau</Badge>
              Cadres personnalisés et analyse de lisibilité
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Des QR codes qui <span className="text-gradient">travaillent</span> pour votre marque.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-pretty text-muted-foreground lg:mx-0">
              Concevez des QR codes à votre image, modifiez leur destination même après impression et mesurez chaque
              scan : appareil, lieu, heure.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="h-12 px-6 text-base shadow-lg shadow-primary/25">
                <Link href="/signup">
                  Créer mon compte gratuit <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link href="/generator">Essayer sans compte</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              {["Sans carte bancaire", "QR statiques illimités", "Exports HD sans filigrane"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" /> {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <HeroDemo />
      </div>
    </section>
  )
}

const USE_CASES = [
  { icon: UtensilsCrossed, label: "Restaurants & menus" },
  { icon: ShoppingBag, label: "Commerce & retail" },
  { icon: CalendarDays, label: "Événements" },
  { icon: Building2, label: "Immobilier" },
  { icon: Package, label: "Packaging" },
  { icon: Hotel, label: "Hôtellerie" },
  { icon: HeartPulse, label: "Santé" },
  { icon: GraduationCap, label: "Éducation" },
  { icon: Smartphone, label: "Cartes de visite" },
  { icon: ImageIcon, label: "Affichage" },
]

function UseCases() {
  return (
    <section className="border-y bg-muted/30 py-8">
      <p className="mb-6 text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Pensé pour tous les métiers
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
          {[...USE_CASES, ...USE_CASES].map((u, i) => (
            <span key={i} className="flex items-center gap-2 text-sm font-medium whitespace-nowrap text-muted-foreground">
              <u.icon className="size-4" /> {u.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionHeading({ eyebrow, title, text, id }: { eyebrow: string; title: React.ReactNode; text: string; id?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p id={id} className="scroll-mt-24 text-sm font-medium text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      <p className="mt-4 text-pretty text-muted-foreground">{text}</p>
    </Reveal>
  )
}

function Features() {
  return (
    <section className="container-page py-24">
      <SectionHeading
        id="fonctionnalites"
        eyebrow="Fonctionnalités"
        title="Tout ce qu'il faut pour des QR codes professionnels"
        text="Les outils des plateformes leaders, dans une interface simple, rapide et agréable."
      />
      <div className="mt-14 grid gap-4 md:grid-cols-6">
        <Bento className="md:col-span-4" icon={PencilLine} title="Dynamiques et modifiables à tout moment" text="Vos QR codes pointent vers un lien court. Changez la destination en un clic : les supports déjà imprimés restent valides.">
          <div className="mt-6 space-y-2 rounded-xl border bg-background/60 p-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-muted-foreground line-through decoration-destructive/60">
              <span className="size-1.5 rounded-full bg-destructive/60" /> boutique.fr/soldes-hiver
            </div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-success" /> boutique.fr/nouvelle-collection
              <Badge variant="secondary" className="ml-auto font-sans text-[10px]">Mis à jour</Badge>
            </div>
          </div>
        </Bento>
        <Bento className="md:col-span-2" icon={BarChart3} title="Analytique en temps réel" text="Scans, visiteurs uniques, appareils, pays et heures de pointe.">
          <MiniChart />
        </Bento>
        <Bento className="md:col-span-2" icon={Palette} title="Design sur mesure" text="6 formes de modules, repères, dégradés et 8 modèles prêts à l'emploi.">
          <div className="mt-6 flex gap-2">
            {["#4f46e5", "#db2777", "#0891b2", "#16a34a"].map((c) => (
              <span key={c} className="h-10 flex-1 rounded-lg" style={{ background: `linear-gradient(135deg, ${c}, color-mix(in oklch, ${c} 50%, white))` }} />
            ))}
          </div>
        </Bento>
        <Bento className="md:col-span-2" icon={Sparkles} title="Logo et cadres d'appel à l'action" text="Ajoutez votre logo et un cadre « Scannez-moi » qui augmente l'engagement." />
        <Bento className="md:col-span-2" icon={FileDown} title="Exports haute définition" text="PNG et JPG jusqu'à 4096 px, SVG vectoriel et PDF prêt à imprimer.">
          <div className="mt-5 flex flex-wrap gap-1.5">
            {["PNG", "SVG", "PDF", "JPG"].map((f) => (
              <span key={f} className="rounded-md border bg-background px-2 py-1 font-mono text-xs">
                .{f.toLowerCase()}
              </span>
            ))}
          </div>
        </Bento>
        <Bento className="md:col-span-3" icon={Smartphone} title="Pages mobiles élégantes" text="Carte de visite, Wi-Fi, événement : vos contacts découvrent une page soignée avec les bons boutons d'action." />
        <Bento className="md:col-span-3" icon={ShieldCheck} title="Respect de la vie privée" text="Aucune adresse IP stockée : les visiteurs uniques sont comptés via une empreinte anonyme renouvelée chaque jour." />
      </div>
    </section>
  )
}

function Bento({
  icon: Icon,
  title,
  text,
  className,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  text: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <Reveal className={cn("group relative overflow-hidden rounded-2xl border bg-card p-6 transition-shadow hover:shadow-lg", className)}>
      <div className="absolute -top-24 -right-24 size-48 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
      <span className="relative grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="relative mt-4 font-semibold">{title}</h3>
      <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
      <div className="relative">{children}</div>
    </Reveal>
  )
}

function MiniChart() {
  const points = [12, 18, 15, 24, 22, 31, 28, 36, 33, 42, 39, 48]
  const max = Math.max(...points)
  const path = points.map((p, i) => `${(i / (points.length - 1)) * 200},${60 - (p / max) * 52}`).join(" ")
  return (
    <svg viewBox="0 0 200 64" className="mt-6 h-16 w-full text-chart-1" aria-hidden="true" preserveAspectRatio="none">
      <polygon points={`0,64 ${path} 200,64`} className="fill-current opacity-10" />
      <polyline points={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Types() {
  return (
    <section className="relative border-y bg-muted/30 py-24">
      <div className="container-page">
        <SectionHeading
          id="types"
          eyebrow="11 types de contenu"
          title="Un QR code pour chaque usage"
          text="Du simple lien à la carte de visite complète, chaque type génère le bon format, reconnu par tous les smartphones."
        />
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TYPE_ORDER.map((type, i) => {
            const meta = TYPE_META[type]
            return (
              <Reveal key={type} delay={i * 0.03}>
                <Link
                  href={`/generator?type=${type}`}
                  className="group flex h-full flex-col gap-3 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                >
                  <span
                    className="grid size-10 place-items-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ background: `color-mix(in oklch, ${meta.accent} 14%, transparent)`, color: meta.accent }}
                  >
                    <meta.icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{meta.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{meta.description}</span>
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const MENU_FEATURES = [
  { title: "Photos, prix et déclinaisons", text: "Verre ou bouteille, tailles, formules : une carte claire et appétissante, même en 3G." },
  { title: "Allergènes et régimes", text: "Végétarien, vegan, sans gluten, halal… avec filtres pour vos clients." },
  { title: "Prix modifiables en direct", text: "Changez un tarif ou marquez un plat « Épuisé » : c'est immédiat, sans réimpression." },
  { title: "Infos pratiques", text: "Horaires, appel, itinéraire et Wi-Fi offert accessibles en un geste." },
  { title: "Deux mises en page, quatre styles", text: "Photos en vedette façon appli, ou carte gastronomique aux prix alignés." },
  { title: "Toutes les devises", text: "Euro, franc CFA, dirham, dollar… avec le bon format de prix." },
]

function RestaurantMenus() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(60%_50%_at_80%_40%,oklch(0.85_0.1_70/0.25),transparent)]" />
      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Reveal>
            <p id="menus" className="scroll-mt-24 text-sm font-medium text-primary">
              Restaurants, cafés et hôtels
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Votre carte digitale, prête en 10 minutes.
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Un QR code sur chaque table ouvre une carte soignée, à votre image. Ajoutez vos plats et vos photos, et
              mettez la carte à jour quand vous voulez : le QR code imprimé ne change jamais.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {MENU_FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.04} className="flex gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Check className="size-3.5" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{f.title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{f.text}</span>
                </span>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6 text-base shadow-lg shadow-primary/25">
                <Link href={`/signup?next=${encodeURIComponent("/dashboard/codes/new?type=menu")}`}>
                  <UtensilsCrossed /> Créer mon menu
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link href="/generator?type=menu">Essayer l&apos;éditeur</Link>
              </Button>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <MenuShowcasePhone />
        </Reveal>
      </div>
    </section>
  )
}

function Steps() {
  const steps = [
    { title: "Choisissez le contenu", text: "Lien, vCard, Wi-Fi, événement… Remplissez quelques champs, la validation se fait en direct." },
    { title: "Personnalisez le design", text: "Modèle, couleurs, logo et cadre. L'analyse de lisibilité vous guide pour un scan parfait." },
    { title: "Téléchargez et mesurez", text: "Exportez en HD, imprimez, puis suivez les scans depuis votre tableau de bord." },
  ]
  return (
    <section className="container-page py-24">
      <SectionHeading eyebrow="Comment ça marche" title="Prêt en moins d'une minute" text="Aucune compétence technique requise." />
      <div className="relative mt-14 grid gap-6 md:grid-cols-3">
        <div className="absolute top-6 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.08} className="relative text-center">
            <span className="relative mx-auto grid size-12 place-items-center rounded-2xl border bg-card text-lg font-semibold shadow-sm">
              {i + 1}
            </span>
            <h3 className="mt-5 font-semibold">{step.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{step.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function AnalyticsShowcase() {
  const bars = [3, 2, 1, 1, 2, 5, 9, 14, 18, 16, 15, 19, 24, 20, 17, 18, 22, 27, 31, 26, 19, 13, 8, 5]
  const max = Math.max(...bars)
  return (
    <section className="relative overflow-hidden border-y bg-muted/30 py-24">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <p id="analytique" className="scroll-mt-24 text-sm font-medium text-primary">
              Analytique
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Comprenez qui scanne, où et quand.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Chaque QR code dynamique dispose de son tableau de bord : tendance des scans, visiteurs uniques, appareils,
              systèmes, navigateurs, pays, villes et carte de chaleur des heures de pointe. Exportez tout en CSV.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Tendance jour par jour",
                "Visiteurs uniques anonymisés",
                "Répartition par appareil et OS",
                "Pays et villes",
                "Heures et jours de pointe",
                "Export CSV en un clic",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scans par heure</p>
                <p className="mt-1 text-xs text-muted-foreground">Exemple de tableau de bord</p>
              </div>
              <Badge variant="secondary">30 derniers jours</Badge>
            </div>
            <div className="mt-6 flex h-40 items-end gap-[2px]" aria-hidden="true">
              {bars.map((b, i) => (
                <div key={i} className="flex flex-1 justify-center">
                  <div
                    className={cn("w-full max-w-6 rounded-t-[4px]", i === 18 ? "bg-chart-1" : "bg-chart-1/35")}
                    style={{ height: `${(b / max) * 160}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground tabular-nums">
              <span>0 h</span>
              <span>6 h</span>
              <span>12 h</span>
              <span>18 h</span>
              <span>23 h</span>
            </div>
            <p className="mt-4 text-sm">
              Pic d&apos;affluence à <span className="font-semibold">18 h</span> : idéal pour programmer vos campagnes.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Comparison() {
  const rows: [string, boolean, boolean][] = [
    ["Gratuit et illimité", true, true],
    ["Design, logo et cadre personnalisés", true, true],
    ["Fonctionne sans connexion au service", true, false],
    ["Destination modifiable après impression", false, true],
    ["Statistiques de scan détaillées", false, true],
    ["Mise en pause à tout moment", false, true],
    ["Motif plus léger (lien court)", false, true],
  ]
  return (
    <section className="container-page py-24">
      <SectionHeading
        id="comparatif"
        eyebrow="Statique ou dynamique ?"
        title="Choisissez le bon QR code"
        text="Les deux sont inclus. Le dynamique est recommandé pour tout support imprimé."
      />
      <Reveal className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="p-4 text-left font-medium">Fonctionnalité</th>
              <th className="w-28 p-4 font-medium">Statique</th>
              <th className="w-28 p-4 font-medium">
                <span className="inline-flex items-center gap-1 text-primary">
                  <Zap className="size-3.5" /> Dynamique
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, s, d]) => (
              <tr key={label} className="border-b last:border-0">
                <td className="p-4">{label}</td>
                {[s, d].map((v, i) => (
                  <td key={i} className="p-4 text-center">
                    {v ? (
                      <Check className="mx-auto size-4 text-success" aria-label="Oui" />
                    ) : (
                      <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="Non" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </section>
  )
}

const FAQ = [
  {
    q: "Quelle est la différence entre un QR code statique et dynamique ?",
    a: "Un QR statique contient directement l'information (lien, texte, Wi-Fi…) : il est permanent mais non modifiable. Un QR dynamique contient un lien court vers notre service, qui redirige vers votre contenu : vous pouvez le modifier à tout moment et suivre ses scans.",
  },
  {
    q: "Mes QR codes expirent-ils ?",
    a: "Non. Les QR statiques fonctionnent pour toujours. Les QR dynamiques restent actifs tant que votre compte existe, et vous pouvez les mettre en pause ou les réactiver quand vous le souhaitez.",
  },
  {
    q: "Puis-je ajouter mon logo sans gêner la lecture ?",
    a: "Oui. Le QR code utilise la correction d'erreur pour rester lisible malgré le logo. Notre analyse de lisibilité vous alerte si le logo est trop grand, si le contraste est insuffisant ou si la marge est trop faible.",
  },
  {
    q: "Quel format choisir pour l'impression ?",
    a: "Le SVG (vectoriel) ou le PDF sont idéaux pour l'impression professionnelle car ils restent nets à toutes les tailles. Le PNG haute définition convient au web et aux réseaux sociaux.",
  },
  {
    q: "Quelles données sont collectées lors d'un scan ?",
    a: "Le type d'appareil, le système, le navigateur, le pays et la ville approximative. Les adresses IP ne sont jamais enregistrées : nous ne conservons qu'une empreinte anonyme et quotidienne pour compter les visiteurs uniques.",
  },
  {
    q: "Comment fonctionne le menu digital pour restaurant ?",
    a: "Composez votre carte (catégories, plats, prix, photos, allergènes) puis imprimez le QR code sur vos tables. Vos clients ouvrent la carte sans application. Chaque modification, comme un prix, un nouveau plat ou un plat épuisé, est visible immédiatement, sans réimprimer.",
  },
  {
    q: "Ai-je besoin d'un compte ?",
    a: "Non pour créer et télécharger des QR codes statiques depuis le générateur. Un compte gratuit est nécessaire pour les QR dynamiques, l'enregistrement et les statistiques.",
  },
]

function Faq() {
  return (
    <section className="border-t bg-muted/30 py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        <Reveal>
          <p id="faq" className="scroll-mt-24 text-sm font-medium text-primary">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Questions fréquentes</h2>
          <p className="mt-4 text-muted-foreground">Tout ce qu&apos;il faut savoir pour bien démarrer.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="rounded-2xl border bg-card px-6">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-left text-[15px]">{item.q}</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="container-page py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,oklch(0.42_0.2_277),oklch(0.45_0.2_310))] px-6 py-16 text-center text-white shadow-2xl sm:px-16">
          <div className="absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse,black,transparent_70%)]" />
          <InfinityIcon className="relative mx-auto size-10 opacity-80" />
          <h2 className="relative mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Votre premier QR code dynamique en 30 secondes.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/75">
            Créez un compte gratuit, personnalisez votre design et commencez à mesurer l&apos;impact de vos supports.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-white px-6 text-base text-zinc-900 hover:bg-white/90">
              <Link href="/signup">
                Commencer gratuitement <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-12 px-6 text-base text-white hover:bg-white/10 hover:text-white">
              <Link href="/generator">Ouvrir le générateur</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
