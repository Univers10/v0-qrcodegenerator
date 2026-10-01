import { BarChart3, PencilLine, Sparkles } from "lucide-react"

const POINTS = [
  { icon: PencilLine, title: "Modifiable après impression", text: "Changez la destination sans réimprimer." },
  { icon: BarChart3, title: "Statistiques détaillées", text: "Appareils, pays, heures de pointe." },
  { icon: Sparkles, title: "Design à votre image", text: "Logo, couleurs, dégradés et cadres." },
]

export function AuthShowcase() {
  return (
    <div className="relative hidden overflow-hidden bg-[linear-gradient(150deg,oklch(0.32_0.15_277),oklch(0.22_0.08_290)_60%,oklch(0.18_0.04_285))] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 bg-grid opacity-[0.15] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
      <div className="absolute -top-32 -right-32 size-[28rem] rounded-full bg-[oklch(0.6_0.22_300)] opacity-30 blur-3xl" />
      <p className="relative text-sm font-medium text-white/60">QR Creator · UNIVERS10</p>
      <div className="relative space-y-10">
        <h2 className="max-w-md text-4xl font-semibold tracking-tight text-balance">
          Chaque scan devient une information utile.
        </h2>
        <ul className="space-y-5">
          {POINTS.map((p) => (
            <li key={p.title} className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                <p.icon className="size-5" />
              </span>
              <span>
                <span className="block font-medium">{p.title}</span>
                <span className="text-sm text-white/65">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-sm text-white/50">Gratuit · Sans carte bancaire · Sans publicité</p>
    </div>
  )
}
