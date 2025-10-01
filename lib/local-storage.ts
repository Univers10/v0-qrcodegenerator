// Re-export all functions from qr-service.ts
export {
  QRCodeData,
  ScanData,
  generateId,
  getQRCodes,
  getQRCodeById,
  createQRCode,
  updateQRCode,
  deleteQRCode,
  recordScan,
  initializeStorage,
} from "@/lib/qr-service"
