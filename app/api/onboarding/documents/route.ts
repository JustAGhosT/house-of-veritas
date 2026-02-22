import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { getTemplates } from "@/lib/services/docuseal"
import { createSubmission } from "@/lib/services/docuseal"
import { getUserWithManagement } from "@/lib/user-management"

const ONBOARDING_TEMPLATES_BY_ROLE: Record<string, string[]> = {
  admin: ["tpl_popia_consent"],
  operator: ["tpl_employment_contract", "tpl_popia_consent"],
  employee: ["tpl_employment_contract", "tpl_popia_consent"],
  resident: ["tpl_house_rules", "tpl_popia_consent"],
}

export const GET = withAuth(async (request, context) => {
  try {
    const user = await getUserWithManagement(context.userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const templateIds = ONBOARDING_TEMPLATES_BY_ROLE[user.role] || ONBOARDING_TEMPLATES_BY_ROLE.resident
    const templates = await getTemplates()
    const docs = templateIds
      .map((id) => templates.find((t) => t.id === id))
      .filter(Boolean)
      .map((t) => ({ id: t!.id, name: t!.name }))

    return NextResponse.json({ documents: docs })
  } catch (err) {
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 })
  }
})

export const POST = withAuth(async (request, context) => {
  try {
    const body = await request.json()
    const { templateId } = body

    if (!templateId) {
      return NextResponse.json({ error: "templateId required" }, { status: 400 })
    }

    const user = await getUserWithManagement(context.userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const submission = await createSubmission({
      templateId,
      recipients: [
        { email: user.email, name: user.name, role: "signer" },
      ],
      metadata: { userId: context.userId, onboarding: true },
    })

    if (!submission) {
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
    }

    return NextResponse.json({
      submissionId: submission.id,
      status: submission.status,
      message: "Signature request created. Check your email for the signing link, or use the DocuSeal portal.",
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create signature request" }, { status: 500 })
  }
})
