"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Clock,
  Package,
  ScanLine,
  ClipboardList,
  LogOut,
  User,
  CheckCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Loader2,
  Home,
  ShoppingCart,
  Banknote,
  Wrench,
  Check,
  X,
  ChevronLeft,
} from "lucide-react"

interface KioskUser {
  id: string
  name: string
  role: string
  clockedIn: boolean
  lastClockTime?: string
}

interface ScannedItem {
  id: string
  name: string
  currentStock: number
  unit: string
  location: string
  barcode: string
}

interface Task {
  id: string
  title: string
  priority: string
  status: string
  dueDate?: string
  description?: string
}

interface StockRequest {
  itemName: string
  quantity: number
  urgency: "normal" | "urgent"
  notes: string
}

interface AdvanceRequest {
  amount: number
  reason: string
  repaymentPlan: string
}

interface IssueReport {
  assetName: string
  issueType: "broken" | "maintenance" | "safety" | "other"
  description: string
  location: string
}

export default function KioskPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<KioskUser | null>(null)
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Modal states
  const [showScanner, setShowScanner] = useState(false)
  const [showTasks, setShowTasks] = useState(false)
  const [showItemAction, setShowItemAction] = useState(false)
  const [scannedItem, setScannedItem] = useState<ScannedItem | null>(null)
  const [actionType, setActionType] = useState<"consume" | "restock">("consume")
  const [quantity, setQuantity] = useState("1")
  const [purpose, setPurpose] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [actionSuccess, setActionSuccess] = useState(false)

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Simple PIN-based login for kiosk
  const handlePinLogin = async () => {
    setLoading(true)
    setError("")
    
    // PIN mapping (in production, this would be a secure API call)
    const pinMap: Record<string, KioskUser> = {
      "1234": { id: "charl", name: "Charl", role: "Workshop Operator", clockedIn: false },
      "5678": { id: "lucky", name: "Lucky", role: "Gardener", clockedIn: false },
      "9012": { id: "irma", name: "Irma", role: "Household", clockedIn: false },
      "0000": { id: "hans", name: "Hans", role: "Administrator", clockedIn: false },
    }
    
    await new Promise(r => setTimeout(r, 500)) // Simulate API call
    
    const user = pinMap[pin]
    if (user) {
      // Check if already clocked in (would be from API)
      setCurrentUser({ ...user, clockedIn: Math.random() > 0.5 })
      setPin("")
    } else {
      setError("Invalid PIN")
    }
    setLoading(false)
  }

  const handleClockInOut = async () => {
    if (!currentUser) return
    setLoading(true)
    
    try {
      await fetch("/api/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: currentUser.clockedIn ? "clock-out" : "clock-in",
          employeeId: currentUser.id,
        }),
      })
      
      setCurrentUser({
        ...currentUser,
        clockedIn: !currentUser.clockedIn,
        lastClockTime: new Date().toISOString(),
      })
    } catch (err) {
      console.error("Clock error:", err)
    }
    setLoading(false)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setPin("")
  }

  const handleBarcodeScanned = async (code: string) => {
    try {
      const res = await fetch(`/api/inventory?barcode=${encodeURIComponent(code)}`)
      const data = await res.json()
      
      if (data.items && data.items.length > 0) {
        setScannedItem(data.items[0])
        setShowScanner(false)
        setShowItemAction(true)
      } else {
        setError("Item not found")
      }
    } catch (err) {
      setError("Scan failed")
    }
  }

  const handleItemAction = async () => {
    if (!scannedItem || !currentUser) return
    setLoading(true)
    
    try {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          itemId: scannedItem.id,
          quantity: parseFloat(quantity),
          usedBy: currentUser.id,
          purpose: purpose || `Kiosk ${actionType}`,
        }),
      })
      
      setActionSuccess(true)
      setTimeout(() => {
        setShowItemAction(false)
        setScannedItem(null)
        setQuantity("1")
        setPurpose("")
        setActionSuccess(false)
      }, 2000)
    } catch (err) {
      setError("Action failed")
    }
    setLoading(false)
  }

  const fetchTasks = async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/tasks?assignee=${currentUser.id}`)
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    }
  }

  const openTasks = () => {
    fetchTasks()
    setShowTasks(true)
  }

  // PIN Entry Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">HV</span>
            </div>
            <h1 className="text-2xl font-bold text-white">House of Veritas</h1>
            <p className="text-white/60">Employee Kiosk</p>
          </div>

          {/* Clock Display */}
          <div className="text-center">
            <p className="text-5xl font-mono text-white">
              {currentTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-white/60">
              {currentTime.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* PIN Entry */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 space-y-4">
              <p className="text-white/80 text-center">Enter your PIN to clock in</p>
              
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="text-center text-3xl tracking-widest h-16 bg-white/5 border-white/10"
                autoFocus
              />

              {error && (
                <p className="text-red-400 text-center text-sm">{error}</p>
              )}

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((num, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className={`h-16 text-2xl border-white/10 ${num === "" ? "invisible" : ""}`}
                    onClick={() => {
                      if (num === "⌫") {
                        setPin(p => p.slice(0, -1))
                      } else if (typeof num === "number") {
                        setPin(p => (p + num).slice(0, 4))
                      }
                    }}
                    disabled={num === ""}
                  >
                    {num}
                  </Button>
                ))}
              </div>

              <Button
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                onClick={handlePinLogin}
                disabled={pin.length !== 4 || loading}
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Enter"}
              </Button>
            </CardContent>
          </Card>

          {/* Admin Link */}
          <Button
            variant="ghost"
            className="w-full text-white/40"
            onClick={() => router.push("/login")}
          >
            <Home className="h-4 w-4 mr-2" />
            Admin Login
          </Button>
        </div>
      </div>
    )
  }

  // Main Kiosk Interface
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{currentUser.name}</p>
            <p className="text-white/60 text-sm">{currentUser.role}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono text-white">
            {currentTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <Badge className={currentUser.clockedIn ? "bg-green-500" : "bg-gray-500"}>
            {currentUser.clockedIn ? "Clocked In" : "Clocked Out"}
          </Badge>
        </div>
      </div>

      {/* Main Actions Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 max-w-lg mx-auto w-full">
        {/* Clock In/Out */}
        <Button
          className={`h-40 flex flex-col gap-3 text-xl ${
            currentUser.clockedIn 
              ? "bg-red-600 hover:bg-red-700" 
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={handleClockInOut}
          disabled={loading}
        >
          <Clock className="h-12 w-12" />
          {currentUser.clockedIn ? "Clock Out" : "Clock In"}
        </Button>

        {/* Scan Item */}
        <Button
          className="h-40 flex flex-col gap-3 text-xl bg-cyan-600 hover:bg-cyan-700"
          onClick={() => setShowScanner(true)}
        >
          <ScanLine className="h-12 w-12" />
          Scan Item
        </Button>

        {/* Quick Consume */}
        <Button
          className="h-40 flex flex-col gap-3 text-xl bg-orange-600 hover:bg-orange-700"
          onClick={() => {
            setActionType("consume")
            setShowScanner(true)
          }}
        >
          <ArrowDown className="h-12 w-12" />
          Use Stock
        </Button>

        {/* My Tasks */}
        <Button
          className="h-40 flex flex-col gap-3 text-xl bg-purple-600 hover:bg-purple-700"
          onClick={openTasks}
        >
          <ClipboardList className="h-12 w-12" />
          My Tasks
        </Button>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="mt-6 h-14 text-lg border-white/10"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5 mr-2" />
        Sign Out
      </Button>

      {/* Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-cyan-400" />
              Scan Barcode
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ScanLine className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">Camera scanner initializing...</p>
                <p className="text-white/40 text-sm mt-2">Or enter barcode manually:</p>
              </div>
            </div>
            <Input
              placeholder="Enter barcode number"
              className="text-center text-lg h-14 bg-white/5 border-white/10"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  handleBarcodeScanned(e.currentTarget.value)
                }
              }}
            />
            <div className="grid grid-cols-2 gap-2">
              {/* Quick test barcodes */}
              {["6001234567890", "6001234567891", "6001234567892"].map((code) => (
                <Button
                  key={code}
                  variant="outline"
                  className="border-white/10 text-sm"
                  onClick={() => handleBarcodeScanned(code)}
                >
                  Test: {code.slice(-4)}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Action Dialog */}
      <Dialog open={showItemAction} onOpenChange={setShowItemAction}>
        <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionSuccess ? (
                <span className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  Success!
                </span>
              ) : (
                scannedItem?.name
              )}
            </DialogTitle>
          </DialogHeader>
          
          {actionSuccess ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-4" />
              <p className="text-white text-xl">
                {actionType === "consume" ? "Usage recorded" : "Stock added"}
              </p>
            </div>
          ) : scannedItem && (
            <div className="space-y-4">
              {/* Item Info */}
              <div className="p-4 bg-white/5 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Current Stock</span>
                  <span className="text-white font-semibold">
                    {scannedItem.currentStock} {scannedItem.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Location</span>
                  <span className="text-white">{scannedItem.location}</span>
                </div>
              </div>

              {/* Action Type Selection */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className={`h-16 ${actionType === "consume" ? "bg-orange-600" : "bg-white/10"}`}
                  onClick={() => setActionType("consume")}
                >
                  <ArrowDown className="h-5 w-5 mr-2" />
                  Use
                </Button>
                <Button
                  className={`h-16 ${actionType === "restock" ? "bg-green-600" : "bg-white/10"}`}
                  onClick={() => setActionType("restock")}
                >
                  <ArrowUp className="h-5 w-5 mr-2" />
                  Add
                </Button>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <p className="text-white/60">Quantity ({scannedItem.unit})</p>
                <div className="flex gap-2">
                  {[1, 2, 5, 10].map((q) => (
                    <Button
                      key={q}
                      variant={quantity === String(q) ? "default" : "outline"}
                      className={`flex-1 h-14 text-xl ${quantity === String(q) ? "bg-blue-600" : "border-white/10"}`}
                      onClick={() => setQuantity(String(q))}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-14 text-xl text-center bg-white/5 border-white/10"
                />
              </div>

              {/* Purpose (for consume) */}
              {actionType === "consume" && (
                <Input
                  placeholder="Purpose (optional)"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="h-14 bg-white/5 border-white/10"
                />
              )}
            </div>
          )}
          
          {!actionSuccess && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowItemAction(false)}
                className="border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleItemAction}
                disabled={loading}
                className={actionType === "consume" ? "bg-orange-600" : "bg-green-600"}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : actionType === "consume" ? (
                  <>
                    <ArrowDown className="h-5 w-5 mr-2" />
                    Record Usage
                  </>
                ) : (
                  <>
                    <ArrowUp className="h-5 w-5 mr-2" />
                    Add Stock
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Tasks Dialog */}
      <Dialog open={showTasks} onOpenChange={setShowTasks}>
        <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-purple-400" />
              My Tasks
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-white/40">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks assigned</p>
              </div>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{task.title}</p>
                        {task.dueDate && (
                          <p className="text-white/40 text-sm">Due: {task.dueDate}</p>
                        )}
                      </div>
                      <Badge className={
                        task.priority === "high" ? "bg-red-500" :
                        task.priority === "medium" ? "bg-yellow-500" : "bg-gray-500"
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
