import { initializeStorage } from "./qr-service"

// Initialiser le stockage local au démarrage de l'application
export function initLocalStorage() {
  if (typeof window !== "undefined") {
    initializeStorage()
  }
}

export default initLocalStorage

