"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useSession } from "@/lib/auth/client"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#menus", label: "Menus restaurant" },
  { href: "/#types", label: "Types de QR" },
  { href: "/#analytique", label: "Analytique" },
  { href: "/#faq", label: "FAQ" },
]

export function SiteHeader() {
  const { data: session, isPending } = useSession()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300",
        scrolled && "border-border/60 bg-background/75 backdrop-blur-xl",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/generator"
            className="rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
          >
            Générateur
          </Link>
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className={cn("hidden items-center gap-1.5 transition-opacity sm:flex", isPending && "opacity-0")}>
            {session ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Tableau de bord</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button asChild size="sm" className="shadow-md shadow-primary/20">
                  <Link href="/signup">Commencer gratuitement</Link>
                </Button>
              </>
            )}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <Logo />
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {[...NAV, { href: "/generator", label: "Générateur" }].map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-md px-3 py-2.5 text-sm hover:bg-accent">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-4">
                {session ? (
                  <Button asChild>
                    <Link href="/dashboard">Tableau de bord</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline">
                      <Link href="/login">Connexion</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">Commencer gratuitement</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
