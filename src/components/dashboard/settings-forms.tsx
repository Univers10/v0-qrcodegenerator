"use client"

import { Loader2, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useState, useSyncExternalStore, useTransition } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfileAction } from "@/lib/actions"
import { authClient } from "@/lib/auth/client"
import { cn } from "@/lib/utils"

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter()
  const [value, setValue] = useState(name)
  const [pending, startTransition] = useTransition()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Ces informations ne sont visibles que par vous.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Nom</Label>
          <Input id="profile-name" value={value} onChange={(e) => setValue(e.target.value)} maxLength={60} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={email} disabled />
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button
          disabled={pending || value.trim() === name}
          onClick={() =>
            startTransition(async () => {
              const result = await updateProfileAction(value)
              if (!result.ok) return void toast.error(result.error)
              toast.success("Profil mis à jour")
              router.refresh()
            })
          }
        >
          {pending && <Loader2 className="animate-spin" />} Enregistrer
        </Button>
      </CardFooter>
    </Card>
  )
}

export function PasswordForm() {
  const [loading, setLoading] = useState(false)
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const currentPassword = String(form.get("current"))
    const newPassword = String(form.get("next"))
    if (newPassword !== String(form.get("confirm"))) return void toast.error("Les mots de passe ne correspondent pas")
    setLoading(true)
    const { error } = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })
    setLoading(false)
    if (error) return void toast.error(error.code === "INVALID_PASSWORD" ? "Mot de passe actuel incorrect" : error.message ?? "Échec")
    toast.success("Mot de passe modifié", { description: "Les autres sessions ont été déconnectées." })
    formEl.reset()
  }
  return (
    <Card>
      <form onSubmit={onSubmit} className="contents">
        <CardHeader>
          <CardTitle>Mot de passe</CardTitle>
          <CardDescription>8 caractères minimum. Les autres appareils seront déconnectés.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="current">Actuel</Label>
            <Input id="current" name="current" type="password" autoComplete="current-password" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="next">Nouveau</Label>
            <Input id="next" name="next" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirmation</Label>
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Modifier le mot de passe
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export function AppearanceForm() {
  const { theme, setTheme } = useTheme()
  // Le thème n'est connu qu'après hydratation : on évite tout décalage serveur/client.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const options = [
    { value: "light", label: "Clair", icon: Sun },
    { value: "dark", label: "Sombre", icon: Moon },
    { value: "system", label: "Système", icon: Monitor },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apparence</CardTitle>
        <CardDescription>Choisissez le thème de l&apos;interface.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors hover:border-primary/40",
              mounted && theme === o.value && "border-primary bg-primary/5 ring-1 ring-primary",
            )}
          >
            <o.icon className="size-5" />
            {o.label}
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

export function DangerZone() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Zone de danger</CardTitle>
        <CardDescription>
          La suppression du compte efface définitivement vos QR codes et leurs statistiques. Les QR dynamiques imprimés
          cesseront de fonctionner.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Supprimer mon compte</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
              <AlertDialogDescription>Saisissez votre mot de passe pour confirmer. Cette action est irréversible.</AlertDialogDescription>
            </AlertDialogHeader>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" autoComplete="current-password" />
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                disabled={!password || loading}
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={async (e) => {
                  e.preventDefault()
                  setLoading(true)
                  const { error } = await authClient.deleteUser({ password })
                  setLoading(false)
                  if (error) return void toast.error(error.code === "INVALID_PASSWORD" ? "Mot de passe incorrect" : error.message ?? "Échec")
                  toast.success("Compte supprimé")
                  router.push("/")
                  router.refresh()
                }}
              >
                {loading && <Loader2 className="animate-spin" />} Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
