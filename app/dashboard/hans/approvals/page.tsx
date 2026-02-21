"use client"

import { useState, useEffect, useCallback } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckSquare,
  ShoppingCart,
  Banknote,
  Wrench,
  Clock,
  Check,
  X,
  AlertTriangle,
  User,
  Calendar,
  RefreshCw,
  Filter,
  Search,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface KioskRequest {
  id: string
  type: "stock_order" | "salary_advance" | "issue_report"
  employeeId: string
  employeeName: string
  data: Record<string, any>
  timestamp: string
  status: "pending" | "approved" | "rejected" | "completed"
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

interface Summary {
  total: number
  pending: number
  approved: number
  byType: {
    stock_order: number
    salary_advance: number
    issue_report: number
  }
}

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<KioskRequest[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<KioskRequest | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")
  const [actionNotes, setActionNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("pending")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterType !== "all") params.append("type", filterType)
      if (filterStatus !== "all") params.append("status", filterStatus)

      const res = await fetch(`/api/kiosk/requests?${params}`)
      const data = await res.json()
      setRequests(data.requests || [])
      setSummary(data.summary || null)
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    } finally {
      setLoading(false)
    }
  }, [filterType, filterStatus])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleAction = async () => {
    if (!selectedRequest) return
    setProcessing(true)

    try {
      const res = await fetch("/api/kiosk/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status: actionType === "approve" ? "approved" : "rejected",
          reviewedBy: "hans",
          notes: actionNotes,
        }),
      })

      if (res.ok) {
        await fetchRequests()
        setShowActionDialog(false)
        setShowDetailDialog(false)
        setActionNotes("")
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error("Failed to update request:", error)
    } finally {
      setProcessing(false)
    }
  }

  const openActionDialog = (request: KioskRequest, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setActionType(action)
    setActionNotes("")
    setShowActionDialog(true)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stock_order":
        return <ShoppingCart className="h-5 w-5 text-blue-400" />
      case "salary_advance":
        return <Banknote className="h-5 w-5 text-yellow-400" />
      case "issue_report":
        return <Wrench className="h-5 w-5 text-rose-400" />
      default:
        return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "stock_order":
        return "Stock Order"
      case "salary_advance":
        return "Salary Advance"
      case "issue_report":
        return "Issue Report"
      default:
        return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getUrgencyBadge = (urgency: string) => {
    if (urgency === "urgent") {
      return <Badge variant="destructive" className="ml-2">Urgent</Badge>
    }
    return null
  }

  const filteredRequests = requests.filter((req) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        req.employeeName.toLowerCase().includes(search) ||
        req.data?.itemName?.toLowerCase().includes(search) ||
        req.data?.assetName?.toLowerCase().includes(search) ||
        req.data?.reason?.toLowerCase().includes(search)
      )
    }
    return true
  })

  const pendingCount = summary?.pending || 0

  return (
    <DashboardLayout persona="hans">
      <div className="space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-blue-400" />
              Approval Center
              {pendingCount > 0 && (
                <Badge className="bg-yellow-500 text-lg">{pendingCount} pending</Badge>
              )}
            </h1>
            <p className="text-white/60 mt-1">Review and approve employee requests</p>
          </div>
          <Button variant="outline" onClick={() => fetchRequests()} className="border-white/10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/20">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-white">{summary.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <ShoppingCart className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Stock Orders</p>
                    <p className="text-2xl font-bold text-white">{summary.byType.stock_order}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/20">
                    <Banknote className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Advances</p>
                    <p className="text-2xl font-bold text-white">{summary.byType.salary_advance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-rose-500/20">
                    <Wrench className="h-6 w-6 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Issues</p>
                    <p className="text-2xl font-bold text-white">{summary.byType.issue_report}</p>
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
                  placeholder="Search by employee, item, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10"
                  data-testid="approval-search-input"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stock_order">Stock Orders</SelectItem>
                  <SelectItem value="salary_advance">Salary Advances</SelectItem>
                  <SelectItem value="issue_report">Issue Reports</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[150px] bg-white/5 border-white/10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-white text-lg">No requests to review</p>
              <p className="text-white/60 mt-1">All caught up! No pending approvals.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card
                key={request.id}
                className={`bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors ${
                  request.status === "pending" ? "border-l-4 border-l-yellow-500" : ""
                }`}
                data-testid={`request-card-${request.id}`}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Request Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-white/5">
                        {getTypeIcon(request.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium">
                            {getTypeLabel(request.type)}
                          </span>
                          {getStatusBadge(request.status)}
                          {request.data?.urgency && getUrgencyBadge(request.data.urgency)}
                          {request.data?.issueType === "safety" && (
                            <Badge variant="destructive" className="ml-1">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Safety
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 text-white/60 text-sm">
                          {request.type === "stock_order" && (
                            <span>
                              {request.data.quantity}x {request.data.itemName}
                            </span>
                          )}
                          {request.type === "salary_advance" && (
                            <span>R {request.data.amount?.toLocaleString()} requested</span>
                          )}
                          {request.type === "issue_report" && (
                            <span>
                              {request.data.assetName} - {request.data.issueType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-white/40 text-xs">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {request.employeeName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(request.timestamp)}
                          </span>
                        </div>
                        {request.notes && request.status !== "pending" && (
                          <div className="mt-2 p-2 bg-white/5 rounded text-sm text-white/60">
                            <span className="text-white/40">Note:</span> {request.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 lg:flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10"
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowDetailDialog(true)
                        }}
                        data-testid={`view-request-${request.id}`}
                      >
                        View Details
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => openActionDialog(request, "approve")}
                            data-testid={`approve-${request.id}`}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openActionDialog(request, "reject")}
                            data-testid={`reject-${request.id}`}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedRequest && getTypeIcon(selectedRequest.type)}
                {selectedRequest && getTypeLabel(selectedRequest.type)} Details
              </DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                {/* Employee Info */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedRequest.employeeName}</p>
                    <p className="text-white/60 text-sm">{formatDate(selectedRequest.timestamp)}</p>
                  </div>
                  <div className="ml-auto">{getStatusBadge(selectedRequest.status)}</div>
                </div>

                {/* Request Details */}
                <div className="space-y-3">
                  {selectedRequest.type === "stock_order" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/60">Item</span>
                        <span className="text-white font-medium">{selectedRequest.data.itemName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Quantity</span>
                        <span className="text-white">{selectedRequest.data.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Urgency</span>
                        <span className="text-white capitalize">{selectedRequest.data.urgency}</span>
                      </div>
                      {selectedRequest.data.notes && (
                        <div>
                          <span className="text-white/60 block mb-1">Notes</span>
                          <p className="text-white bg-white/5 p-2 rounded">{selectedRequest.data.notes}</p>
                        </div>
                      )}
                    </>
                  )}

                  {selectedRequest.type === "salary_advance" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/60">Amount</span>
                        <span className="text-white font-medium text-xl">
                          R {selectedRequest.data.amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Repayment Plan</span>
                        <span className="text-white capitalize">
                          {selectedRequest.data.repaymentPlan === "1month"
                            ? "Full next month"
                            : selectedRequest.data.repaymentPlan === "2months"
                            ? "2 months"
                            : "3 months"}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60 block mb-1">Reason</span>
                        <p className="text-white bg-white/5 p-2 rounded">{selectedRequest.data.reason}</p>
                      </div>
                    </>
                  )}

                  {selectedRequest.type === "issue_report" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/60">Asset</span>
                        <span className="text-white font-medium">{selectedRequest.data.assetName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Issue Type</span>
                        <Badge
                          className={
                            selectedRequest.data.issueType === "safety"
                              ? "bg-red-500"
                              : selectedRequest.data.issueType === "broken"
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }
                        >
                          {selectedRequest.data.issueType}
                        </Badge>
                      </div>
                      {selectedRequest.data.location && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Location</span>
                          <span className="text-white">{selectedRequest.data.location}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-white/60 block mb-1">Description</span>
                        <p className="text-white bg-white/5 p-2 rounded">{selectedRequest.data.description}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Review Info */}
                {selectedRequest.reviewedBy && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-white/40 text-sm">
                      {selectedRequest.status === "approved" ? "Approved" : "Rejected"} by{" "}
                      <span className="text-white">{selectedRequest.reviewedBy}</span> on{" "}
                      {selectedRequest.reviewedAt && formatDate(selectedRequest.reviewedAt)}
                    </p>
                    {selectedRequest.notes && (
                      <p className="text-white/60 mt-2 p-2 bg-white/5 rounded text-sm">
                        {selectedRequest.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="border-white/10">
                Close
              </Button>
              {selectedRequest?.status === "pending" && (
                <>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setShowDetailDialog(false)
                      openActionDialog(selectedRequest, "approve")
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailDialog(false)
                      openActionDialog(selectedRequest, "reject")
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {actionType === "approve" ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                {actionType === "approve" ? "Approve" : "Reject"} Request
              </DialogTitle>
              <DialogDescription className="text-white/60">
                {actionType === "approve"
                  ? "This will approve the request and notify the employee."
                  : "This will reject the request. Please provide a reason."}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-2">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedRequest.type)}
                    <span className="text-white font-medium">
                      {getTypeLabel(selectedRequest.type)}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    From: {selectedRequest.employeeName}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{actionType === "approve" ? "Notes (optional)" : "Rejection Reason *"}</Label>
                  <Textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder={
                      actionType === "approve"
                        ? "Add any notes for the employee..."
                        : "Please explain why this request is being rejected..."
                    }
                    className="bg-white/5 border-white/10 min-h-[100px]"
                    data-testid="action-notes-input"
                  />
                </div>

                {actionType === "approve" && selectedRequest.type === "salary_advance" && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-300">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    This will authorize R {selectedRequest.data.amount?.toLocaleString()} to be advanced to{" "}
                    {selectedRequest.employeeName}.
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowActionDialog(false)}
                className="border-white/10"
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={processing || (actionType === "reject" && !actionNotes.trim())}
                className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                data-testid="confirm-action-btn"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : actionType === "approve" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                {actionType === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
