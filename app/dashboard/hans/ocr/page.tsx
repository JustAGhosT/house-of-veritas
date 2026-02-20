"use client"

import { useState, useRef, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  ScanLine,
  Upload,
  FileText,
  Receipt,
  PenTool,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Copy,
  Download,
  ShoppingCart,
  Eye,
  Boxes,
} from "lucide-react"

const DOCUMENT_TYPES = [
  { value: "handwritten_request", label: "Handwritten Request", icon: PenTool, color: "text-purple-400" },
  { value: "invoice", label: "Invoice", icon: FileText, color: "text-blue-400" },
  { value: "receipt", label: "Receipt", icon: Receipt, color: "text-green-400" },
]

interface OCRResult {
  id: string
  type: string
  extractedText: string
  confidence: number
  structuredData?: Record<string, any>
  items?: Array<{
    name: string
    quantity?: number
    unit?: string
    price?: number
    total?: number
  }>
  totals?: {
    subtotal?: number
    tax?: number
    total?: number
  }
  vendor?: {
    name?: string
    address?: string
    phone?: string
  }
  processedAt: string
  aiPowered: boolean
}

export default function OCRPage() {
  const [selectedType, setSelectedType] = useState("invoice")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<OCRResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Supported: JPEG, PNG, WEBP, PDF")
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB")
      return
    }

    setSelectedFile(file)
    setError(null)
    setResult(null)

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const input = fileInputRef.current
      if (input) {
        const dt = new DataTransfer()
        dt.items.add(file)
        input.files = dt.files
        input.dispatchEvent(new Event("change", { bubbles: true }))
      }
    }
  }, [])

  const processDocument = async () => {
    if (!selectedFile) return

    setProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", selectedType)

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Processing failed")
      }

      setResult(data.result)
      setHistory(prev => [data.result, ...prev].slice(0, 10))
    } catch (err: any) {
      setError(err.message || "Failed to process document")
    } finally {
      setProcessing(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatCurrency = (val?: number) => {
    if (val === undefined) return "—"
    return `R ${val.toFixed(2)}`
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-400"
    if (confidence >= 0.7) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <DashboardLayout persona="hans">
      <div className="space-y-6 relative z-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <ScanLine className="h-8 w-8 text-cyan-400" />
            OCR Document Scanner
          </h1>
          <p className="text-white/60 mt-1">
            Extract text and data from invoices, receipts, and handwritten notes
            {!process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY && (
              <Badge variant="outline" className="ml-2 text-yellow-400 border-yellow-400/50">
                Demo Mode
              </Badge>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Upload Document</CardTitle>
              <CardDescription className="text-white/60">
                Select a document type and upload an image or PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Document Type Selection */}
              <div className="grid grid-cols-3 gap-2">
                {DOCUMENT_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                        selectedType === type.value
                          ? "bg-white/10 border-blue-500"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                      data-testid={`doc-type-${type.value}`}
                    >
                      <Icon className={`h-6 w-6 ${type.color}`} />
                      <span className="text-white text-xs text-center">{type.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* File Upload Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`relative border-2 border-dashed rounded-xl transition-all ${
                  selectedFile
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  data-testid="file-input"
                />
                
                {selectedFile ? (
                  <div className="p-6 text-center">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg mb-4"
                      />
                    ) : (
                      <FileText className="h-16 w-16 mx-auto text-blue-400 mb-4" />
                    )}
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-white/40 text-sm">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); clearSelection() }}
                      className="mt-2"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Upload className="h-12 w-12 mx-auto text-white/40 mb-4" />
                    <p className="text-white font-medium">Drop file here or click to upload</p>
                    <p className="text-white/40 text-sm mt-1">
                      Supports JPEG, PNG, WEBP, PDF (max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Process Button */}
              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                disabled={!selectedFile || processing}
                onClick={processDocument}
                data-testid="process-btn"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4 mr-2" />
                    Process Document
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Extracted Data</CardTitle>
              <CardDescription className="text-white/60">
                {result ? "Document processed successfully" : "Upload and process a document to see results"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <Tabs defaultValue="structured" className="w-full">
                  <TabsList className="bg-white/5 w-full">
                    <TabsTrigger value="structured" className="flex-1">Structured</TabsTrigger>
                    <TabsTrigger value="raw" className="flex-1">Raw Text</TabsTrigger>
                    <TabsTrigger value="items" className="flex-1">Items</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="structured" className="space-y-4 mt-4">
                    {/* Confidence Score */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/60">Confidence</span>
                      <span className={`font-semibold ${getConfidenceColor(result.confidence)}`}>
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    {/* Vendor Info */}
                    {result.vendor && (
                      <div className="p-4 bg-white/5 rounded-lg space-y-2">
                        <p className="text-white/40 text-xs uppercase tracking-wider">Vendor</p>
                        {result.vendor.name && (
                          <p className="text-white font-medium">{result.vendor.name}</p>
                        )}
                        {result.vendor.address && (
                          <p className="text-white/60 text-sm">{result.vendor.address}</p>
                        )}
                        {result.vendor.phone && (
                          <p className="text-white/60 text-sm">{result.vendor.phone}</p>
                        )}
                      </div>
                    )}

                    {/* Totals */}
                    {result.totals && (
                      <div className="p-4 bg-white/5 rounded-lg space-y-2">
                        <p className="text-white/40 text-xs uppercase tracking-wider">Totals</p>
                        {result.totals.subtotal && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Subtotal</span>
                            <span className="text-white">{formatCurrency(result.totals.subtotal)}</span>
                          </div>
                        )}
                        {result.totals.tax && (
                          <div className="flex justify-between">
                            <span className="text-white/60">VAT</span>
                            <span className="text-white">{formatCurrency(result.totals.tax)}</span>
                          </div>
                        )}
                        {result.totals.total && (
                          <div className="flex justify-between pt-2 border-t border-white/10">
                            <span className="text-white font-medium">Total</span>
                            <span className="text-white font-bold text-lg">{formatCurrency(result.totals.total)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="raw" className="mt-4">
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(result.extractedText)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="bg-black/30 p-4 rounded-lg text-white/80 text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                        {result.extractedText}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="items" className="mt-4">
                    {result.items && result.items.length > 0 ? (
                      <div className="space-y-2">
                        {result.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex-1">
                              <p className="text-white text-sm">{item.name}</p>
                              {item.quantity && (
                                <p className="text-white/40 text-xs">
                                  Qty: {item.quantity} {item.unit || ""}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {item.price && (
                                <p className="text-white/60 text-xs">@ {formatCurrency(item.price)}</p>
                              )}
                              {item.total && (
                                <p className="text-white font-medium">{formatCurrency(item.total)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" className="flex-1 border-white/10" onClick={() => copyToClipboard(JSON.stringify(result.items, null, 2))}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Items
                          </Button>
                          <Button className="flex-1 bg-green-600 hover:bg-green-700">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Inventory
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-white/40">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No line items detected</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12 text-white/40">
                  <ScanLine className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>No document processed yet</p>
                  <p className="text-sm mt-1">Upload a document to extract data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setResult(item)}
                    className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.type.replace(/_/g, " ")}
                      </Badge>
                      <span className={`text-xs ${getConfidenceColor(item.confidence)}`}>
                        {(item.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-white/60 text-xs truncate">
                      {new Date(item.processedAt).toLocaleString()}
                    </p>
                    {item.totals?.total && (
                      <p className="text-white font-medium mt-1">{formatCurrency(item.totals.total)}</p>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
