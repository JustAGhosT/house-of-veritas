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
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"

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

      const data = await apiFetch<{ requests?: KioskRequest[]; summary?: Summary | null }>(
        `/api/kiosk/requests?${params}`,
        { label: "KioskRequests" }
      )
      setRequests(data?.requests || [])
      setSummary(data?.summary ?? null)
    } catch (error) {
      logger.error("Failed to fetch requests", {
        error: error instanceof Error ? error.message : String(error),
      })
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
      await apiFetch("/api/kiosk/requests", {
        method: "PATCH",
        body: {
          requestId: selectedRequest.id,
          status: actionType === "approve" ? "approved" : "rejected",
          reviewedBy: "hans",
          notes: actionNotes,
        },
        label: "UpdateKioskRequest",
      })
      await fetchRequests()
      setShowActionDialog(false)
      setShowDetailDialog(false)
      setActionNotes("")
      setSelectedRequest(null)
    } catch (error) {
      logger.error("Failed to update request", {
        error: error instanceof Error ? error.message : String(error),
      })
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
      return (
        <Badge variant="destructive" className="ml-2">
          Urgent
        </Badge>
      )
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
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
              <CheckSquare className="h-8 w-8 text-blue-400" />
              Approval Center
              {pendingCount > 0 && (
                <Badge className="bg-yellow-500 text-lg">{pendingCount} pending</Badge>
              )}
            </h1>
            <p className="mt-1 text-white/60">Review and approve employee requests</p>
          </div>
          <Button variant="outline" onClick={() => fetchRequests()} className="border-white/10">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-yellow-500/20 p-3">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Pending</p>
                    <p className="text-2xl font-bold text-white">{summary.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-blue-500/20 p-3">
                    <ShoppingCart className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Stock Orders</p>
                    <p className="text-2xl font-bold text-white">{summary.byType.stock_order}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-yellow-500/20 p-3">
                    <Banknote className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Advances</p>
                    <p className="text-2xl font-bold text-white">{summary.byType.salary_advance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-rose-500/20 p-3">
                    <Wrench className="h-6 w-6 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Issues</p>
                    <p className="text-2xl font-bold text-white">{summary.byType.issue_report}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="border-white/10 bg-white/5">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  placeholder="Search by employee, item, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-white/10 bg-white/5 pl-10"
                  data-testid="approval-search-input"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full border-white/10 bg-white/5 sm:w-[180px]">
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
                <SelectTrigger className="w-full border-white/10 bg-white/5 sm:w-[150px]">
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
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="border-white/10 bg-white/5">
            <CardContent className="py-12 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
              <p className="text-lg text-white">No requests to review</p>
              <p className="mt-1 text-white/60">All caught up! No pending approvals.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card
                key={request.id}
                className={`border-white/10 bg-white/5 transition-colors hover:bg-white/[0.07] ${
                  request.status === "pending" ? "border-l-4 border-l-yellow-500" : ""
                }`}
                data-testid={`request-card-${request.id}`}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    {/* Request Info */}
                    <div className="flex flex-1 items-start gap-4">
                      <div className="rounded-xl bg-white/5 p-3">{getTypeIcon(request.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-white">
                            {getTypeLabel(request.type)}
                          </span>
                          {getStatusBadge(request.status)}
                          {request.data?.urgency && getUrgencyBadge(request.data.urgency)}
                          {request.data?.issueType === "safety" && (
                            <Badge variant="destructive" className="ml-1">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Safety
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-white/60">
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
                        <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
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
                          <div className="mt-2 rounded bg-white/5 p-2 text-sm text-white/60">
                            <span className="text-white/40">Note:</span> {request.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 lg:shrink-0">
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
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openActionDialog(request, "reject")}
                            data-testid={`reject-${request.id}`}
                          >
                            <X className="mr-1 h-4 w-4" />
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
          <DialogContent className="max-w-lg border-white/10 bg-[#0d0d12] text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedRequest && getTypeIcon(selectedRequest.type)}
                {selectedRequest && getTypeLabel(selectedRequest.type)} Details
              </DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                {/* Employee Info */}
                <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedRequest.employeeName}</p>
                    <p className="text-sm text-white/60">{formatDate(selectedRequest.timestamp)}</p>
                  </div>
                  <div className="ml-auto">{getStatusBadge(selectedRequest.status)}</div>
                </div>

                {/* Request Details */}
                <div className="space-y-3">
                  {selectedRequest.type === "stock_order" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/60">Item</span>
                        <span className="font-medium text-white">
                          {selectedRequest.data.itemName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Quantity</span>
                        <span className="text-white">{selectedRequest.data.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Urgency</span>
                        <span className="text-white capitalize">
                          {selectedRequest.data.urgency}
                        </span>
                      </div>
                      {selectedRequest.data.notes && (
                        <div>
                          <span className="mb-1 block text-white/60">Notes</span>
                          <p className="rounded bg-white/5 p-2 text-white">
                            {selectedRequest.data.notes}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {selectedRequest.type === "salary_advance" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/60">Amount</span>
                        <span className="text-xl font-medium text-white">
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
                        <span className="mb-1 block text-white/60">Reason</span>
                        <p className="rounded bg-white/5 p-2 text-white">
                          {selectedRequest.data.reason}
                        </p>
                      </div>
                    </>
                  )}

                  {selectedRequest.type === "issue_report" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-white/60">Asset</span>
                        <span className="font-medium text-white">
                          {selectedRequest.data.assetName}
                        </span>
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
                        <span className="mb-1 block text-white/60">Description</span>
                        <p className="rounded bg-white/5 p-2 text-white">
                          {selectedRequest.data.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Review Info */}
                {selectedRequest.reviewedBy && (
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm text-white/40">
                      {selectedRequest.status === "approved" ? "Approved" : "Rejected"} by{" "}
                      <span className="text-white">{selectedRequest.reviewedBy}</span> on{" "}
                      {selectedRequest.reviewedAt && formatDate(selectedRequest.reviewedAt)}
                    </p>
                    {selectedRequest.notes && (
                      <p className="mt-2 rounded bg-white/5 p-2 text-sm text-white/60">
                        {selectedRequest.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDetailDialog(false)}
                className="border-white/10"
              >
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
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailDialog(false)
                      openActionDialog(selectedRequest, "reject")
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent className="max-w-md border-white/10 bg-[#0d0d12] text-white">
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
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedRequest.type)}
                    <span className="font-medium text-white">
                      {getTypeLabel(selectedRequest.type)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/60">From: {selectedRequest.employeeName}</p>
                </div>

                <div className="space-y-2">
                  <Label>
                    {actionType === "approve" ? "Notes (optional)" : "Rejection Reason *"}
                  </Label>
                  <Textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder={
                      actionType === "approve"
                        ? "Add any notes for the employee..."
                        : "Please explain why this request is being rejected..."
                    }
                    className="min-h-[100px] border-white/10 bg-white/5"
                    data-testid="action-notes-input"
                  />
                </div>

                {actionType === "approve" && selectedRequest.type === "salary_advance" && (
                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
                    <AlertTriangle className="mr-2 inline h-4 w-4" />
                    This will authorize R {selectedRequest.data.amount?.toLocaleString()} to be
                    advanced to {selectedRequest.employeeName}.
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
                className={
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
                data-testid="confirm-action-btn"
              >
                {processing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : actionType === "approve" ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
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
