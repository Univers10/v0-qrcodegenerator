import type { MetadataRoute } from "next"

import { site } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/generator", "/signup", "/login", "/legal/terms", "/legal/privacy"]
  return pages.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: path === "" || path === "/generator" ? "weekly" : "yearly",
    priority: path === "" ? 1 : path === "/generator" ? 0.9 : 0.4,
  }))
}
