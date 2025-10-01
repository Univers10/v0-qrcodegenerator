// Types pour les QR codes
export interface QRCodeData {
  id?: string
  name: string
  type: string
  content: string
  isDynamic: boolean
  foregroundColor: string
  backgroundColor: string
  cornerSquareColor: string
  cornerDotColor: string
  logoImage?: string
  logoWidth: number
  logoHeight: number
  dotStyle: string
  cornerSquareStyle: string
  cornerDotStyle: string
  createdAt?: string
  updatedAt?: string
  scans: number
}

export interface ScanData {
  id: string
  timestamp: string
  qrCodeId: string
}

// Clé pour le stockage local
const QR_CODES_STORAGE_KEY = "qr_codes"

// Fonction pour générer un ID unique
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Fonction pour récupérer tous les QR codes
export function getQRCodes(): QRCodeData[] {
  if (typeof window === "undefined") return []

  const storedQRCodes = localStorage.getItem(QR_CODES_STORAGE_KEY)
  return storedQRCodes ? JSON.parse(storedQRCodes) : []
}

// Fonction pour récupérer un QR code par son ID
export function getQRCodeById(id: string): QRCodeData | null {
  const qrCodes = getQRCodes()
  return qrCodes.find((qrCode) => qrCode.id === id) || null
}

// Fonction pour créer un nouveau QR code
export function createQRCode(qrCodeData: Omit<QRCodeData, "id" | "createdAt" | "scans">): QRCodeData {
  const qrCodes = getQRCodes()

  const newQRCode: QRCodeData = {
    id: generateId(),
    ...qrCodeData,
    createdAt: new Date().toISOString(),
    scans: 0,
  }

  qrCodes.push(newQRCode)
  localStorage.setItem(QR_CODES_STORAGE_KEY, JSON.stringify(qrCodes))

  return newQRCode
}

// Fonction pour mettre à jour un QR code
export function updateQRCode(id: string, qrCodeData: Partial<QRCodeData>): boolean {
  const qrCodes = getQRCodes()
  const index = qrCodes.findIndex((qrCode) => qrCode.id === id)

  if (index === -1) return false

  qrCodes[index] = {
    ...qrCodes[index],
    ...qrCodeData,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(QR_CODES_STORAGE_KEY, JSON.stringify(qrCodes))
  return true
}

// Fonction pour supprimer un QR code
export function deleteQRCode(id: string): boolean {
  const qrCodes = getQRCodes()
  const filteredQRCodes = qrCodes.filter((qrCode) => qrCode.id !== id)

  if (filteredQRCodes.length === qrCodes.length) return false

  localStorage.setItem(QR_CODES_STORAGE_KEY, JSON.stringify(filteredQRCodes))
  return true
}

// Fonction pour enregistrer un scan pour un QR code dynamique
export function recordScan(id: string): void {
  const qrCode = getQRCodeById(id)
  if (qrCode && qrCode.isDynamic) {
    updateQRCode(id, {
      scans: (qrCode.scans || 0) + 1,
    })
  }
}

// Fonction pour initialiser le stockage
export function initializeStorage(): void {
  if (typeof window !== "undefined" && !localStorage.getItem(QR_CODES_STORAGE_KEY)) {
    localStorage.setItem(QR_CODES_STORAGE_KEY, JSON.stringify([]))
  }
}
