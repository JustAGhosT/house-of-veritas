"use client"

import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PlaceholderPageProps {
  title: string
  description?: string
  icon?: LucideIcon
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <Card className="border-white/10 bg-[#0d0d12]/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {Icon && <Icon className="h-6 w-6" />}
          {title}
        </CardTitle>
        <CardDescription className="text-white/60">
          {description ?? "This page is coming soon."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-white/40">Content will be available in a future release.</p>
      </CardContent>
    </Card>
  )
}
