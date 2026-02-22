"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Boxes,
  Search,
  AlertTriangle,
  Package,
  ArrowDown,
  Leaf,
} from "lucide-react"
import { logger } from "@/lib/logger"

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
  supplier?: string
  unitCost: number
  totalValue: number
}

export default function LuckyInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isConsumeDialogOpen, setIsConsumeDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [consumeQuantity, setConsumeQuantity] = useState("")
  const [consumePurpose, setConsumePurpose] = useState("")

  const fetchInventory = useCallback(async () => {
    try {
      // Fetch only garden supplies for Lucky
      const res = await fetch("/api/inventory?category=garden_supplies")
      const data = await res.json()
      setItems(data.items || [])
    } catch (error) {
      logger.error("Failed to fetch inventory", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const handleConsume = async () => {
    if (!selectedItem || !consumeQuantity) return
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "consume",
          itemId: selectedItem.id,
          quantity: parseFloat(consumeQuantity),
          usedBy: "lucky",
          purpose: consumePurpose,
        }),
      })
      if (res.ok) {
        fetchInventory()
        setIsConsumeDialogOpen(false)
        setConsumeQuantity("")
        setConsumePurpose("")
      }
    } catch (error) {
      logger.error("Failed to consume", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const getStockLevel = (item: InventoryItem) => {
    if (item.currentStock <= item.minStock) return { color: "bg-red-500", label: "Critical" }
    if (item.currentStock <= item.reorderPoint) return { color: "bg-yellow-500", label: "Low" }
    return { color: "bg-green-500", label: "Good" }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout persona="lucky">
      <div className="space-y-6 relative z-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Leaf className="h-8 w-8 text-green-400" />
            Garden Inventory
          </h1>
          <p className="text-white/60 mt-1">Track and use garden supplies</p>
        </div>

        {/* Search */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search supplies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Boxes className="h-12 w-12 text-white/20 mb-4" />
              <p className="text-white/60 text-lg">No garden supplies found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const stockLevel = getStockLevel(item)
              const percentage = Math.min((item.currentStock / item.maxStock) * 100, 100)
              return (
                <Card key={item.id} className="bg-white/5 border-white/10">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-white/40 text-sm">{item.location}</p>
                      </div>
                      <Badge variant="outline" className={
                        stockLevel.color === 'bg-red-500' ? 'border-red-500 text-red-400' :
                        stockLevel.color === 'bg-yellow-500' ? 'border-yellow-500 text-yellow-400' :
                        'border-green-500 text-green-400'
                      }>
                        {stockLevel.label}
                      </Badge>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Stock Level</span>
                        <span className="text-white">{item.currentStock} / {item.maxStock} {item.unit}</span>
                      </div>
                      <Progress value={percentage} className={`h-2 ${stockLevel.color}`} />
                    </div>

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => { setSelectedItem(item); setIsConsumeDialogOpen(true) }}
                    >
                      <ArrowDown className="h-4 w-4 mr-2" />
                      Use Stock
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Consume Dialog */}
        <Dialog open={isConsumeDialogOpen} onOpenChange={setIsConsumeDialogOpen}>
          <DialogContent className="bg-[#0d0d12] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Use Stock</DialogTitle>
              <DialogDescription className="text-white/60">
                {selectedItem?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Quantity ({selectedItem?.unit})</Label>
                <Input
                  type="number"
                  value={consumeQuantity}
                  onChange={(e) => setConsumeQuantity(e.target.value)}
                  max={selectedItem?.currentStock}
                  className="bg-white/5 border-white/10"
                />
                <p className="text-white/40 text-xs">Available: {selectedItem?.currentStock} {selectedItem?.unit}</p>
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input
                  value={consumePurpose}
                  onChange={(e) => setConsumePurpose(e.target.value)}
                  placeholder="e.g. Front garden, Lawn treatment"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConsumeDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConsume} className="bg-green-600 hover:bg-green-700">
                Confirm Usage
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
