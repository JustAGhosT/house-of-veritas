"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  Plus,
  Search,
  Filter,
  Camera,
  Edit,
  Trash2,
  Tag,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Upload,
  X,
  Store,
  Wrench,
  MapPin,
  User,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Loader2,
} from "lucide-react"
import { AiSuggestIcon } from "@/components/ui/ai-suggest-icon"
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"
import Image from "next/image"

// Asset Categories
const ASSET_CATEGORIES = {
  vehicles: { label: "Vehicles", color: "bg-blue-500" },
  garden_equipment: { label: "Garden Equipment", color: "bg-green-500" },
  workshop_tools: { label: "Workshop Tools", color: "bg-amber-500" },
  household_items: { label: "Household Items", color: "bg-purple-500" },
  electronics: { label: "Electronics", color: "bg-cyan-500" },
  furniture: { label: "Furniture", color: "bg-pink-500" },
  outdoor_furniture: { label: "Outdoor Furniture", color: "bg-teal-500" },
  safety_equipment: { label: "Safety Equipment", color: "bg-red-500" },
}

const CONDITIONS = [
  { value: "excellent", label: "Excellent", color: "text-green-400" },
  { value: "good", label: "Good", color: "text-blue-400" },
  { value: "fair", label: "Fair", color: "text-yellow-400" },
  { value: "poor", label: "Poor", color: "text-orange-400" },
  { value: "needs_repair", label: "Needs Repair", color: "text-red-400" },
  { value: "for_parts", label: "For Parts", color: "text-gray-400" },
]

const SALE_STATUS = [
  { value: "not_for_sale", label: "Not for Sale", color: "bg-gray-600" },
  { value: "for_sale", label: "For Sale", color: "bg-green-600" },
  { value: "pending_sale", label: "Pending Sale", color: "bg-yellow-600" },
  { value: "sold", label: "Sold", color: "bg-purple-600" },
]

interface Asset {
  id: string
  name: string
  description: string
  category: string
  condition: string
  brand?: string
  model?: string
  serialNumber?: string
  purchaseDate?: string
  purchasePrice?: number
  currentValue?: number
  location: string
  storageOption?: string
  responsiblePerson: string
  photos: string[]
  maintenanceHistory: Array<{
    date: string
    type: string
    cost: number
    notes: string
  }>
  saleStatus: string
  salePrice?: number
  saleListings?: Array<{
    platform: string
    listingId: string
    listingUrl: string
    status: string
  }>
  tags: string[]
  lastInventoryCheck: string
  createdAt: string
  updatedAt: string
}

