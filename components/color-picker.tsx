"use client"

import type React from "react"

import { useState } from "react"
import { Paintbrush } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(color)

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value)
    onChange(e.target.value)
  }

  const presetColors = [
    "#000000", // Black
    "#FFFFFF", // White
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
    "#008000", // Dark Green
    "#800000", // Maroon
    "#008080", // Teal
    "#000080", // Navy
    "#808080", // Gray
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-dashed"
          style={{ backgroundColor: selectedColor }}
        >
          <Paintbrush className="h-4 w-4" />
          <span className="flex-1 text-left">{selectedColor}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <Tabs defaultValue="solid">
          <TabsList className="w-full">
            <TabsTrigger className="flex-1" value="solid">
              Couleur
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="preset">
              Préréglages
            </TabsTrigger>
          </TabsList>
          <TabsContent value="solid" className="space-y-2">
            <div className="h-24 w-full rounded-md" style={{ backgroundColor: selectedColor }} />
            <Input type="color" value={selectedColor} onChange={handleColorChange} className="h-10 w-full" />
            <Input value={selectedColor} onChange={handleColorChange} className="h-10 w-full" />
          </TabsContent>
          <TabsContent value="preset">
            <div className="grid grid-cols-5 gap-2 py-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className="h-8 w-8 rounded-md border"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => {
                    setSelectedColor(presetColor)
                    onChange(presetColor)
                  }}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
