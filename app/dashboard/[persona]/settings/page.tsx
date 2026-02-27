"use client"

import { SettingsPageContent } from "@/app/dashboard/hans/settings/settings-content"
import { useParams } from "next/navigation"
import { Suspense } from "react"

function PersonaSettingsContent() {
  const params = useParams()
  const persona = params?.persona as string

  if (!persona || !["hans", "charl", "lucky", "irma"].includes(persona)) {
    return null
  }

  return <SettingsPageContent persona={persona as "hans" | "charl" | "lucky" | "irma"} />
}

export default function PersonaSettingsPage() {
  return (
    <Suspense fallback={null}>
      <PersonaSettingsContent />
    </Suspense>
  )
}
