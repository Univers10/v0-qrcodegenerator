import { Fraunces, Playfair_Display } from "next/font/google"

// Polices d'affichage des thèmes de menu (chargées uniquement là où un menu est rendu).
export const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-menu-elegant" })
export const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-menu-bistro" })
