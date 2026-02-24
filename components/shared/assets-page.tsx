"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, RefreshCw, Loader2 } from "lucide-react"
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"

interface Asset {
  id: number
  assetId: string
  type: string
  description?: string
  condition: string
  location: string
  checkedOutBy?: number
}

interface AssetsPageProps {
  personaId: string
  title?: string
  showAll?: boolean
}

export function AssetsPage({ personaId, title = "Assets", showAll = false }: AssetsPageProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [summary, setSummary] = useState<{ total: number; available: number; checkedOut: number } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAssets = useCallback(async () => {
    try {
      const data = await apiFetch<{ assets?: Asset[]; summary?: { total: number; available: number; checkedOut: number } }>(
        "/api/assets",
        { label: "Assets" }
      )
      setAssets(data?.assets || [])
      setSummary(data?.summary || null)
    } catch (error) {
      logger.error("Failed to fetch assets", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Package className="h-7 w-7" />
          {title}
        </h1>
        <p className="text-white/60 mt-1">
          {showAll ? "All assets" : "Assets available to you"}
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-white/50 text-sm">Total</p>
              <p className="text-2xl font-semibold text-white">{summary.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-green-400/80 text-sm">Available</p>
              <p className="text-2xl font-semibold text-green-400">{summary.available}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-amber-400/80 text-sm">Checked Out</p>
              <p className="text-2xl font-semibold text-amber-400">{summary.checkedOut}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-[#0d0d12]/80 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Asset List</CardTitle>
          <CardDescription className="text-white/60">
            {assets.length} asset{assets.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
          ) : assets.length === 0 ? (
            <p className="text-white/50 text-center py-8">No assets found.</p>
          ) : (
            <div className="space-y-3">
              {assets.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div>
                    <p className="text-white font-medium">{a.assetId || a.type}</p>
                    <p className="text-white/50 text-sm">{a.type} · {a.location}</p>
                  </div>
                  <Badge variant="outline" className="border-white/20">
                    {a.checkedOutBy ? "Checked Out" : "Available"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button variant="outline" className="border-white/10" onClick={fetchAssets}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
