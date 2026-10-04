import { Fraunces, Playfair_Display } from "next/font/google"

// Polices d'affichage des cartes « gastronomiques » (chargées uniquement là où un menu est rendu).
export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-menu-playfair",
})
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-menu-fraunces",
})
