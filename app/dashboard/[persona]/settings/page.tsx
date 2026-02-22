"use client"

import { useParams } from "next/navigation"
import { SettingsPageContent } from "@/app/dashboard/hans/settings/settings-content"

export default function PersonaSettingsPage() {
  const params = useParams()
  const persona = params?.persona as string

  if (!persona || !["hans", "charl", "lucky", "irma"].includes(persona)) {
    return null
  }

  return <SettingsPageContent persona={persona as "hans" | "charl" | "lucky" | "irma"} />
}
