"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  FolderKanban,
  Plus,
  Users,
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ImagePlus,
  Check,
  X,
} from "lucide-react"
import { AiSuggestIcon } from "@/components/ui/ai-suggest-icon"
import type { Project } from "@/lib/projects"
import type { ProjectSuggestion } from "@/app/api/projects/suggestions/route"
import { logger } from "@/lib/logger"

const PERSONA_INFO: Record<string, string> = {
  hans: "Hans",
  charl: "Charl",
  lucky: "Lucky",
  irma: "Irma",
}

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-gray-500/20 text-gray-400",
  in_progress: "bg-blue-500/20 text-blue-400",
  on_hold: "bg-amber-500/20 text-amber-400",
  completed: "bg-green-500/20 text-green-400",
}

interface ProjectsPageContentProps {
  persona: "hans" | "charl" | "lucky" | "irma"
  isAdmin: boolean
}

export function ProjectsPageContent({ persona, isAdmin }: ProjectsPageContentProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false)
  const [expandedMajor, setExpandedMajor] = useState<Set<string>>(new Set())
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [refineLoading, setRefineLoading] = useState(false)
  const [suggestMemberLoading, setSuggestMemberLoading] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "subproject" as "major" | "subproject",
    parentId: "",
    status: "planned",
  })

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects")
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (error) {
      logger.error("Failed to fetch projects", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSuggestions = useCallback(async () => {
    if (!isAdmin) return
    try {
      const res = await fetch("/api/projects/suggestions?status=pending")
      const data = await res.json()
      setSuggestions(data.suggestions || [])
    } catch {
      setSuggestions([])
    }
  }, [isAdmin])

  useEffect(() => {
    fetchProjects()
    fetchSuggestions()
  }, [fetchProjects, fetchSuggestions])

  const majorProjects = projects.filter((p) => p.type === "major")
  const subprojects = projects.filter((p) => p.type === "subproject")

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPhotoPreview(result)
      const base64 = result.includes(",") ? result.split(",")[1] : result
      setPhotoBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSuggestFromPhoto = async () => {
    if (!photoBase64) return
    setAiLoading(true)
    try {
      const res = await fetch("/api/ai/suggest-project-from-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: photoBase64 }),
      })
      const data = await res.json()
      if (data.suggested) {
        setFormData((p) => ({
          ...p,
          name: data.suggested.name,
          description: data.suggested.description || p.description,
        }))
      }
    } catch (error) {
      logger.error("AI suggest from photo failed", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setAiLoading(false)
    }
  }

  const handleRefineDescription = async () => {
    if (!formData.name) return
    setRefineLoading(true)
    try {
      const res = await fetch("/api/ai/refine-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.name,
          description: formData.description,
          context: `Project type: ${formData.type}, Parent: ${formData.parentId || "none"}`,
        }),
      })
      const data = await res.json()
      if (data.refined) {
        setFormData((p) => ({ ...p, description: data.refined }))
      }
    } catch (error) {
      logger.error("Refine description failed", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setRefineLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parentId: formData.type === "subproject" ? formData.parentId || undefined : undefined,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        resetForm()
        fetchProjects()
      }
    } catch (error) {
      logger.error("Failed to create project", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/projects/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          parentId: formData.type === "subproject" ? formData.parentId || undefined : undefined,
        }),
      })
      if (res.ok) {
        setSuggestDialogOpen(false)
        resetForm()
        fetchSuggestions()
      }
    } catch (error) {
      logger.error("Failed to suggest project", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handleApproveSuggestion = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })
      if (res.ok) {
        fetchSuggestions()
        fetchProjects()
      }
    } catch (error) {
      logger.error("Failed to approve", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handleRejectSuggestion = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })
      if (res.ok) fetchSuggestions()
    } catch (error) {
      logger.error("Failed to reject", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", type: "subproject", parentId: "", status: "planned" })
    setPhotoPreview(null)
    setPhotoBase64(null)
  }

  const handleSuggestMember = async (projectId: string, projectName: string) => {
    setSuggestMemberLoading(projectId)
    try {
      const res = await fetch("/api/ai/suggest-project-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, projectName }),
      })
      const data = await res.json()
      if (data.suggested) {
        await handleAddMember(projectId, data.suggested, "contributor")
      }
    } catch (error) {
      logger.error("Suggest member failed", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setSuggestMemberLoading(null)
    }
  }

  const handleAddMember = async (projectId: string, userId: string, role: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      })
      if (res.ok) fetchProjects()
    } catch (error) {
      logger.error("Failed to add member", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const formFields = (
    <>
      <div className="rounded-lg border border-dashed border-white/20 p-4 space-y-2">
        <Label className="text-white/80">Suggest from photo (AI)</Label>
        <div className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/20"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Upload photo
          </Button>
          {photoPreview && (
            <Button
              type="button"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSuggestFromPhoto}
              disabled={aiLoading}
            >
              <AiSuggestIcon loading={aiLoading} size="md" className="mr-2" />
              AI suggest
            </Button>
          )}
        </div>
        {photoPreview && (
          <div className="mt-2 relative w-24 h-24 rounded overflow-hidden bg-white/5">
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <div>
        <Label>Type</Label>
        <Select
          value={formData.type}
          onValueChange={(v) => setFormData((p) => ({ ...p, type: v as "major" | "subproject" }))}
        >
          <SelectTrigger className="bg-white/5 border-white/10 mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="major">Major Project</SelectItem>
            <SelectItem value="subproject">Subproject (Work Package)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.type === "subproject" && (
        <div>
          <Label>Parent Project</Label>
          <Select
            value={formData.parentId}
            onValueChange={(v) => setFormData((p) => ({ ...p, parentId: v }))}
          >
            <SelectTrigger className="bg-white/5 border-white/10 mt-1">
              <SelectValue placeholder="Select parent" />
            </SelectTrigger>
            <SelectContent>
              {majorProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
          className="bg-white/5 border-white/10 mt-1"
          placeholder="e.g. Kitchen Cupboards"
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
            disabled={refineLoading || !formData.name}
          >
            <AiSuggestIcon loading={refineLoading} size="sm" className="mr-1" />
            Refine with AI
          </Button>
        </div>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          className="bg-white/5 border-white/10 mt-1"
          rows={2}
        />
      </div>
      {isAdmin && (
        <div>
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
          >
            <SelectTrigger className="bg-white/5 border-white/10 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="h-8 w-8 text-blue-400" />
            Projects
          </h1>
          <p className="text-white/60 mt-1">
            {isAdmin
              ? "Major projects and subprojects (House Revamp, Zeerust Arming, etc.)"
              : "View projects and suggest new ones"}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Project</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Create a major project or subproject. Use a photo for AI suggestions.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 mt-4">
                  {formFields}
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={suggestDialogOpen} onOpenChange={(o) => { setSuggestDialogOpen(o); if (!o) resetForm() }}>
            <DialogTrigger asChild>
              <Button variant={isAdmin ? "outline" : "default"} className={!isAdmin ? "bg-blue-600 hover:bg-blue-700" : "border-white/20"}>
                <Sparkles className="h-4 w-4 mr-2" />
                Suggest Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0d0d12] border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Suggest a Project</DialogTitle>
                <DialogDescription className="text-white/60">
                  Propose a new project or subproject. Admins will review and approve.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSuggest} className="space-y-4 mt-4">
                {formFields}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setSuggestDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Submit suggestion
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isAdmin && suggestions.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-amber-400">Pending suggestions</CardTitle>
            <CardDescription className="text-white/60">
              {suggestions.length} project suggestion{suggestions.length !== 1 ? "s" : ""} awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div>
                  <p className="text-white font-medium">{s.name}</p>
                  {s.description && <p className="text-white/60 text-sm mt-1">{s.description}</p>}
                  <p className="text-white/40 text-xs mt-1">
                    Suggested by {PERSONA_INFO[s.suggestedBy] || s.suggestedBy}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveSuggestion(s.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500/50 text-red-400" onClick={() => handleRejectSuggestion(s.id)}>
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white/40" />
        </div>
      ) : (
        <div className="space-y-4">
          {majorProjects.map((major) => {
            const subs = subprojects.filter((s) => s.parentId === major.id)
            const isExpanded = expandedMajor.has(major.id)

            return (
              <Card key={major.id} className="bg-white/5 border-white/10">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedMajor((prev) => {
                      const next = new Set(prev)
                      if (next.has(major.id)) next.delete(major.id)
                      else next.add(major.id)
                      return next
                    })
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {subs.length > 0 ? (
                        isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-white/60" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-white/60" />
                        )
                      ) : null}
                      <CardTitle className="text-white">{major.name}</CardTitle>
                      <Badge className={STATUS_COLORS[major.status] || STATUS_COLORS.planned}>
                        {major.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <span className="text-white/50 text-sm">{subs.length} subprojects</span>
                  </div>
                  {major.description && (
                    <CardDescription className="text-white/60">{major.description}</CardDescription>
                  )}
                </CardHeader>
                {isExpanded && subs.length > 0 && (
                  <CardContent className="pt-0 space-y-2">
                    {subs.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div>
                          <p className="text-white font-medium">{sub.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={STATUS_COLORS[sub.status] || STATUS_COLORS.planned} variant="outline">
                              {sub.status.replace("_", " ")}
                            </Badge>
                            {sub.members?.length ? (
                              <span className="text-white/50 text-sm flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {sub.members.map((m) => PERSONA_INFO[m.userId] || m.userId).join(", ")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {isAdmin && (() => {
                          const available = ["hans", "charl", "lucky", "irma"].filter(
                            (id) => !sub.members?.some((m) => m.userId === id)
                          )
                          if (available.length === 0) return <span className="text-white/40 text-sm">All assigned</span>
                          const loading = suggestMemberLoading === sub.id
                          return (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-400 hover:text-blue-300"
                                onClick={() => handleSuggestMember(sub.id, sub.name)}
                                disabled={loading}
                              >
                                <AiSuggestIcon loading={loading} size="md" />
                              </Button>
                              <Select onValueChange={(v) => handleAddMember(sub.id, v, "contributor")}>
                                <SelectTrigger className="w-36 bg-white/5 border-white/10">
                                  <SelectValue placeholder="Add member" />
                                </SelectTrigger>
                                <SelectContent>
                                  {available.map((id) => (
                                    <SelectItem key={id} value={id}>
                                      Add {PERSONA_INFO[id]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )
                        })()}
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
