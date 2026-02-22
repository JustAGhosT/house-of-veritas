"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ClipboardList,
  CheckCircle,
  Circle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronRight,
  Plus,
  Sparkles,
} from "lucide-react"
import { AiSuggestIcon } from "@/components/ui/ai-suggest-icon"
import { logger } from "@/lib/logger"

interface Task {
  id: number
  title: string
  description?: string
  assignedTo?: number
  assignedToName?: string
  dueDate?: string
  priority: string
  status: string
  project?: string
}

interface TasksPageProps {
  personaId: string
  title?: string
  showAll?: boolean
  canAddTask?: boolean
}

const PERSONA_OPTIONS = [
  { id: "hans", name: "Hans" },
  { id: "charl", name: "Charl" },
  { id: "lucky", name: "Lucky" },
  { id: "irma", name: "Irma" },
]
const PERSONA_TO_ID: Record<string, number> = { hans: 1, charl: 2, lucky: 3, irma: 4 }

export function TasksPage({ personaId, title = "Tasks", showAll = false, canAddTask = false }: TasksPageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [summary, setSummary] = useState<{ total: number; completed: number; inProgress: number; notStarted: number; overdue: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [projectOptions, setProjectOptions] = useState<string[]>([])
  const [refineLoading, setRefineLoading] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    project: "",
    priority: "Medium",
    assignee: "",
    dueDate: "",
  })

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (!showAll) params.set("assignee", personaId)
      const res = await fetch(`/api/tasks?${params}`)
      const data = await res.json()
      setTasks(data.tasks || [])
      setSummary(data.summary || null)
    } catch (error) {
      logger.error("Failed to fetch tasks", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [personaId, showAll])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if (!canAddTask) return
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setProjectOptions((d?.projects || []).map((p: { name: string }) => p.name)))
      .catch(() => setProjectOptions([]))
  }, [canAddTask])

  const handleRefineDescription = async () => {
    if (!taskForm.title) return
    setRefineLoading(true)
    try {
      const res = await fetch("/api/ai/refine-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          context: `Task for project: ${taskForm.project || "general"}`,
        }),
      })
      const data = await res.json()
      if (data.refined) setTaskForm((p) => ({ ...p, description: data.refined }))
    } catch (error) {
      logger.error("Refine task description failed", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setRefineLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description || undefined,
          project: taskForm.project || undefined,
          priority: taskForm.priority,
          assignedTo: taskForm.assignee ? PERSONA_TO_ID[taskForm.assignee] : undefined,
          dueDate: taskForm.dueDate || undefined,
        }),
      })
      if (res.ok) {
        setAddOpen(false)
        setTaskForm({ title: "", description: "", project: "", priority: "Medium", assignee: "", dueDate: "" })
        fetchTasks()
      }
    } catch (error) {
      logger.error("Failed to create task", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === "Completed") return <CheckCircle className="h-5 w-5 text-green-400" />
    if (status === "In Progress") return <AlertCircle className="h-5 w-5 text-amber-400" />
    return <Circle className="h-5 w-5 text-white/40" />
  }

  const getPriorityColor = (p: string) => {
    if (p === "High" || p === "Urgent") return "bg-red-500/20 text-red-400"
    if (p === "Medium") return "bg-amber-500/20 text-amber-400"
    return "bg-green-500/20 text-green-400"
  }

  const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "-")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <ClipboardList className="h-7 w-7" />
            {title}
          </h1>
          <p className="text-white/60 mt-1">
            {showAll ? "All tasks across the estate" : "Your assigned tasks"}
          </p>
        </div>
        {canAddTask && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Add Task</DialogTitle>
                <DialogDescription className="text-white/60">
                  Create a task. Use AI to refine the description.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={taskForm.title}
                    onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
                    className="bg-white/5 border-white/10 mt-1"
                    placeholder="e.g. Repair gate motor"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Description (optional)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 h-7"
                      onClick={handleRefineDescription}
                      disabled={refineLoading || !taskForm.title}
                    >
                      <AiSuggestIcon loading={refineLoading} size="sm" className="mr-1" />
                      Refine with AI
                    </Button>
                  </div>
                  <Textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
                    className="bg-white/5 border-white/10 mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Project</Label>
                  <Select value={taskForm.project || "_none"} onValueChange={(v) => setTaskForm((p) => ({ ...p, project: v === "_none" ? "" : v }))}>
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
                  <Label>Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(v) => setTaskForm((p) => ({ ...p, priority: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assign to</Label>
                  <Select value={taskForm.assignee || "_none"} onValueChange={(v) => setTaskForm((p) => ({ ...p, assignee: v === "_none" ? "" : v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Unassigned</SelectItem>
                      {PERSONA_OPTIONS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Due date (optional)</Label>
                  <Input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))}
                    className="bg-white/5 border-white/10 mt-1"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-white/50 text-sm">Total</p>
              <p className="text-2xl font-semibold text-white">{summary.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-green-400/80 text-sm">Completed</p>
              <p className="text-2xl font-semibold text-green-400">{summary.completed}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-amber-400/80 text-sm">In Progress</p>
              <p className="text-2xl font-semibold text-amber-400">{summary.inProgress}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-white/60 text-sm">Not Started</p>
              <p className="text-2xl font-semibold text-white">{summary.notStarted}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-red-400/80 text-sm">Overdue</p>
              <p className="text-2xl font-semibold text-red-400">{summary.overdue}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-[#0d0d12]/80 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Task List</CardTitle>
          <CardDescription className="text-white/60">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-white/50 text-center py-8">No tasks found.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/7 transition-colors"
                >
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      <Badge variant="outline" className="border-white/20 text-white/60">
                        {task.status}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-white/40 text-sm">
                          Due {formatDate(task.dueDate)}
                        </span>
                      )}
                      {task.assignedToName && showAll && (
                        <span className="text-white/40 text-sm">{task.assignedToName}</span>
                      )}
                      {task.project && (
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400/80 text-xs">
                          {task.project}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/30 shrink-0" />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button variant="outline" className="border-white/10" onClick={fetchTasks}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
