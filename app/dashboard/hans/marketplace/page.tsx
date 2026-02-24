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
import { apiFetch } from "@/lib/api-client"

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
      const [listingsData, platformsData, assetsData] = await Promise.all([
        apiFetch<{ listings?: MarketplaceListing[]; summary?: unknown }>("/api/marketplace", {
          label: "Marketplace",
        }),
        apiFetch<{ platforms?: Record<string, Platform> }>("/api/marketplace?action=platforms", {
          label: "Platforms",
        }),
        apiFetch<{ assets?: Asset[] }>("/api/assets/enhanced?saleStatus=for_sale", {
          label: "AssetsForSale",
        }),
      ])

      setListings(listingsData?.listings ?? [])
      setSummary(listingsData?.summary ?? null)
      setPlatforms(platformsData?.platforms ?? {})
      setAssetsForSale(assetsData?.assets ?? [])
    } catch (error) {
      logger.error("Failed to fetch data", {
        error: error instanceof Error ? error.message : String(error),
      })
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
      const data = await apiFetch<{
        success?: boolean
        generated?: { title?: string; description?: string; suggestedPrice?: number }
      }>("/api/marketplace", {
        method: "POST",
        body: {
          action: "generate-listing",
          assetId: selectedAsset.id,
          assetName: selectedAsset.name,
          category: selectedAsset.category,
          condition: selectedAsset.condition,
          brand: selectedAsset.brand,
          model: selectedAsset.model,
          price: selectedAsset.salePrice || selectedAsset.currentValue,
          description: selectedAsset.description,
        },
        label: "GenerateListing",
      })
      if (data?.success && data?.generated) {
        setGeneratedListing(data.generated)
        setListingTitle(data.generated.title ?? "")
        setListingDescription(data.generated.description ?? "")
        setListingPrice(data.generated.suggestedPrice?.toString() ?? "")
        setIsGenerateDialogOpen(false)
        setIsPublishDialogOpen(true)
      }
    } catch (error) {
      logger.error("Failed to generate listing", {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const handlePublish = async () => {
    if (!selectedAsset || selectedPlatforms.length === 0) return

    try {
      const data = await apiFetch<{ success?: boolean }>("/api/marketplace", {
        method: "POST",
        body: {
          action: "auto-publish",
          assetId: selectedAsset.id,
          assetName: selectedAsset.name,
          platforms: selectedPlatforms,
          title: listingTitle,
          description: listingDescription,
          price: parseFloat(listingPrice),
          category: selectedAsset.category,
          condition: selectedAsset.condition,
        },
        label: "PublishListing",
      })
      if (data?.success) {
        fetchListings()
        setIsPublishDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      logger.error("Failed to publish", {
        error: error instanceof Error ? error.message : String(error),
      })
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
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
              <Store className="h-8 w-8 text-amber-400" />
              Marketplace
            </h1>
            <p className="mt-1 text-white/60">Publish and manage asset listings across platforms</p>
          </div>
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => setIsGenerateDialogOpen(true)}
            data-testid="new-listing-btn"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-amber-500/20 p-3">
                    <Store className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Total Listings</p>
                    <p className="text-2xl font-bold text-white">{summary.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-green-500/20 p-3">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Active</p>
                    <p className="text-2xl font-bold text-white">{summary.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-blue-500/20 p-3">
                    <Eye className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Total Views</p>
                    <p className="text-2xl font-bold text-white">{summary.totalViews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-purple-500/20 p-3">
                    <DollarSign className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Potential Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(summary.potentialRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
          </div>
        ) : listings.length === 0 ? (
          <Card className="border-white/10 bg-white/5">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="mb-4 h-12 w-12 text-white/20" />
              <p className="text-lg text-white/60">No listings yet</p>
              <p className="mb-4 text-sm text-white/40">
                Create your first listing to start selling
              </p>
              <Button
                onClick={() => setIsGenerateDialogOpen(true)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                className="border-white/10 bg-white/5 transition-colors hover:bg-white/7"
                data-testid={`listing-${listing.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xl">{PLATFORM_ICONS[listing.platform] || "📦"}</span>
                        <Badge
                          className={STATUS_COLORS[listing.status]}
                          data-testid={`listing-status-${listing.id}`}
                        >
                          {listing.status}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-2 text-lg text-white">
                        {listing.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="line-clamp-2 text-sm text-white/50">{listing.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/40">Price</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(listing.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/40">Platform</p>
                      <p className="text-white capitalize">
                        {platforms[listing.platform]?.name || listing.platform}
                      </p>
                    </div>
                  </div>

                  {(listing.views || listing.inquiries) && (
                    <div className="flex items-center gap-4 border-t border-white/10 pt-2">
                      {listing.views !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-white/60">
                          <Eye className="h-4 w-4" />
                          {listing.views} views
                        </div>
                      )}
                      {listing.inquiries !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-white/60">
                          <MessageSquare className="h-4 w-4" />
                          {listing.inquiries} inquiries
                        </div>
                      )}
                    </div>
                  )}

                  {listing.listingUrl && (
                    <Button variant="outline" className="w-full border-white/10" asChild>
                      <a href={listing.listingUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
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
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">Assets Ready to List</CardTitle>
              <CardDescription className="text-white/60">
                These assets are marked for sale but not yet listed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {assetsForSale
                  .filter((a) => !listings.some((l) => l.assetId === a.id))
                  .map((asset) => (
                    <div
                      key={asset.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-4"
                    >
                      <p className="truncate font-medium text-white">{asset.name}</p>
                      <p className="text-sm text-white/40 capitalize">
                        {asset.category.replace(/_/g, " ")}
                      </p>
                      <p className="mt-2 font-semibold text-green-400">
                        {formatCurrency(asset.salePrice)}
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 w-full bg-amber-600 hover:bg-amber-700"
                        onClick={() => {
                          setSelectedAsset(asset)
                          setIsGenerateDialogOpen(true)
                        }}
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
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
          <DialogContent className="max-w-lg border-white/10 bg-[#0d0d12] text-white">
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
                  onValueChange={(id) =>
                    setSelectedAsset(assetsForSale.find((a) => a.id === id) || null)
                  }
                >
                  <SelectTrigger className="border-white/10 bg-white/5">
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
                <div className="rounded-lg bg-white/5 p-4">
                  <p className="font-medium text-white">{selectedAsset.name}</p>
                  <p className="mt-1 text-sm text-white/60">{selectedAsset.description}</p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className="text-white/40">Brand: {selectedAsset.brand || "—"}</span>
                    <span className="text-white/40">Condition: {selectedAsset.condition}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerateListing}
                disabled={!selectedAsset}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Publish Dialog */}
        <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 bg-[#0d0d12] text-white">
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
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {Object.entries(platforms).map(([key, platform]) => (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                        selectedPlatforms.includes(key)
                          ? "border-amber-500 bg-amber-500/20"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <Checkbox
                        checked={selectedPlatforms.includes(key)}
                        onCheckedChange={(checked) => {
                          setSelectedPlatforms((prev) =>
                            checked ? [...prev, key] : prev.filter((p) => p !== key)
                          )
                        }}
                      />
                      <span className="text-xl">{PLATFORM_ICONS[key]}</span>
                      <span className="text-sm text-white">{platform.name}</span>
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
                  className="border-white/10 bg-white/5"
                  data-testid="listing-title-input"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={listingDescription}
                  onChange={(e) => setListingDescription(e.target.value)}
                  className="border-white/10 bg-white/5"
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
                  className="border-white/10 bg-white/5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsPublishDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!listingTitle || !listingPrice || selectedPlatforms.length === 0}
                className="bg-amber-600 hover:bg-amber-700"
                data-testid="publish-listing-btn"
              >
                <Store className="mr-2 h-4 w-4" />
                Publish to {selectedPlatforms.length} Platform
                {selectedPlatforms.length !== 1 ? "s" : ""}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
