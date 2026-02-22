"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
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
  Store,
  ExternalLink,
  Eye,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Plus,
  Sparkles,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { logger } from "@/lib/logger"

interface MarketplaceListing {
  id: string
  assetId: string
  assetName: string
  platform: string
  listingType: string
  price: number
  title: string
  description: string
  photos: string[]
  category: string
  condition: string
  location: string
  status: string
  listingUrl?: string
  views?: number
  inquiries?: number
  createdAt: string
  expiresAt?: string
}

interface Platform {
  name: string
  url: string
  postUrl: string
  icon: string
  categories: string[]
  supportsAuction?: boolean
}

interface Asset {
  id: string
  name: string
  description: string
  category: string
  condition: string
  brand?: string
  model?: string
  currentValue?: number
  salePrice?: number
  saleStatus: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500",
  pending: "bg-yellow-500",
  active: "bg-green-500",
  sold: "bg-purple-500",
  expired: "bg-red-500",
  cancelled: "bg-gray-500",
}

const PLATFORM_ICONS: Record<string, string> = {
  gumtree: "🟢",
  facebook: "🔵",
  olx: "🟡",
  bidorbuy: "🔴",
  autotrader: "🚗",
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [platforms, setPlatforms] = useState<Record<string, Platform>>({})
  const [summary, setSummary] = useState<any>(null)
  const [assetsForSale, setAssetsForSale] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [generatedListing, setGeneratedListing] = useState<any>(null)
  
  // Form states
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["gumtree"])
  const [listingTitle, setListingTitle] = useState("")
  const [listingDescription, setListingDescription] = useState("")
  const [listingPrice, setListingPrice] = useState("")

  const fetchListings = useCallback(async () => {
    try {
      const [listingsRes, platformsRes, assetsRes] = await Promise.all([
        fetch("/api/marketplace"),
        fetch("/api/marketplace?action=platforms"),
        fetch("/api/assets/enhanced?saleStatus=for_sale"),
      ])

      const listingsData = await listingsRes.json()
      const platformsData = await platformsRes.json()
      const assetsData = await assetsRes.json()

      setListings(listingsData.listings || [])
      setSummary(listingsData.summary || null)
      setPlatforms(platformsData.platforms || {})
      setAssetsForSale(assetsData.assets || [])
    } catch (error) {
      logger.error("Failed to fetch data", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleGenerateListing = async () => {
    if (!selectedAsset) return

    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-listing",
          assetId: selectedAsset.id,
          assetName: selectedAsset.name,
          category: selectedAsset.category,
          condition: selectedAsset.condition,
          brand: selectedAsset.brand,
          model: selectedAsset.model,
          price: selectedAsset.salePrice || selectedAsset.currentValue,
          description: selectedAsset.description,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setGeneratedListing(data.generated)
        setListingTitle(data.generated.title)
        setListingDescription(data.generated.description)
        setListingPrice(data.generated.suggestedPrice?.toString() || "")
        setIsGenerateDialogOpen(false)
        setIsPublishDialogOpen(true)
      }
    } catch (error) {
      logger.error("Failed to generate listing", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handlePublish = async () => {
    if (!selectedAsset || selectedPlatforms.length === 0) return

    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto-publish",
          assetId: selectedAsset.id,
          assetName: selectedAsset.name,
          platforms: selectedPlatforms,
          title: listingTitle,
          description: listingDescription,
          price: parseFloat(listingPrice),
          category: selectedAsset.category,
          condition: selectedAsset.condition,
        }),
      })

      const data = await res.json()
      if (data.success) {
        fetchListings()
        setIsPublishDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      logger.error("Failed to publish", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const resetForm = () => {
    setSelectedAsset(null)
    setGeneratedListing(null)
    setSelectedPlatforms(["gumtree"])
    setListingTitle("")
    setListingDescription("")
    setListingPrice("")
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
              <Store className="h-8 w-8 text-amber-400" />
              Marketplace
            </h1>
            <p className="text-white/60 mt-1">Publish and manage asset listings across platforms</p>
          </div>
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => setIsGenerateDialogOpen(true)}
            data-testid="new-listing-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Store className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Listings</p>
                    <p className="text-2xl font-bold text-white">{summary.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Active</p>
                    <p className="text-2xl font-bold text-white">{summary.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Eye className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Views</p>
                    <p className="text-2xl font-bold text-white">{summary.totalViews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <DollarSign className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Potential Revenue</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summary.potentialRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-12 w-12 text-white/20 mb-4" />
              <p className="text-white/60 text-lg">No listings yet</p>
              <p className="text-white/40 text-sm mb-4">Create your first listing to start selling</p>
              <Button onClick={() => setIsGenerateDialogOpen(true)} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="bg-white/5 border-white/10 hover:bg-white/7 transition-colors" data-testid={`listing-${listing.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{PLATFORM_ICONS[listing.platform] || "📦"}</span>
                        <Badge className={STATUS_COLORS[listing.status]} data-testid={`listing-status-${listing.id}`}>
                          {listing.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-lg line-clamp-2">{listing.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/50 text-sm line-clamp-2">{listing.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/40 text-xs">Price</p>
                      <p className="text-white text-xl font-bold">{formatCurrency(listing.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-xs">Platform</p>
                      <p className="text-white capitalize">{platforms[listing.platform]?.name || listing.platform}</p>
                    </div>
                  </div>

                  {(listing.views || listing.inquiries) && (
                    <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                      {listing.views !== undefined && (
                        <div className="flex items-center gap-1 text-white/60 text-sm">
                          <Eye className="h-4 w-4" />
                          {listing.views} views
                        </div>
                      )}
                      {listing.inquiries !== undefined && (
                        <div className="flex items-center gap-1 text-white/60 text-sm">
                          <MessageSquare className="h-4 w-4" />
                          {listing.inquiries} inquiries
                        </div>
                      )}
                    </div>
                  )}

                  {listing.listingUrl && (
                    <Button variant="outline" className="w-full border-white/10" asChild>
                      <a href={listing.listingUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Listing
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Assets For Sale Section */}
        {assetsForSale.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Assets Ready to List</CardTitle>
              <CardDescription className="text-white/60">
                These assets are marked for sale but not yet listed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {assetsForSale.filter(a => !listings.some(l => l.assetId === a.id)).map((asset) => (
                  <div key={asset.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white font-medium truncate">{asset.name}</p>
                    <p className="text-white/40 text-sm capitalize">{asset.category.replace(/_/g, " ")}</p>
                    <p className="text-green-400 font-semibold mt-2">{formatCurrency(asset.salePrice)}</p>
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-amber-600 hover:bg-amber-700"
                      onClick={() => { setSelectedAsset(asset); setIsGenerateDialogOpen(true) }}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate Listing
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Listing Dialog */}
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                Generate Listing
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Select an asset to auto-generate a marketplace listing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Asset</Label>
                <Select
                  value={selectedAsset?.id || ""}
                  onValueChange={(id) => setSelectedAsset(assetsForSale.find(a => a.id === id) || null)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Choose an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetsForSale.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} - {formatCurrency(asset.salePrice)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedAsset && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white font-medium">{selectedAsset.name}</p>
                  <p className="text-white/60 text-sm mt-1">{selectedAsset.description}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-white/40">Brand: {selectedAsset.brand || "—"}</span>
                    <span className="text-white/40">Condition: {selectedAsset.condition}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleGenerateListing} disabled={!selectedAsset} className="bg-amber-600 hover:bg-amber-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Publish Dialog */}
        <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
          <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Publish to Marketplaces</DialogTitle>
              <DialogDescription className="text-white/60">
                Review and publish your listing to multiple platforms
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Platform Selection */}
              <div className="space-y-2">
                <Label>Select Platforms</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(platforms).map(([key, platform]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPlatforms.includes(key)
                          ? "bg-amber-500/20 border-amber-500"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <Checkbox
                        checked={selectedPlatforms.includes(key)}
                        onCheckedChange={(checked) => {
                          setSelectedPlatforms(prev =>
                            checked ? [...prev, key] : prev.filter(p => p !== key)
                          )
                        }}
                      />
                      <span className="text-xl">{PLATFORM_ICONS[key]}</span>
                      <span className="text-white text-sm">{platform.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                  className="bg-white/5 border-white/10"
                  data-testid="listing-title-input"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={listingDescription}
                  onChange={(e) => setListingDescription(e.target.value)}
                  className="bg-white/5 border-white/10"
                  rows={6}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label>Price (R)</Label>
                <Input
                  type="number"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsPublishDialogOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!listingTitle || !listingPrice || selectedPlatforms.length === 0}
                className="bg-amber-600 hover:bg-amber-700"
                data-testid="publish-listing-btn"
              >
                <Store className="h-4 w-4 mr-2" />
                Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? "s" : ""}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
