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
  History,
  XCircle,
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Settings,
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

interface RequestHistory {
  id: string
  type: "stock_order" | "salary_advance" | "issue_report"
  data: Record<string, any>
  timestamp: string
  status: "pending" | "approved" | "rejected" | "completed"
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

export default function KioskPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<KioskUser | null>(null)
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [successMessage, setSuccessMessage] = useState("")
  
  // Modal states
  const [showScanner, setShowScanner] = useState(false)
  const [showTasks, setShowTasks] = useState(false)
  const [showItemAction, setShowItemAction] = useState(false)
  const [showStockRequest, setShowStockRequest] = useState(false)
  const [showAdvanceRequest, setShowAdvanceRequest] = useState(false)
  const [showIssueReport, setShowIssueReport] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false)
  const [scannedItem, setScannedItem] = useState<ScannedItem | null>(null)
  const [actionType, setActionType] = useState<"consume" | "restock">("consume")
  const [quantity, setQuantity] = useState("1")
  const [purpose, setPurpose] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [actionSuccess, setActionSuccess] = useState(false)
  const [requestHistory, setRequestHistory] = useState<RequestHistory[]>([])
  const [notificationPref, setNotificationPref] = useState<"sms" | "whatsapp" | "email">("sms")
  
  // Form states
  const [stockRequest, setStockRequest] = useState<StockRequest>({
    itemName: "",
    quantity: 1,
    urgency: "normal",
    notes: "",
  })
  const [advanceRequest, setAdvanceRequest] = useState<AdvanceRequest>({
    amount: 0,
    reason: "",
    repaymentPlan: "1month",
  })
  const [issueReport, setIssueReport] = useState<IssueReport>({
    assetName: "",
    issueType: "maintenance",
    description: "",
    location: "",
  })

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
          action: currentUser.clockedIn ? "clockOut" : "clockIn",
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

  // Fetch request history
  const fetchRequestHistory = async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/kiosk/requests?employeeId=${currentUser.id}`)
      const data = await res.json()
      setRequestHistory(data.requests || [])
    } catch (err) {
      console.error("Failed to fetch request history:", err)
    }
  }

  const openHistory = () => {
    fetchRequestHistory()
    setShowHistory(true)
  }

  // Mark task as complete
  const completeTask = async (taskId: string) => {
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          updates: { status: "completed" },
        }),
      })
      fetchTasks() // Refresh tasks
      showSuccess("Task marked as complete!")
    } catch (err) {
      console.error("Failed to complete task:", err)
    }
  }

  // Submit stock request
  const submitStockRequest = async () => {
    if (!currentUser || !stockRequest.itemName) return
    setLoading(true)
    try {
      await fetch("/api/kiosk/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stock_order",
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          data: stockRequest,
          timestamp: new Date().toISOString(),
        }),
      })
      setShowStockRequest(false)
      setStockRequest({ itemName: "", quantity: 1, urgency: "normal", notes: "" })
      showSuccess("Stock request submitted!")
    } catch (err) {
      console.error("Failed to submit stock request:", err)
      setError("Failed to submit request")
    }
    setLoading(false)
  }

  // Submit salary advance request
  const submitAdvanceRequest = async () => {
    if (!currentUser || advanceRequest.amount <= 0) return
    setLoading(true)
    try {
      await fetch("/api/kiosk/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "salary_advance",
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          data: advanceRequest,
          timestamp: new Date().toISOString(),
        }),
      })
      setShowAdvanceRequest(false)
      setAdvanceRequest({ amount: 0, reason: "", repaymentPlan: "1month" })
      showSuccess("Advance request submitted for approval!")
    } catch (err) {
      console.error("Failed to submit advance request:", err)
      setError("Failed to submit request")
    }
    setLoading(false)
  }

  // Submit issue report
  const submitIssueReport = async () => {
    if (!currentUser || !issueReport.assetName || !issueReport.description) return
    setLoading(true)
    try {
      await fetch("/api/kiosk/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "issue_report",
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          data: issueReport,
          timestamp: new Date().toISOString(),
        }),
      })
      setShowIssueReport(false)
      setIssueReport({ assetName: "", issueType: "maintenance", description: "", location: "" })
      showSuccess("Issue reported successfully!")
    } catch (err) {
      console.error("Failed to submit issue report:", err)
      setError("Failed to submit report")
    }
    setLoading(false)
  }

  // Show success message
  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 3000)
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

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top">
          <CheckCircle className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {/* Main Actions Grid - 3 columns on larger screens */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto w-full">
        {/* Clock In/Out */}
        <Button
          data-testid="kiosk-clock-btn"
          className={`h-32 sm:h-36 flex flex-col gap-2 text-base sm:text-lg ${
            currentUser.clockedIn 
              ? "bg-red-600 hover:bg-red-700" 
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={handleClockInOut}
          disabled={loading}
        >
          <Clock className="h-10 w-10" />
          {currentUser.clockedIn ? "Clock Out" : "Clock In"}
        </Button>

        {/* Scan Item */}
        <Button
          data-testid="kiosk-scan-btn"
          className="h-32 sm:h-36 flex flex-col gap-2 text-base sm:text-lg bg-cyan-600 hover:bg-cyan-700"
          onClick={() => setShowScanner(true)}
        >
          <ScanLine className="h-10 w-10" />
          Scan Item
        </Button>

        {/* Use Stock */}
        <Button
          data-testid="kiosk-use-stock-btn"
          className="h-32 sm:h-36 flex flex-col gap-2 text-base sm:text-lg bg-orange-600 hover:bg-orange-700"
          onClick={() => {
            setActionType("consume")
            setShowScanner(true)
          }}
        >
          <ArrowDown className="h-10 w-10" />
          Use Stock
        </Button>

        {/* My Tasks */}
        <Button
          data-testid="kiosk-tasks-btn"
          className="h-32 sm:h-36 flex flex-col gap-2 text-base sm:text-lg bg-purple-600 hover:bg-purple-700"
          onClick={openTasks}
        >
          <ClipboardList className="h-10 w-10" />
          My Tasks
        </Button>

        {/* Request Stock Order */}
        <Button
          data-testid="kiosk-order-stock-btn"
          className="h-32 sm:h-36 flex flex-col gap-2 text-base sm:text-lg bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowStockRequest(true)}
        >
          <ShoppingCart className="h-10 w-10" />
          Order Stock
        </Button>

        {/* Request Advance */}
        <Button
          data-testid="kiosk-advance-btn"
          className="h-32 sm:h-36 flex flex-col gap-2 text-base sm:text-lg bg-yellow-600 hover:bg-yellow-700"
          onClick={() => setShowAdvanceRequest(true)}
        >
          <Banknote className="h-10 w-10" />
          Ask Advance
        </Button>

        {/* Report Issue */}
        <Button
          data-testid="kiosk-report-issue-btn"
          className="h-32 sm:h-36 flex flex-col gap-2 text-base sm:text-lg bg-rose-600 hover:bg-rose-700"
          onClick={() => setShowIssueReport(true)}
        >
          <Wrench className="h-10 w-10" />
          Report Issue
        </Button>

        {/* My Requests History */}
        <Button
          data-testid="kiosk-history-btn"
          className="h-32 sm:h-36 flex flex-col gap-2 text-base sm:text-lg bg-indigo-600 hover:bg-indigo-700 col-span-2 sm:col-span-1"
          onClick={openHistory}
        >
          <History className="h-10 w-10" />
          My Requests
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-white font-medium ${task.status === "completed" ? "line-through opacity-50" : ""}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-white/50 text-sm mt-1 line-clamp-2">{task.description}</p>
                        )}
                        {task.dueDate && (
                          <p className="text-white/40 text-sm mt-1">Due: {task.dueDate}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={
                          task.priority === "high" ? "bg-red-500" :
                          task.priority === "medium" ? "bg-yellow-500" : "bg-gray-500"
                        }>
                          {task.priority}
                        </Badge>
                        {task.status !== "completed" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                            onClick={() => completeTask(task.id)}
                            data-testid={`complete-task-${task.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Request Dialog */}
      <Dialog open={showStockRequest} onOpenChange={setShowStockRequest}>
        <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-400" />
              Request Stock Order
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Submit a request for stock that needs to be ordered
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Item Name *</Label>
              <Input
                value={stockRequest.itemName}
                onChange={(e) => setStockRequest(s => ({ ...s, itemName: e.target.value }))}
                placeholder="e.g., Pool chlorine, Cement bags"
                className="bg-white/5 border-white/10"
                data-testid="stock-item-name-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={stockRequest.quantity}
                  onChange={(e) => setStockRequest(s => ({ ...s, quantity: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="bg-white/5 border-white/10"
                  data-testid="stock-quantity-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Urgency</Label>
                <Select
                  value={stockRequest.urgency}
                  onValueChange={(v: "normal" | "urgent") => setStockRequest(s => ({ ...s, urgency: v }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={stockRequest.notes}
                onChange={(e) => setStockRequest(s => ({ ...s, notes: e.target.value }))}
                placeholder="Any additional details..."
                className="bg-white/5 border-white/10 min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockRequest(false)} className="border-white/10">
              Cancel
            </Button>
            <Button
              onClick={submitStockRequest}
              disabled={loading || !stockRequest.itemName}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="submit-stock-request-btn"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Salary Advance Dialog */}
      <Dialog open={showAdvanceRequest} onOpenChange={setShowAdvanceRequest}>
        <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-yellow-400" />
              Request Salary Advance
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Submit a request for a salary advance (requires approval)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Amount (R) *</Label>
              <Input
                type="number"
                value={advanceRequest.amount || ""}
                onChange={(e) => setAdvanceRequest(a => ({ ...a, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter amount"
                min="100"
                step="100"
                className="bg-white/5 border-white/10 text-xl h-14"
                data-testid="advance-amount-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                value={advanceRequest.reason}
                onChange={(e) => setAdvanceRequest(a => ({ ...a, reason: e.target.value }))}
                placeholder="Please explain why you need the advance..."
                className="bg-white/5 border-white/10 min-h-[100px]"
                data-testid="advance-reason-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Repayment Plan</Label>
              <Select
                value={advanceRequest.repaymentPlan}
                onValueChange={(v) => setAdvanceRequest(a => ({ ...a, repaymentPlan: v }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Full deduction next month</SelectItem>
                  <SelectItem value="2months">Split over 2 months</SelectItem>
                  <SelectItem value="3months">Split over 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-300">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Advances are subject to approval by management and will be deducted from future salary.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdvanceRequest(false)} className="border-white/10">
              Cancel
            </Button>
            <Button
              onClick={submitAdvanceRequest}
              disabled={loading || advanceRequest.amount <= 0 || !advanceRequest.reason}
              className="bg-yellow-600 hover:bg-yellow-700"
              data-testid="submit-advance-request-btn"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Issue Dialog */}
      <Dialog open={showIssueReport} onOpenChange={setShowIssueReport}>
        <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-rose-400" />
              Report Issue / Maintenance
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Report a broken item or maintenance issue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Asset / Item Name *</Label>
              <Input
                value={issueReport.assetName}
                onChange={(e) => setIssueReport(i => ({ ...i, assetName: e.target.value }))}
                placeholder="e.g., Pool pump, Gate motor, Lawnmower"
                className="bg-white/5 border-white/10"
                data-testid="issue-asset-name-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Type</Label>
                <Select
                  value={issueReport.issueType}
                  onValueChange={(v: "broken" | "maintenance" | "safety" | "other") => setIssueReport(i => ({ ...i, issueType: v }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="broken">Broken / Not Working</SelectItem>
                    <SelectItem value="maintenance">Needs Maintenance</SelectItem>
                    <SelectItem value="safety">Safety Hazard</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={issueReport.location}
                  onChange={(e) => setIssueReport(i => ({ ...i, location: e.target.value }))}
                  placeholder="e.g., Pool area"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={issueReport.description}
                onChange={(e) => setIssueReport(i => ({ ...i, description: e.target.value }))}
                placeholder="Describe the issue in detail..."
                className="bg-white/5 border-white/10 min-h-[100px]"
                data-testid="issue-description-input"
              />
            </div>
            {issueReport.issueType === "safety" && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Safety hazards are flagged as high priority and will be reviewed immediately.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueReport(false)} className="border-white/10">
              Cancel
            </Button>
            <Button
              onClick={submitIssueReport}
              disabled={loading || !issueReport.assetName || !issueReport.description}
              className="bg-rose-600 hover:bg-rose-700"
              data-testid="submit-issue-report-btn"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Report Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-400" />
              My Requests
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Track the status of your submitted requests
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {requestHistory.length === 0 ? (
              <div className="py-8 text-center text-white/40">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No requests submitted yet</p>
                <p className="text-sm mt-1">Your stock orders, advance requests, and issue reports will appear here</p>
              </div>
            ) : (
              requestHistory.map((request) => (
                <Card key={request.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${
                          request.type === "stock_order" ? "bg-blue-500/20" :
                          request.type === "salary_advance" ? "bg-yellow-500/20" : "bg-rose-500/20"
                        }`}>
                          {request.type === "stock_order" ? (
                            <ShoppingCart className="h-5 w-5 text-blue-400" />
                          ) : request.type === "salary_advance" ? (
                            <Banknote className="h-5 w-5 text-yellow-400" />
                          ) : (
                            <Wrench className="h-5 w-5 text-rose-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-medium text-sm">
                              {request.type === "stock_order" ? "Stock Order" :
                               request.type === "salary_advance" ? "Salary Advance" : "Issue Report"}
                            </span>
                            <Badge className={`text-xs ${
                              request.status === "pending" ? "bg-yellow-500" :
                              request.status === "approved" ? "bg-green-500" :
                              request.status === "rejected" ? "bg-red-500" : "bg-blue-500"
                            }`}>
                              {request.status === "pending" ? "Pending" :
                               request.status === "approved" ? "Approved" :
                               request.status === "rejected" ? "Rejected" : "Completed"}
                            </Badge>
                          </div>
                          <p className="text-white/60 text-sm mt-1 line-clamp-1">
                            {request.type === "stock_order" && `${request.data.quantity}x ${request.data.itemName}`}
                            {request.type === "salary_advance" && `R ${request.data.amount?.toLocaleString()}`}
                            {request.type === "issue_report" && `${request.data.assetName} - ${request.data.issueType}`}
                          </p>
                          <p className="text-white/40 text-xs mt-1">
                            {new Date(request.timestamp).toLocaleDateString("en-ZA", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                          {request.notes && request.status !== "pending" && (
                            <div className={`mt-2 p-2 rounded text-xs ${
                              request.status === "approved" ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"
                            }`}>
                              <span className="font-medium">
                                {request.status === "approved" ? <CheckCircle className="h-3 w-3 inline mr-1" /> : <XCircle className="h-3 w-3 inline mr-1" />}
                              </span>
                              {request.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowHistory(false)}
              className="w-full border-white/10"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
