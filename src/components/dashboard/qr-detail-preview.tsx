"use client"

import { Check, Copy, ExternalLink } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { DownloadPanel } from "@/components/qr/download-panel"
import { QrImage } from "@/components/qr/qr-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { QrContent, QrType } from "@/lib/qr/content"
import type { QrDesign } from "@/lib/qr/design"
import { qrPayload } from "@/lib/qr/payload"
import { shortUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

type Props = {
  code: { name: string; type: QrType; data: QrContent; design: QrDesign; isDynamic: boolean; shortCode: string; status: "active" | "paused" }
}

export function QrDetailPreview({ code }: Props) {
  const svgRef = useRef<string | null>(null)
  const [copied, setCopied] = useState(false)
  const link = shortUrl(code.shortCode)

  const copy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success("Lien court copié")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="border-b bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_70%)] p-6">
        <div className={cn("mx-auto max-w-[260px]", code.status === "paused" && "opacity-40 grayscale")}>
          <QrImage payload={qrPayload(code)} design={code.design} onRender={(svg) => (svgRef.current = svg)} alt={code.name} />
        </div>
      </div>
      <CardContent className="space-y-5 p-5">
        {code.isDynamic && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Lien court encodé</p>
            <div className="flex items-center gap-1.5">
              <code className="flex-1 truncate rounded-md bg-muted px-2.5 py-2 font-mono text-xs">{link.replace(/^https?:\/\//, "")}</code>
              <Button variant="outline" size="icon-sm" onClick={copy} aria-label="Copier le lien">
                {copied ? <Check /> : <Copy />}
              </Button>
              <Button variant="outline" size="icon-sm" asChild>
                <a href={`/r/${code.shortCode}`} target="_blank" rel="noopener noreferrer" aria-label="Tester le scan">
                  <ExternalLink />
                </a>
              </Button>
            </div>
          </div>
        )}
        <DownloadPanel getSvg={() => svgRef.current} name={code.name} />
      </CardContent>
    </Card>
  )
}