interface AssetSummary {
  total: number
  totalValue: number
  forSale: number
  needsAttention: number
  byCategory: Record<string, number>
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [summary, setSummary] = useState<AssetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedCondition, setSelectedCondition] = useState<string>("all")
  const [selectedSaleStatus, setSelectedSaleStatus] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null)
  const [storageOptions, setStorageOptions] = useState<string[]>([])
  const [suggestingStorage, setSuggestingStorage] = useState(false)
  const [suggestingCategory, setSuggestingCategory] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "household_items",
    condition: "good",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: "",
    currentValue: "",
    location: "",
    storageOption: "",
    saleStatus: "not_for_sale",
    salePrice: "",
    tags: "",
  })

  const fetchAssets = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (selectedCondition !== "all") params.append("condition", selectedCondition)
      if (selectedSaleStatus !== "all") params.append("saleStatus", selectedSaleStatus)
      if (searchTerm) params.append("search", searchTerm)

      const data = await apiFetch<{ assets?: Asset[]; summary?: AssetSummary | null; storageOptions?: string[] }>(
        `/api/assets/enhanced?${params}`,
        { label: "Assets" }
      )
      setAssets(data?.assets || [])
      setSummary(data?.summary ?? null)
      if (data?.storageOptions?.length) setStorageOptions(data.storageOptions)
    } catch (error) {
      logger.error("Failed to fetch assets", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedCondition, selectedSaleStatus, searchTerm])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        location: formData.storageOption || formData.location,
        storageOption: formData.storageOption || formData.location,
        ...(editingAsset ? { id: editingAsset.id } : {}),
      }

      await apiFetch("/api/assets/enhanced", {
        method: editingAsset ? "PUT" : "POST",
        body: payload,
        label: "SaveAsset",
      })
      fetchAssets()
      setIsAddDialogOpen(false)
      setEditingAsset(null)
      resetForm()
    } catch (error) {
      logger.error("Failed to save asset", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return
    try {
      await apiFetch(`/api/assets/enhanced?id=${id}`, { method: "DELETE", label: "DeleteAsset" })
      fetchAssets()
    } catch (error) {
      logger.error("Failed to delete asset", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "household_items",
      condition: "good",
      brand: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      purchasePrice: "",
      currentValue: "",
      location: "",
      storageOption: "",
      saleStatus: "not_for_sale",
      salePrice: "",
      tags: "",
    })
  }

  const handleSuggestStorage = async () => {
    if (!formData.name.trim()) return
    setSuggestingStorage(true)
    try {
      const data = await apiFetch<{ suggested?: string }>("/api/ai/suggest-storage", {
        method: "POST",
        body: {
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category || undefined,
        },
        label: "SuggestStorage",
      })
      if (data?.suggested) setFormData((p) => ({ ...p, storageOption: data.suggested!, location: data.suggested! }))
    } finally {
      setSuggestingStorage(false)
    }
  }

  const handleSuggestCategory = async () => {
    if (!formData.name.trim()) return
    setSuggestingCategory(true)
    try {
      const data = await apiFetch<{ suggested?: string }>("/api/ai/suggest-category", {
        method: "POST",
        body: {
          name: formData.name,
          description: formData.description || undefined,
        },
        label: "SuggestCategory",
      })
      if (data?.suggested) setFormData((p) => ({ ...p, category: data.suggested! }))
    } finally {
      setSuggestingCategory(false)
    }
  }

  const openEditDialog = (asset: Asset) => {
    setEditingAsset(asset)
    setFormData({
      name: asset.name,
      description: asset.description,
      category: asset.category,
      condition: asset.condition,
      brand: asset.brand || "",
      model: asset.model || "",
      serialNumber: asset.serialNumber || "",
      purchaseDate: asset.purchaseDate || "",
      purchasePrice: asset.purchasePrice?.toString() || "",
      currentValue: asset.currentValue?.toString() || "",
      location: asset.location,
      storageOption: asset.storageOption || asset.location || "",
      saleStatus: asset.saleStatus,
      salePrice: asset.salePrice?.toString() || "",
      tags: asset.tags.join(", "),
    })
    setIsAddDialogOpen(true)
  }

  const getConditionBadge = (condition: string) => {
    const c = CONDITIONS.find(x => x.value === condition)
    return <Badge variant="outline" className={c?.color}>{c?.label || condition}</Badge>
  }

  const getSaleStatusBadge = (status: string) => {
    const s = SALE_STATUS.find(x => x.value === status)
    return <Badge className={s?.color}>{s?.label || status}</Badge>
  }

  const formatCurrency = (val?: number) => {
    if (val === undefined) return "—"
    return `R ${val.toLocaleString()}`
  }

  return (
    <DashboardLayout persona="hans">
      <div className="space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-400" />
              Asset Management
            </h1>
            <p className="text-white/60 mt-1">Track, manage, and sell estate assets</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) { setEditingAsset(null); resetForm() }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="add-asset-btn">
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d0d12] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>{editingAsset ? "Edit Asset" : "Add New Asset"}</DialogTitle>
                <DialogDescription className="text-white/60">
                  {editingAsset ? "Update the asset details" : "Enter the details for the new asset"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      required
                      className="bg-white/5 border-white/10"
                      data-testid="asset-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <div className="flex gap-2">
                      <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                        <SelectTrigger className="flex-1 bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ASSET_CATEGORIES).map(([key, cat]) => (
                            <SelectItem key={key} value={key}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleSuggestCategory}
                        disabled={!formData.name.trim() || suggestingCategory}
                        className="shrink-0 border-white/10"
                        title="Suggest category with AI"
                      >
                        <AiSuggestIcon loading={suggestingCategory} size="md" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                      className="bg-white/5 border-white/10"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData(p => ({ ...p, brand: e.target.value }))}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData(p => ({ ...p, model: e.target.value }))}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Serial Number</Label>
                    <Input
                      value={formData.serialNumber}
                      onChange={(e) => setFormData(p => ({ ...p, serialNumber: e.target.value }))}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select value={formData.condition} onValueChange={(v) => setFormData(p => ({ ...p, condition: v }))}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Storage Location *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.storageOption || formData.location || (storageOptions[0] ?? "")}
                        onValueChange={(v) => setFormData(p => ({ ...p, storageOption: v, location: v }))}
                      >
                        <SelectTrigger className="flex-1 bg-white/5 border-white/10">
                          <SelectValue placeholder="Select storage" />
                        </SelectTrigger>
                        <SelectContent>
                          {(storageOptions.length ? storageOptions : ["kitchen", "storeroom", "garage", "workshop", "garden shed", "main lounge", "patio", "office", "basement"]).map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleSuggestStorage}
                        disabled={!formData.name.trim() || suggestingStorage}
                        className="shrink-0 border-white/10"
                        title="Suggest storage with AI"
                      >
                        <AiSuggestIcon loading={suggestingStorage} size="md" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Date</Label>
                    <Input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData(p => ({ ...p, purchaseDate: e.target.value }))}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Price (R)</Label>
                    <Input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData(p => ({ ...p, purchasePrice: e.target.value }))}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Value (R)</Label>
                    <Input
                      type="number"
                      value={formData.currentValue}
                      onChange={(e) => setFormData(p => ({ ...p, currentValue: e.target.value }))}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sale Status</Label>
                    <Select value={formData.saleStatus} onValueChange={(v) => setFormData(p => ({ ...p, saleStatus: v }))}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SALE_STATUS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.saleStatus !== "not_for_sale" && (
                    <div className="space-y-2">
                      <Label>Sale Price (R)</Label>
                      <Input
                        type="number"
                        value={formData.salePrice}
                        onChange={(e) => setFormData(p => ({ ...p, salePrice: e.target.value }))}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  )}
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Tags (comma separated)</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))}
                      placeholder="e.g. outdoor, premium, work"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); setEditingAsset(null); resetForm() }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="save-asset-btn">
                    {editingAsset ? "Update Asset" : "Create Asset"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Package className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Assets</p>
                    <p className="text-2xl font-bold text-white">{summary.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Value</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Store className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">For Sale</p>
                    <p className="text-2xl font-bold text-white">{summary.forSale}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-500/20">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Needs Attention</p>
                    <p className="text-2xl font-bold text-white">{summary.needsAttention}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10"
                  data-testid="asset-search-input"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(ASSET_CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger className="w-full sm:w-[160px] bg-white/5 border-white/10">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSaleStatus} onValueChange={setSelectedSaleStatus}>
                <SelectTrigger className="w-full sm:w-[160px] bg-white/5 border-white/10">
                  <SelectValue placeholder="Sale Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {SALE_STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assets Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-white/20 mb-4" />
              <p className="text-white/60 text-lg">No assets found</p>
              <p className="text-white/40 text-sm">Try adjusting your filters or add a new asset</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="bg-white/5 border-white/10 hover:bg-white/7 transition-colors group" data-testid={`asset-card-${asset.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-lg truncate">{asset.name}</CardTitle>
                      <CardDescription className="text-white/50 mt-1 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${ASSET_CATEGORIES[asset.category as keyof typeof ASSET_CATEGORIES]?.color || 'bg-gray-500'}`} />
                        {ASSET_CATEGORIES[asset.category as keyof typeof ASSET_CATEGORIES]?.label || asset.category}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(asset)} data-testid={`edit-asset-${asset.id}`}>
                        <Edit className="h-4 w-4 text-white/60" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(asset.id)} data-testid={`delete-asset-${asset.id}`}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Photo placeholder */}
                  <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center border border-white/10 relative">
                    {asset.photos.length > 0 ? (
                      <Image src={asset.photos[0]} alt={asset.name} fill className="object-cover rounded-lg" unoptimized />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 text-white/20 mx-auto mb-2" />
                        <p className="text-white/30 text-xs">No photo</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getConditionBadge(asset.condition)}
                      {getSaleStatusBadge(asset.saleStatus)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-white/60">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{asset.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <User className="h-3.5 w-3.5" />
                      <span className="capitalize truncate">{asset.responsiblePerson}</span>
                    </div>
                  </div>

                  {asset.brand && (
                    <p className="text-white/50 text-sm">
                      {asset.brand} {asset.model && `• ${asset.model}`}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div>
                      <p className="text-white/40 text-xs">Current Value</p>
                      <p className="text-white font-semibold">{formatCurrency(asset.currentValue)}</p>
                    </div>
                    {asset.saleStatus === "for_sale" && asset.salePrice && (
                      <div className="text-right">
                        <p className="text-white/40 text-xs">Sale Price</p>
                        <p className="text-green-400 font-semibold">{formatCurrency(asset.salePrice)}</p>
                      </div>
                    )}
                  </div>

                  {asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs bg-white/5">
                          {tag}
                        </Badge>
                      ))}
                      {asset.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-white/5">
                          +{asset.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
