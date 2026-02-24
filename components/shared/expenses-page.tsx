"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { DollarSign, RefreshCw, Loader2, Plus, Sparkles } from "lucide-react"
import { AiSuggestIcon } from "@/components/ui/ai-suggest-icon"
import { logger } from "@/lib/logger"
import { apiFetch, apiFetchSafe } from "@/lib/api-client"

const EXPENSE_CATEGORIES = ["Materials", "Supplies", "Fuel", "Tools", "Services", "Maintenance", "Other"]

interface Expense {
  id: number
  category: string
  amount: number
  vendor?: string
  date: string
  approvalStatus: string
  requesterName?: string
}

interface ExpensesPageProps {
  personaId: string
  title?: string
  showAll?: boolean
}

export function ExpensesPage({ personaId, title = "Expenses", showAll = false }: ExpensesPageProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<{ total: number; pending: number; approved: number; totalAmount: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [formData, setFormData] = useState({
    category: "Supplies",
    amount: "",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
    project: "",
    notes: "",
  })
  const [projectOptions, setProjectOptions] = useState<string[]>([])

  const fetchExpenses = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (!showAll) params.set("personaId", personaId)
      const data = await apiFetch<{ expenses?: Expense[]; summary?: { total: number; pending: number; approved: number; totalAmount: number } | null }>(`/api/expenses?${params}`, { label: "Expenses" })
      setExpenses(data?.expenses || [])
      setSummary(data?.summary || null)
    } catch (error) {
      logger.error("Failed to fetch expenses", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [personaId, showAll])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  useEffect(() => {
    apiFetchSafe<{ projects?: { name: string }[] }>("/api/projects", { projects: [] }, { label: "Projects" })
      .then((d) => setProjectOptions((d?.projects || []).map((p) => p.name)))
  }, [])

  const getStatusColor = (s: string) => {
    if (s === "Approved") return "bg-green-500/20 text-green-400"
    if (s === "Rejected") return "bg-red-500/20 text-red-400"
    return "bg-amber-500/20 text-amber-400"
  }

  const handleSuggestCategory = async () => {
    setSuggesting(true)
    try {
      const data = await apiFetchSafe<{ suggested?: string }>(
        "/api/ai/suggest-expense-category",
        {},
        { method: "POST", body: { vendor: formData.vendor, description: formData.notes }, label: "AI Suggest" }
      )
      if (data?.suggested) setFormData((p) => ({ ...p, category: data.suggested ?? p.category }))
    } finally {
      setSuggesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount) return
    setSubmitting(true)
    try {
      await apiFetch("/api/expenses", {
        method: "POST",
        body: {
          personaId,
          category: formData.category,
          amount: parseFloat(formData.amount),
          vendor: formData.vendor || undefined,
          date: formData.date,
          project: formData.project || undefined,
          notes: formData.notes || undefined,
        },
        label: "Expenses",
      })
      setAddOpen(false)
      setFormData({ category: "Supplies", amount: "", vendor: "", date: new Date().toISOString().split("T")[0], project: "", notes: "" })
      fetchExpenses()
    } catch (error) {
      logger.error("Failed to submit expense", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <DollarSign className="h-7 w-7" />
            {title}
          </h1>
          <p className="text-white/60 mt-1">
            {showAll ? "All expenses" : "Your expense requests"}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription className="text-white/60">
                Submit an expense for approval.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Category</Label>
                <div className="flex gap-2 mt-1">
                  <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                    <SelectTrigger className="flex-1 bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategory} disabled={suggesting} className="shrink-0 border-white/10" title="Suggest category with AI">
                    <AiSuggestIcon loading={suggesting} size="md" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Amount (R)</Label>
                <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))} className="bg-white/5 border-white/10 mt-1" required />
              </div>
              <div>
                <Label>Vendor</Label>
                <Input value={formData.vendor} onChange={(e) => setFormData((p) => ({ ...p, vendor: e.target.value }))} className="bg-white/5 border-white/10 mt-1" placeholder="Optional" />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} className="bg-white/5 border-white/10 mt-1" />
              </div>
              <div>
                <Label>Project (optional)</Label>
                <Select value={formData.project || "_none"} onValueChange={(v) => setFormData((p) => ({ ...p, project: v === "_none" ? "" : v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">None</SelectItem>
                    {projectOptions.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} className="bg-white/5 border-white/10 mt-1" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting || !formData.amount} className="bg-blue-600 hover:bg-blue-700">
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-white/50 text-sm">Total Amount</p>
              <p className="text-2xl font-semibold text-white">R{summary.totalAmount?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-amber-400/80 text-sm">Pending</p>
              <p className="text-2xl font-semibold text-amber-400">{summary.pending}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-green-400/80 text-sm">Approved</p>
              <p className="text-2xl font-semibold text-green-400">{summary.approved}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-[#0d0d12]/80 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Expense List</CardTitle>
          <CardDescription className="text-white/60">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-white/50 text-center py-8">No expenses found.</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div>
                    <p className="text-white font-medium">{e.category}</p>
                    <p className="text-white/50 text-sm">
                      {e.date} · {e.vendor || "-"}
                      {e.requesterName && showAll && ` · ${e.requesterName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">R{e.amount?.toLocaleString()}</span>
                    <Badge className={getStatusColor(e.approvalStatus)}>{e.approvalStatus}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button variant="outline" className="border-white/10" onClick={fetchExpenses}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
