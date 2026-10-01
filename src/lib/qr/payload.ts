import { encodeContent, type QrContent, type QrType } from "./content"
import { shortUrl } from "@/lib/site"

export function qrPayload(code: { type: string; data: unknown; isDynamic: boolean; shortCode: string }) {
  return code.isDynamic ? shortUrl(code.shortCode) : encodeContent(code.type as QrType, code.data as QrContent)
}
