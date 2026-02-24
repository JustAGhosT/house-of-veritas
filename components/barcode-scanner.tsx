"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"
import {
  ScanLine,
  Camera,
  CameraOff,
  Package,
  AlertTriangle,
  CheckCircle,
  X,
  Flashlight,
  RotateCcw,
} from "lucide-react"

interface ScanResult {
  code: string
  format: string
  timestamp: Date
}

interface InventoryItem {
  id: string
  name: string
  category: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  location: string
  barcode?: string
  unitCost: number
  totalValue: number
}

interface BarcodeScannerProps {
  onScanComplete?: (item: InventoryItem | null, code: string) => void
  onClose?: () => void
  mode?: "lookup" | "consume" | "restock"
}

export function BarcodeScanner({ onScanComplete, onClose, mode = "lookup" }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [foundItem, setFoundItem] = useState<InventoryItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const scannerRef = useRef<any>(null)
  const videoRef = useRef<HTMLDivElement>(null)

  const lookupItem = useCallback(async (code: string) => {
    setLoading(true)
    try {
      const data = await apiFetch<{ items?: InventoryItem[] }>(
        `/api/inventory?barcode=${encodeURIComponent(code)}`,
        { label: "InventoryLookup" }
      )
      if (data?.items && data.items.length > 0) {
        setFoundItem(data.items[0])
        onScanComplete?.(data.items[0], code)
      } else {
        setFoundItem(null)
        onScanComplete?.(null, code)
      }
    } catch (err) {
      logger.error("Lookup error", { error: err instanceof Error ? err.message : String(err) })
      setFoundItem(null)
    } finally {
      setLoading(false)
    }
  }, [onScanComplete])

  const startScanner = useCallback(async () => {
    if (!videoRef.current) return

    try {
      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode")
      
      const scanner = new Html5Qrcode("barcode-reader")
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777,
        },
        async (decodedText, decodedResult) => {
          // Vibrate on successful scan
          if (navigator.vibrate) {
            navigator.vibrate(100)
          }

          const result: ScanResult = {
            code: decodedText,
            format: decodedResult.result.format?.formatName || "UNKNOWN",
            timestamp: new Date(),
          }
          setScanResult(result)
          
          // Stop scanner after successful scan
          await scanner.stop()
          setIsScanning(false)

          // Look up the item
          await lookupItem(decodedText)
        },
        () => {
          // QR Code scanning is ongoing
        }
      )

      setIsScanning(true)
      setError(null)
    } catch (err: unknown) {
      logger.error("Scanner error", { error: err instanceof Error ? err.message : String(err) })
      setError(err instanceof Error ? err.message : "Failed to start camera")
      setIsScanning(false)
    }
  }, [lookupItem])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch (e) {
        // Ignore stop errors
      }
      scannerRef.current = null
    }
    setIsScanning(false)
  }, [])

  const resetScanner = useCallback(() => {
    setScanResult(null)
    setFoundItem(null)
    setError(null)
    startScanner()
  }, [startScanner])

  const toggleTorch = async () => {
    if (scannerRef.current) {
      try {
        const track = scannerRef.current.getRunningTrackCameraCapabilities()
        if (track.torchFeature().isSupported()) {
          await scannerRef.current.applyVideoConstraints({
            advanced: [{ torch: !torchOn }],
          })
          setTorchOn(!torchOn)
        }
      } catch (e) {
        logger.error("Torch error", { error: e instanceof Error ? e.message : String(e) })
      }
    }
  }

  useEffect(() => {
    startScanner()
    return () => {
      stopScanner()
    }
  }, [startScanner, stopScanner])

  const getModeColor = () => {
    switch (mode) {
      case "consume": return "text-orange-400"
      case "restock": return "text-green-400"
      default: return "text-blue-400"
    }
  }

  const getModeLabel = () => {
    switch (mode) {
      case "consume": return "Consume Stock"
      case "restock": return "Restock Item"
      default: return "Lookup Item"
    }
  }

  return (
    <div className="space-y-4">
      {/* Scanner Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanLine className={`h-5 w-5 ${getModeColor()}`} />
          <span className="text-white font-medium">{getModeLabel()}</span>
        </div>
        <div className="flex items-center gap-2">
          {isScanning && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleTorch}
                className="text-white/60"
              >
                <Flashlight className={`h-4 w-4 ${torchOn ? "text-yellow-400" : ""}`} />
              </Button>
            </>
          )}
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Scanner View */}
      <div className="relative">
        <div
          id="barcode-reader"
          ref={videoRef}
          className="w-full aspect-video bg-black/50 rounded-lg overflow-hidden"
        />
        
        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-40 border-2 border-blue-500 rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400 rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400 rounded-br" />
                {/* Scanning line animation */}
                <div className="absolute inset-x-2 h-0.5 bg-red-500 animate-scan-line" />
              </div>
            </div>
            <div className="absolute bottom-4 inset-x-0 text-center">
              <p className="text-white/80 text-sm">Position barcode within the frame</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center p-4">
              <CameraOff className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-medium">{error}</p>
              <Button onClick={startScanner} className="mt-4" variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Scan Result */}
      {scanResult && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                ) : foundItem ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                )}
                {loading ? "Looking up..." : foundItem ? "Item Found" : "Not Found"}
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={resetScanner}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Scan Again
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Scanned Code Info */}
            <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
              <div>
                <p className="text-white/40 text-xs">Scanned Code</p>
                <p className="text-white font-mono">{scanResult.code}</p>
              </div>
              <Badge variant="outline">{scanResult.format}</Badge>
            </div>

            {/* Found Item Details */}
            {foundItem && (
              <div className="space-y-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{foundItem.name}</p>
                    <p className="text-white/60 text-sm capitalize">
                      {foundItem.category.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Badge variant={foundItem.currentStock <= foundItem.minStock ? "destructive" : "outline"}>
                    {foundItem.currentStock} {foundItem.unit}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-white/40">Location</p>
                    <p className="text-white">{foundItem.location}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Unit Cost</p>
                    <p className="text-white">R {foundItem.unitCost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Not Found Message */}
            {!loading && !foundItem && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  No inventory item found with this barcode. You can add a new item with this code.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!scanResult && !error && (
        <div className="text-center text-white/50 text-sm">
          <p>Supported: QR Code, EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39</p>
        </div>
      )}
    </div>
  )
}

// Compact scanner button for embedding in pages
interface ScannerButtonProps {
  onItemFound: (item: InventoryItem) => void
  onCodeScanned?: (code: string) => void
  mode?: "lookup" | "consume" | "restock"
  className?: string
}

export function ScannerButton({ onItemFound, onCodeScanned, mode = "lookup", className }: ScannerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleScanComplete = (item: InventoryItem | null, code: string) => {
    onCodeScanned?.(code)
    if (item) {
      onItemFound(item)
      setIsOpen(false)
    }
  }

  const getModeColor = () => {
    switch (mode) {
      case "consume": return "bg-orange-600 hover:bg-orange-700"
      case "restock": return "bg-green-600 hover:bg-green-700"
      default: return "bg-blue-600 hover:bg-blue-700"
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className={`${getModeColor()} ${className}`}>
        <ScanLine className="h-4 w-4 mr-2" />
        Scan Barcode
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5" />
              Barcode Scanner
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Point your camera at a barcode or QR code
            </DialogDescription>
          </DialogHeader>
          <BarcodeScanner
            mode={mode}
            onScanComplete={handleScanComplete}
            onClose={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
