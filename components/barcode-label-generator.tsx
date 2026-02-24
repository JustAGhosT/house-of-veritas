"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Printer, Download, QrCode, Barcode, Tag, Settings, X } from "lucide-react"

interface LabelConfig {
  showName: boolean
  showBarcode: boolean
  showQR: boolean
  showLocation: boolean
  showCategory: boolean
  labelSize: "small" | "medium" | "large"
  barcodeType: "code128" | "ean13" | "qrcode"
}

interface InventoryItem {
  id: string
  name: string
  barcode?: string
  location?: string
  category?: string
  unit?: string
}

interface BarcodeLabelGeneratorProps {
  items: InventoryItem[]
  onClose?: () => void
}

// Generate barcode SVG using Code128
function generateCode128SVG(code: string, width: number = 200, height: number = 60): string {
  // Code128 character set B encoding
  const CODE128B: Record<string, string> = {
    " ": "11011001100",
    "!": "11001101100",
    '"': "11001100110",
    "#": "10010011000",
    $: "10010001100",
    "%": "10001001100",
    "&": "10011001000",
    "'": "10011000100",
    "(": "10001100100",
    ")": "11001001000",
    "*": "11001000100",
    "+": "11000100100",
    ",": "10110011100",
    "-": "10011011100",
    ".": "10011001110",
    "/": "10111001100",
    "0": "10011101100",
    "1": "10011100110",
    "2": "11001110010",
    "3": "11001011100",
    "4": "11001001110",
    "5": "11011100100",
    "6": "11001110100",
    "7": "11101101110",
    "8": "11101001100",
    "9": "11100101100",
    ":": "11100100110",
    ";": "11101100100",
    "<": "11100110100",
    "=": "11100110010",
    ">": "11011011000",
    "?": "11011000110",
    "@": "11000110110",
    A: "10100011000",
    B: "10001011000",
    C: "10001000110",
    D: "10110001000",
    E: "10001101000",
    F: "10001100010",
    G: "11010001000",
    H: "11000101000",
    I: "11000100010",
    J: "10110111000",
    K: "10110001110",
    L: "10001101110",
    M: "10111011000",
    N: "10111000110",
    O: "10001110110",
    P: "11101110110",
    Q: "11010001110",
    R: "11000101110",
    S: "11011101000",
    T: "11011100010",
    U: "11011101110",
    V: "11101011000",
    W: "11101000110",
    X: "11100010110",
    Y: "11101101000",
    Z: "11101100010",
    "[": "11100011010",
    "\\": "11101111010",
    "]": "11001000010",
    "^": "11110001010",
    _: "10100110000",
    "`": "10100001100",
    a: "10010110000",
    b: "10010000110",
    c: "10000101100",
    d: "10000100110",
    e: "10110010000",
    f: "10110000100",
    g: "10011010000",
    h: "10011000010",
    i: "10000110100",
    j: "10000110010",
    k: "11000010010",
    l: "11001010000",
    m: "11110111010",
    n: "11000010100",
    o: "10001111010",
    p: "10100111100",
    q: "10010111100",
    r: "10010011110",
    s: "10111100100",
    t: "10011110100",
    u: "10011110010",
    v: "11110100100",
    w: "11110010100",
    x: "11110010010",
    y: "11011011110",
    z: "11011110110",
    "{": "11110110110",
    "|": "10101111000",
    "}": "10100011110",
    "~": "10001011110",
  }

  const START_B = "11010010000"
  const STOP = "1100011101011"

  let pattern = START_B
  let checksum = 104 // Start B value

  for (let i = 0; i < code.length; i++) {
    const char = code[i]
    const encoded = CODE128B[char]
    if (encoded) {
      pattern += encoded
      checksum += (i + 1) * (char.charCodeAt(0) - 32)
    }
  }

  // Add checksum character
  const checksumChar = String.fromCharCode((checksum % 103) + 32)
  pattern += CODE128B[checksumChar] || ""
  pattern += STOP

  const barWidth = width / pattern.length
  let bars = ""
  let x = 0

  for (const bit of pattern) {
    if (bit === "1") {
      bars += `<rect x="${x}" y="0" width="${barWidth}" height="${height}" fill="black"/>`
    }
    x += barWidth
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${bars}</svg>`
}

// Generate QR Code SVG (simplified - uses a pattern representation)
function generateQRCodeSVG(data: string, size: number = 100): string {
  // This is a simplified QR representation - in production, use a proper QR library
  const moduleSize = size / 25
  let modules = ""

  // Create a simple visual pattern based on data hash
  const hash = data.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

  for (let row = 0; row < 25; row++) {
    for (let col = 0; col < 25; col++) {
      // Position detection patterns (corners)
      const isCorner = (row < 7 && col < 7) || (row < 7 && col >= 18) || (row >= 18 && col < 7)

      // Timing patterns
      const isTiming = (row === 6 || col === 6) && !isCorner

      // Data modules (pseudo-random based on position and data hash)
      const isData = (row * 25 + col + hash) % 3 === 0 && !isCorner && !isTiming

      if (isCorner || isTiming || isData) {
        // Add corner finder patterns
        if (isCorner) {
          const inBorder =
            row === 0 ||
            row === 6 ||
            col === 0 ||
            col === 6 ||
            row === 18 ||
            col === 18 ||
            col === 24 ||
            row === 24
          const inCenter =
            (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
            (row >= 2 && row <= 4 && col >= 20 && col <= 22) ||
            (row >= 20 && row <= 22 && col >= 2 && col <= 4)

          if (inBorder || inCenter) {
            modules += `<rect x="${col * moduleSize}" y="${row * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
          }
        } else if (isTiming && (row + col) % 2 === 0) {
          modules += `<rect x="${col * moduleSize}" y="${row * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
        } else if (isData) {
          modules += `<rect x="${col * moduleSize}" y="${row * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
        }
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" style="background:white">${modules}</svg>`
}

