"use client"

import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signUp } from "@/lib/auth/client"

/** N'accepte que des chemins internes pour éviter les redirections ouvertes. */
export function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/dashboard"
}

const ERRORS: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect",
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cet email",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cet email",
  PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 8 caractères",
  PASSWORD_TOO_LONG: "Mot de passe trop long",
  INVALID_EMAIL: "Adresse email invalide",
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeNext(params.get("next"))
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")
    const name = String(form.get("name") ?? "").trim()
    setError(null)
    setLoading(true)

    const { error } =
      mode === "signup"
        ? await signUp.email({ email, password, name: name || email.split("@")[0] })
        : await signIn.email({ email, password })

    if (error) {
      setLoading(false)
      setError((error.code && ERRORS[error.code]) || error.message || "Une erreur est survenue")
      return
    }
    toast.success(mode === "signup" ? "Bienvenue sur QR Creator !" : "Ravi de vous revoir")
    router.push(next)
    router.refresh()
  }

  const nextQuery = params.get("next") ? `?next=${encodeURIComponent(next)}` : ""

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{mode === "signup" ? "Créez votre compte" : "Connexion"}</h1>
        <p className="text-sm text-muted-foreground">
          {mode === "signup"
            ? "Gratuit, sans engagement. Vos QR codes dynamiques en quelques secondes."
            : "Accédez à vos QR codes et à leurs statistiques."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" autoComplete="name" placeholder="Camille Martin" minLength={2} maxLength={60} required />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="vous@entreprise.fr" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={8}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {mode === "signup" && <p className="text-xs text-muted-foreground">8 caractères minimum.</p>}
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {mode === "signup" ? "Créer mon compte" : "Se connecter"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "signup" ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
        <Link href={`${mode === "signup" ? "/login" : "/signup"}${nextQuery}`} className="font-medium text-primary hover:underline">
          {mode === "signup" ? "Se connecter" : "Créer un compte"}
        </Link>
      </p>
    </div>
  )
}
