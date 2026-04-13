"use client"

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import QRCodeStyling from "qr-code-styling"

interface QRCodePreviewProps {
  qrData: {
    type: string
    content: string
    isDynamic: boolean
    foregroundColor: string
    backgroundColor: string
    cornerSquareColor: string
    cornerDotColor: string
    logoImage: string
    logoWidth: number
    logoHeight: number
    dotStyle: string
    cornerSquareStyle: string
    cornerDotStyle: string
    name?: string
  }
}

export interface QRCodePreviewRef {
  download: (format: "png" | "svg" | "jpeg") => void
}

export const QRCodePreview = forwardRef<QRCodePreviewRef, QRCodePreviewProps>(({ qrData }, ref) => {
  const qrRef = useRef<HTMLDivElement>(null)
  const qrCode = useRef<QRCodeStyling>()

  useImperativeHandle(ref, () => ({
    download: (format: "png" | "svg" | "jpeg") => {
      if (qrCode.current) {
        const fileName = qrData.name ? `${qrData.name.replace(/\s+/g, "_")}` : "qr-code"
        qrCode.current.download({ name: fileName, extension: format })
      }
    }
  }))

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: 300,
        height: 300,
        data: qrData.content || "https://qrcreator.example.com",
        image: qrData.logoImage || "",
        dotsOptions: {
          color: qrData.foregroundColor,
          type: qrData.dotStyle as any,
        },
        cornersSquareOptions: {
          color: qrData.cornerSquareColor,
          type: qrData.cornerSquareStyle as any,
        },
        cornersDotOptions: {
          color: qrData.cornerDotColor,
          type: qrData.cornerDotStyle as any,
        },
        backgroundOptions: {
          color: qrData.backgroundColor,
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 5,
          imageSize: 0.2,
          width: qrData.logoWidth,
          height: qrData.logoHeight,
        },
      })
    }

    if (qrRef.current && qrCode.current) {
      qrRef.current.innerHTML = ""
      qrCode.current.append(qrRef.current)
    }
  }, [])

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: qrData.content || "https://qrcreator.example.com",
        image: qrData.logoImage || "",
        dotsOptions: {
          color: qrData.foregroundColor,
          type: qrData.dotStyle as any,
        },
        cornersSquareOptions: {
          color: qrData.cornerSquareColor,
          type: qrData.cornerSquareStyle as any,
        },
        cornersDotOptions: {
          color: qrData.cornerDotColor,
          type: qrData.cornerDotStyle as any,
        },
        backgroundOptions: {
          color: qrData.backgroundColor,
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 5,
          width: qrData.logoWidth,
          height: qrData.logoHeight,
        },
      })
    }
  }, [qrData])

  return (
    <div className="flex items-center justify-center rounded-lg border bg-white p-4 dark:bg-black">
      <div ref={qrRef} className="h-[300px] w-[300px]" />
    </div>
  )
})

QRCodePreview.displayName = "QRCodePreview"
