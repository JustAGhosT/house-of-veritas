"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, RefreshCw, Loader2, ExternalLink } from "lucide-react"
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"

interface Document {
  id: number
  name: string
  type: string
  status: string
  lastReview: string
  nextReview: string
  expiryDays: number
  responsible: string
  signatories: string[]
  signedBy: string[]
  urgency: string
}

interface DocumentsPageProps {
  personaId: string
  personaName: string
  title?: string
}

export function DocumentsPage({ personaId, personaName, title = "Documents" }: DocumentsPageProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await apiFetch<Document[] | { documents?: Document[] }>("/api/documents", { label: "Documents" })
      const docs = Array.isArray(data) ? data : (data as { documents?: Document[] })?.documents || []
      const relevant = docs.filter(
        (d) =>
          d.signatories?.includes(personaName) ||
          d.responsible === personaName ||
          d.signedBy?.includes(personaName)
      )
      setDocuments(relevant.length ? relevant : docs)
    } catch (error) {
      logger.error("Failed to fetch documents", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [personaName])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const getUrgencyColor = (u: string) => {
    if (u === "red" || u === "orange") return "bg-red-500/20 text-red-400"
    if (u === "yellow") return "bg-amber-500/20 text-amber-400"
    return "bg-green-500/20 text-green-400"
  }

  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "-")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <FileText className="h-7 w-7" />
          {title}
        </h1>
        <p className="text-white/60 mt-1">Documents you are responsible for or have signed</p>
      </div>

      <Card className="bg-[#0d0d12]/80 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Document List</CardTitle>
          <CardDescription className="text-white/60">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-white/50 text-center py-8">No documents found.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/7 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="border-white/20 text-white/60">
                        {doc.type}
                      </Badge>
                      <Badge className={getUrgencyColor(doc.urgency)}>{doc.status}</Badge>
                      <span className="text-white/40 text-sm">
                        Next review: {formatDate(doc.nextReview)}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-white/30 shrink-0" />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button variant="outline" className="border-white/10" onClick={fetchDocuments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
