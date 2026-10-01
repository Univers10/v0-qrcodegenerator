import Link from "next/link"
import { redirect } from "next/navigation"

import { AuthShowcase } from "@/components/auth/auth-showcase"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { getSession } from "@/lib/auth"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getSession()) redirect("/dashboard")
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          En continuant, vous acceptez nos{" "}
          <Link href="/legal/terms" className="underline underline-offset-2 hover:text-foreground">
            conditions d&apos;utilisation
          </Link>{" "}
          et notre{" "}
          <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-foreground">
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
      <AuthShowcase />
    </div>
  )
}
