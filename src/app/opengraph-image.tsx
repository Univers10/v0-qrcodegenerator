import { ImageResponse } from "next/og"

export const alt = "QR Creator — QR codes dynamiques, design et analytique"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Motif décoratif façon QR (déterministe)
const CELLS = Array.from({ length: 13 * 13 }, (_, i) => ((i * 7919) % 11) % 3 === 0)

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #581c87 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ display: "flex", fontSize: 28, opacity: 0.7 }}>QR Creator · UNIVERS10</div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.05, marginTop: 24 }}>
            Des QR codes qui travaillent pour votre marque.
          </div>
          <div style={{ display: "flex", fontSize: 28, marginTop: 28, opacity: 0.75 }}>
            Dynamiques · Design sur mesure · Statistiques en temps réel
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: 364,
            height: 364,
            padding: 22,
            borderRadius: 40,
            background: "white",
          }}
        >
          {CELLS.map((on, i) => {
            const row = Math.floor(i / 13)
            const col = i % 13
            const finder = (row < 4 && col < 4) || (row < 4 && col > 8) || (row > 8 && col < 4)
            return (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  background: finder ? (row % 3 === 0 || col % 3 === 0 ? "#4f46e5" : "white") : on ? "#7c3aed" : "white",
                }}
              />
            )
          })}
        </div>
      </div>
    ),
    size,
  )
}
