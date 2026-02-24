"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Play,
  Pause,
  RotateCcw,
  ClipboardList,
  ArrowDown,
  ArrowUp,
  Trash2,
  Save,
} from "lucide-react"

interface ScannedItem {
  code: string
  name: string
  id: string
  currentStock: number
  unit: string
  location: string
  timestamp: Date
  action?: "consume" | "restock"
  quantity?: number
  found: boolean
}

interface BatchScannerProps {
  mode: "stockcount" | "consume" | "restock"
  onComplete?: (items: ScannedItem[]) => void
  onClose?: () => void
}

export function BatchScanner({ mode, onComplete, onClose }: BatchScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [defaultQuantity, setDefaultQuantity] = useState("1")
  const [defaultPurpose, setDefaultPurpose] = useState("")
  const scannerRef = useRef<any>(null)

  const getModeConfig = () => {
    switch (mode) {
      case "consume":
        return {
          title: "Batch Consumption",
          description: "Scan items to record usage",
          color: "text-orange-400",
          bgColor: "bg-orange-500/20",
          action: "consume" as const,
        }
      case "restock":
        return {
          title: "Batch Restock",
          description: "Scan items to add stock",
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          action: "restock" as const,
        }
      default:
        return {
          title: "Stock Count",
          description: "Scan items for inventory verification",
          color: "text-blue-400",
          bgColor: "bg-blue-500/20",
          action: undefined,
        }
    }
  }

  const config = getModeConfig()

  const startScanner = useCallback(async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      
      const scanner = new Html5Qrcode("batch-scanner-reader")
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        async (decodedText) => {
          // Check if already scanned
          if (scannedItems.some(item => item.code === decodedText)) {
            setLastScan(`Already scanned: ${decodedText}`)
            if (navigator.vibrate) navigator.vibrate([50, 50, 50])
            return
          }

          // Vibrate on scan
          if (navigator.vibrate) navigator.vibrate(100)
          setLastScan(decodedText)

          // Look up item
          try {
            const data = await apiFetch<{ items?: Array<{ id: string; name: string; currentStock: number; unit: string; location: string }> }>(
              `/api/inventory?barcode=${encodeURIComponent(decodedText)}`,
              { label: "InventoryLookup" }
            )
            
            const firstItem = data?.items?.[0]
            const found = !!firstItem
            const newItem: ScannedItem = {
              code: decodedText,
              timestamp: new Date(),
              action: config.action,
              quantity: parseFloat(defaultQuantity) || 1,
              found,
              ...(found && firstItem
                ? {
                    name: firstItem.name,
                    id: firstItem.id,
                    currentStock: firstItem.currentStock,
                    unit: firstItem.unit,
                    location: firstItem.location,
                  }
                : {
                    name: "Unknown Item",
                    id: "",
                    currentStock: 0,
                    unit: "units",
                    location: "Unknown",
                  }
              ),
            }
            
            setScannedItems(prev => [newItem, ...prev])
          } catch (err) {
            logger.error("Lookup error", { error: err instanceof Error ? err.message : String(err) })
          }
        },
        () => {}
      )

      setIsScanning(true)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to start camera")
      setIsScanning(false)
    }
  }, [scannedItems, defaultQuantity, config.action])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch (e) {}
      scannerRef.current = null
    }
    setIsScanning(false)
  }, [])

  const toggleScanner = async () => {
    if (isScanning) {
      await stopScanner()
    } else {
      await startScanner()
    }
  }

  const removeItem = (code: string) => {
    setScannedItems(prev => prev.filter(item => item.code !== code))
  }

  const updateItemQuantity = (code: string, quantity: number) => {
    setScannedItems(prev => prev.map(item => 
      item.code === code ? { ...item, quantity } : item
    ))
  }

  const clearAll = () => {
    setScannedItems([])
    setLastScan(null)
  }

  const submitBatch = async () => {
    if (scannedItems.length === 0) return

    const validItems = scannedItems.filter(item => item.found)
    
    if (mode === "consume" || mode === "restock") {
      // Process each item
      for (const item of validItems) {
        try {
          await apiFetch("/api/inventory", {
            method: "POST",
            body: {
              action: mode,
              itemId: item.id,
              quantity: item.quantity,
              usedBy: "hans",
              purpose: defaultPurpose || `Batch ${mode}`,
            },
            label: `Batch${mode === "consume" ? "Consume" : "Restock"}`,
          })
        } catch (err) {
          logger.error(`Failed to ${mode} ${item.name}`, { error: err instanceof Error ? err.message : String(err) })
        }
      }
    }

    onComplete?.(scannedItems)
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [stopScanner])

  const foundCount = scannedItems.filter(i => i.found).length
  const notFoundCount = scannedItems.filter(i => !i.found).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <ClipboardList className={`h-5 w-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-white font-medium">{config.title}</h3>
            <p className="text-white/60 text-sm">{config.description}</p>
          </div>
        </div>
        {onClose && (
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Scanner Controls */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-4 space-y-4">
          {/* Mode-specific settings */}
          {(mode === "consume" || mode === "restock") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Quantity</Label>
                <Input
                  type="number"
                  value={defaultQuantity}
                  onChange={(e) => setDefaultQuantity(e.target.value)}
                  className="bg-white/5 border-white/10"
                  min="1"
                />
              </div>
              {mode === "consume" && (
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Input
                    value={defaultPurpose}
                    onChange={(e) => setDefaultPurpose(e.target.value)}
                    placeholder="e.g. Monthly maintenance"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              )}
            </div>
          )}

          {/* Scanner View */}
          <div className="relative">
            <div
              id="batch-scanner-reader"
              className="w-full aspect-video bg-black/50 rounded-lg overflow-hidden"
            />
            
            {/* Status Overlay */}
            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Button onClick={startScanner} className={`${config.bgColor.replace('20', '100')}`}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanner
                </Button>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center p-4">
                  <CameraOff className="h-12 w-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-400">{error}</p>
                  <Button onClick={startScanner} className="mt-4" variant="outline">
                    Retry
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Scanner Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isScanning && (
                <Badge className="bg-green-500 animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-2" />
                  Scanning...
                </Badge>
              )}
              {lastScan && (
                <span className="text-white/60 text-sm">Last: {lastScan}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleScanner}
                className="border-white/10"
              >
                {isScanning ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanned Items Summary */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg">
              Scanned Items ({scannedItems.length})
            </CardTitle>
            <div className="flex gap-2">
              {scannedItems.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clearAll} className="text-red-400">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          {scannedItems.length > 0 && (
            <div className="flex gap-2 text-sm">
              <Badge variant="outline" className="text-green-400 border-green-400/50">
                <CheckCircle className="h-3 w-3 mr-1" />
                {foundCount} found
              </Badge>
              {notFoundCount > 0 && (
                <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {notFoundCount} not found
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {scannedItems.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <ScanLine className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No items scanned yet</p>
              <p className="text-sm">Start scanning to add items</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {scannedItems.map((item, idx) => (
                <div
                  key={item.code}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.found ? 'bg-white/5' : 'bg-yellow-500/10 border border-yellow-500/30'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.found ? (
                        <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
                      )}
                      <span className="text-white font-medium truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                      <span className="font-mono">{item.code}</span>
                      {item.found && (
                        <>
                          <span>•</span>
                          <span>Stock: {item.currentStock} {item.unit}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {(mode === "consume" || mode === "restock") && item.found && (
                    <div className="flex items-center gap-2 mx-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.code, parseFloat(e.target.value) || 1)}
                        className="w-16 h-8 text-center bg-white/5 border-white/10"
                        min="1"
                      />
                      <span className="text-white/40 text-sm">{item.unit}</span>
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(item.code)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose} className="border-white/10">
            Cancel
          </Button>
        )}
        <Button
          onClick={submitBatch}
          disabled={scannedItems.length === 0 || foundCount === 0}
          className={mode === "consume" ? "bg-orange-600 hover:bg-orange-700" : mode === "restock" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
        >
          {mode === "consume" ? (
            <>
              <ArrowDown className="h-4 w-4 mr-2" />
              Record Consumption ({foundCount})
            </>
          ) : mode === "restock" ? (
            <>
              <ArrowUp className="h-4 w-4 mr-2" />
              Add Stock ({foundCount})
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Stock Count ({foundCount})
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Dialog wrapper
interface BatchScanDialogProps {
  mode: "stockcount" | "consume" | "restock"
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: (items: ScannedItem[]) => void
}

export function BatchScanDialog({ mode, open, onOpenChange, onComplete }: BatchScanDialogProps) {
  const handleComplete = (items: ScannedItem[]) => {
    onComplete?.(items)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <BatchScanner
          mode={mode}
          onComplete={handleComplete}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