export function BarcodeLabelGenerator({ items, onClose }: BarcodeLabelGeneratorProps) {
  const [config, setConfig] = useState<LabelConfig>({
    showName: true,
    showBarcode: true,
    showQR: false,
    showLocation: true,
    showCategory: false,
    labelSize: "medium",
    barcodeType: "code128",
  })
  const [selectedItems, setSelectedItems] = useState<string[]>(items.map((i) => i.id))
  const printRef = useRef<HTMLDivElement>(null)

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const selectAll = () => setSelectedItems(items.map((i) => i.id))
  const deselectAll = () => setSelectedItems([])

  const getLabelDimensions = () => {
    switch (config.labelSize) {
      case "small":
        return { width: 180, height: 80, fontSize: 10 }
      case "large":
        return { width: 300, height: 150, fontSize: 14 }
      default:
        return { width: 240, height: 100, fontSize: 12 }
    }
  }

  const printLabels = () => {
    if (!printRef.current) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const dims = getLabelDimensions()
    const labelsHtml = selectedItems
      .map((id) => {
        const item = items.find((i) => i.id === id)
        if (!item) return ""

        const barcode = item.barcode || `HV-${item.id}`

        return `
        <div style="
          width: ${dims.width}px; 
          height: ${dims.height}px; 
          border: 1px solid #ccc; 
          padding: 8px; 
          margin: 4px;
          display: inline-block;
          font-family: Arial, sans-serif;
          page-break-inside: avoid;
          box-sizing: border-box;
        ">
          ${config.showName ? `<div style="font-weight: bold; font-size: ${dims.fontSize + 2}px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>` : ""}
          ${config.showLocation ? `<div style="font-size: ${dims.fontSize - 2}px; color: #666; margin-bottom: 4px;">${item.location || "No location"}</div>` : ""}
          ${config.showCategory ? `<div style="font-size: ${dims.fontSize - 2}px; color: #888; margin-bottom: 4px;">${item.category?.replace(/_/g, " ") || ""}</div>` : ""}
          ${
            config.showBarcode
              ? `
            <div style="margin: 4px 0;">
              ${
                config.barcodeType === "qrcode"
                  ? generateQRCodeSVG(barcode, dims.width - 16)
                  : generateCode128SVG(barcode, dims.width - 16, 40)
              }
            </div>
            <div style="font-family: monospace; font-size: ${dims.fontSize - 2}px; text-align: center;">${barcode}</div>
          `
              : ""
          }
        </div>
      `
      })
      .join("")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barcode Labels - House of Veritas</title>
        <style>
          @media print {
            body { margin: 0; padding: 10px; }
            @page { margin: 10mm; }
          }
          body { font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        ${labelsHtml}
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const downloadSVG = () => {
    const dims = getLabelDimensions()
    const itemsToExport = items.filter((i) => selectedItems.includes(i.id))

    itemsToExport.forEach((item, index) => {
      const barcode = item.barcode || `HV-${item.id}`
      const svg =
        config.barcodeType === "qrcode"
          ? generateQRCodeSVG(barcode, dims.width)
          : generateCode128SVG(barcode, dims.width, 60)

      const blob = new Blob([svg], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `barcode-${item.name.replace(/\s+/g, "-").toLowerCase()}.svg`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const dims = getLabelDimensions()

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5" />
              Label Configuration
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Label Size</Label>
              <Select
                value={config.labelSize}
                onValueChange={(v: any) => setConfig((p) => ({ ...p, labelSize: v }))}
              >
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (180×80)</SelectItem>
                  <SelectItem value="medium">Medium (240×100)</SelectItem>
                  <SelectItem value="large">Large (300×150)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Code Type</Label>
              <Select
                value={config.barcodeType}
                onValueChange={(v: any) => setConfig((p) => ({ ...p, barcodeType: v }))}
              >
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code128">Code 128</SelectItem>
                  <SelectItem value="qrcode">QR Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={config.showName}
                onChange={(e) => setConfig((p) => ({ ...p, showName: e.target.checked }))}
                className="rounded border-white/20"
              />
              <span className="text-sm text-white">Show Name</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={config.showBarcode}
                onChange={(e) => setConfig((p) => ({ ...p, showBarcode: e.target.checked }))}
                className="rounded border-white/20"
              />
              <span className="text-sm text-white">Show Barcode</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={config.showLocation}
                onChange={(e) => setConfig((p) => ({ ...p, showLocation: e.target.checked }))}
                className="rounded border-white/20"
              />
              <span className="text-sm text-white">Show Location</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={config.showCategory}
                onChange={(e) => setConfig((p) => ({ ...p, showCategory: e.target.checked }))}
                className="rounded border-white/20"
              />
              <span className="text-sm text-white">Show Category</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Item Selection */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Tag className="h-5 w-5" />
              Select Items ({selectedItems.length}/{items.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={selectAll} className="border-white/10">
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={deselectAll} className="border-white/10">
                Deselect All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid max-h-60 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <label
                key={item.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors ${
                  selectedItems.includes(item.id)
                    ? "border-blue-500 bg-blue-500/20"
                    : "bg-white/5 hover:bg-white/10"
                } border border-white/10`}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="rounded border-white/20"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{item.name}</p>
                  <p className="font-mono text-xs text-white/40">
                    {item.barcode || `HV-${item.id}`}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-white">Preview</CardTitle>
          <CardDescription className="text-white/60">Sample label preview</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={printRef}
            className="flex flex-wrap justify-center gap-2 rounded-lg bg-white p-4"
          >
            {selectedItems.slice(0, 3).map((id) => {
              const item = items.find((i) => i.id === id)
              if (!item) return null
              const barcode = item.barcode || `HV-${item.id}`

              return (
                <div
                  key={id}
                  style={{ width: dims.width, height: dims.height }}
                  className="inline-block border border-gray-300 p-2 text-black"
                >
                  {config.showName && <div className="truncate text-sm font-bold">{item.name}</div>}
                  {config.showLocation && (
                    <div className="text-xs text-gray-600">{item.location}</div>
                  )}
                  {config.showCategory && (
                    <div className="text-xs text-gray-500 capitalize">
                      {item.category?.replace(/_/g, " ")}
                    </div>
                  )}
                  {config.showBarcode && (
                    <div className="mt-1">
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            config.barcodeType === "qrcode"
                              ? generateQRCodeSVG(barcode, dims.width - 16)
                              : generateCode128SVG(barcode, dims.width - 16, 30),
                        }}
                      />
                      <div className="text-center font-mono text-xs">{barcode}</div>
                    </div>
                  )}
                </div>
              )
            })}
            {selectedItems.length > 3 && (
              <div className="flex items-center justify-center text-sm text-gray-400">
                +{selectedItems.length - 3} more labels
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose} className="border-white/10">
            Cancel
          </Button>
        )}
        <Button
          variant="outline"
          onClick={downloadSVG}
          disabled={selectedItems.length === 0}
          className="border-white/10"
        >
          <Download className="mr-2 h-4 w-4" />
          Download SVGs
        </Button>
        <Button
          onClick={printLabels}
          disabled={selectedItems.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print {selectedItems.length} Labels
        </Button>
      </div>
    </div>
  )
}

// Dialog wrapper for easy integration
interface LabelPrintDialogProps {
  items: InventoryItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LabelPrintDialog({ items, open, onOpenChange }: LabelPrintDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/10 bg-[#0d0d12] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Barcode className="h-5 w-5 text-blue-400" />
            Generate Barcode Labels
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Configure and print barcode labels for inventory items
          </DialogDescription>
        </DialogHeader>
        <BarcodeLabelGenerator items={items} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
