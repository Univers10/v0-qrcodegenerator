import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QR Creator",
    short_name: "QR Creator",
    description: "QR codes dynamiques, design et analytique",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f0f14",
    theme_color: "#5b5bf6",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  }
}
