"use client"

import { BarChart3, Copy, Download, ExternalLink, Link2, MoreHorizontal, Pause, Pencil, Play, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteQrAction, duplicateQrAction, setQrStatusAction } from "@/lib/actions"
import { downloadBlob, exportQr } from "@/lib/qr/render"
import { shortUrl } from "@/lib/site"
import { slugify } from "@/lib/utils"

type Props = {
  code: { id: string; name: string; isDynamic: boolean; status: "active" | "paused"; shortCode: string }
  getSvg?: () => string | null
  /** Après suppression, rediriger vers la liste (page de détail). */
  redirectOnDelete?: boolean
  trigger?: React.ReactNode
}

export function QrActionsMenu({ code, getSvg, redirectOnDelete, trigger }: Props) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string, after?: () => void) =>
    startTransition(async () => {
      const result = await fn()
      if (!result.ok) return void toast.error(result.error ?? "Action impossible")
      toast.success(success)
      after?.()
      router.refresh()
    })

  const quickDownload = async () => {
    const svg = getSvg?.()
    if (!svg) return
    downloadBlob(await exportQr(svg, "png", 1024), `${slugify(code.name)}.png`)
    toast.success("QR code téléchargé (PNG 1024 px)")
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(shortUrl(code.shortCode))
    toast.success("Lien court copié")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger ?? (
            <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${code.name}`} disabled={pending}>
              <MoreHorizontal />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/codes/${code.id}`}>
              <BarChart3 /> Statistiques
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/codes/${code.id}/edit`}>
              <Pencil /> Modifier
            </Link>
          </DropdownMenuItem>
          {getSvg && (
            <DropdownMenuItem onClick={quickDownload}>
              <Download /> Télécharger PNG
            </DropdownMenuItem>
          )}
          {code.isDynamic && (
            <>
              <DropdownMenuItem onClick={copyLink}>
                <Link2 /> Copier le lien court
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/r/${code.shortCode}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink /> Tester le scan
                </a>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem
            onClick={() =>
              run(() => duplicateQrAction(code.id), "QR code dupliqué")
            }
          >
            <Copy /> Dupliquer
          </DropdownMenuItem>
          {code.isDynamic && (
            <DropdownMenuItem
              onClick={() =>
                run(
                  () => setQrStatusAction(code.id, code.status === "active" ? "paused" : "active"),
                  code.status === "active" ? "QR code mis en pause" : "QR code réactivé",
                )
              }
            >
              {code.status === "active" ? <Pause /> : <Play />}
              {code.status === "active" ? "Mettre en pause" : "Réactiver"}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {code.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              {code.isDynamic
                ? "Le QR code cessera immédiatement de fonctionner et toutes ses statistiques seront effacées. Cette action est irréversible."
                : "Le QR code sera retiré de votre espace. Les exemplaires imprimés continueront de fonctionner car le contenu y est encodé."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                run(() => deleteQrAction(code.id), "QR code supprimé", () => {
                  if (redirectOnDelete) router.push("/dashboard/codes")
                })
              }
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
