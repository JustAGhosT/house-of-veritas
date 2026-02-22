/**
 * Azure AI Foundry / Azure OpenAI integration for AI-assisted suggestions.
 * Uses OpenAI-compatible chat completions API.
 */

import { logger } from "@/lib/logger"

const AZURE_AI_ENDPOINT = process.env.AZURE_AI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT
const AZURE_AI_KEY = process.env.AZURE_AI_KEY || process.env.AZURE_OPENAI_API_KEY
const AZURE_AI_DEPLOYMENT = process.env.AZURE_AI_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini"

export function isAzureAIConfigured(): boolean {
  return !!(AZURE_AI_ENDPOINT && AZURE_AI_KEY)
}

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

async function chatCompletion(messages: ChatMessage[]): Promise<string | null> {
  if (!isAzureAIConfigured()) return null

  const url = `${AZURE_AI_ENDPOINT!.replace(/\/$/, "")}/openai/deployments/${AZURE_AI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_AI_KEY!,
      },
      body: JSON.stringify({
        messages,
        max_tokens: 150,
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      logger.error("Azure AI request failed", { status: res.status, statusText: res.statusText })
      return null
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim()
    return content || null
  } catch (err) {
    logger.error("Azure AI error", { error: err instanceof Error ? err.message : String(err) })
    return null
  }
}

/**
 * Suggest a storage location for an asset based on its description and category.
 * Returns one of the provided options or null if AI is unavailable.
 */
export async function suggestStorageLocation(params: {
  name: string
  description?: string
  category?: string
  options: string[]
}): Promise<string | null> {
  const { name, description, category, options } = params
  if (options.length === 0) return null

  const systemPrompt = `You are an estate asset manager. Given an asset's name, description, and category, suggest the most appropriate storage location from the provided list. Reply with ONLY the exact option text, nothing else.`

  const userPrompt = `Asset: ${name}
${description ? `Description: ${description}` : ""}
${category ? `Category: ${category}` : ""}

Available storage options: ${options.join(", ")}

Return exactly one option from the list:`

  const result = await chatCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ])

  if (!result) return null

  const normalized = result.trim().toLowerCase()
  const match = options.find((o) => o.toLowerCase() === normalized || normalized.includes(o.toLowerCase()))
  return match || options[0]
}

/**
 * Suggest an asset category from a list of options.
 */
export async function suggestAssetCategory(params: {
  name: string
  description?: string
  options: string[]
}): Promise<string | null> {
  const { name, description, options } = params
  if (options.length === 0) return null

  const systemPrompt = `You are an estate asset manager. Given an asset's name and description, suggest the most appropriate category from the provided list. Reply with ONLY the exact option key (e.g. workshop_tools), nothing else.`

  const userPrompt = `Asset: ${name}
${description ? `Description: ${description}` : ""}

Available categories: ${options.join(", ")}

Return exactly one category key:`

  const result = await chatCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ])

  if (!result) return null

  const normalized = result.trim().toLowerCase().replace(/\s+/g, "_")
  const match = options.find((o) => o.toLowerCase() === normalized || normalized.includes(o.toLowerCase()))
  return match || options[0]
}

async function suggestFromOptions(params: {
  context: string
  options: string[]
  systemHint?: string
}): Promise<string | null> {
  const { context, options, systemHint } = params
  if (options.length === 0) return null

  const systemPrompt = systemHint || `Given the context, suggest the most appropriate option from the list. Reply with ONLY the exact option text, nothing else.`
  const userPrompt = `${context}\n\nAvailable options: ${options.join(", ")}\n\nReturn exactly one option:`

  const result = await chatCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ])

  if (!result) return null
  const normalized = result.trim().toLowerCase()
  const match = options.find((o) => o.toLowerCase() === normalized || normalized.includes(o.toLowerCase()))
  return match || options[0]
}

export async function suggestProject(params: {
  taskTitle?: string
  taskDescription?: string
  expenseCategory?: string
  options: string[]
}): Promise<string | null> {
  const ctx = [
    params.taskTitle && `Task: ${params.taskTitle}`,
    params.taskDescription && `Description: ${params.taskDescription}`,
    params.expenseCategory && `Expense category: ${params.expenseCategory}`,
  ].filter(Boolean).join("\n")
  return suggestFromOptions({
    context: ctx || "General work",
    options: params.options,
    systemHint: "You are an estate project manager. Suggest the most relevant project/subproject for this work.",
  })
}

export async function suggestAssignee(params: {
  taskTitle: string
  taskDescription?: string
  projectName?: string
  options: string[]
  userDetails?: Array<{ id: string; name?: string; responsibilities?: string[]; specialty?: string[] }>
}): Promise<string | null> {
  const { userDetails, options } = params
  const ctx = `Task: ${params.taskTitle}
${params.taskDescription ? `Description: ${params.taskDescription}` : ""}
${params.projectName ? `Project: ${params.projectName}` : ""}`
  const systemHint = userDetails?.length
    ? `You are an estate manager. Suggest the best team member based on their responsibilities and specialty. Team: ${userDetails.map((u) => `${u.id} (${u.name || u.id}: ${[...(u.responsibilities || []), ...(u.specialty || [])].join(", ") || "general"})`).join("; ")}. Reply with the exact user id (e.g. charl, lucky).`
    : "You are an estate manager. Suggest the best team member to assign based on their typical responsibilities (Charl: workshop, Lucky: garden/handyman, Irma: household). Reply with the exact user id (e.g. charl, lucky)."
  return suggestFromOptions({
    context: ctx,
    options,
    systemHint,
  })
}

export async function suggestExpenseCategory(params: {
  vendor?: string
  description?: string
  options: string[]
}): Promise<string | null> {
  const ctx = [
    params.vendor && `Vendor: ${params.vendor}`,
    params.description && `Description: ${params.description}`,
  ].filter(Boolean).join("\n")
  return suggestFromOptions({
    context: ctx || "General expense",
    options: params.options,
    systemHint: "Suggest the most appropriate expense category.",
  })
}

export async function suggestPriority(params: {
  taskTitle: string
  taskDescription?: string
  dueDate?: string
  options: string[]
}): Promise<string | null> {
  const ctx = `Task: ${params.taskTitle}
${params.taskDescription ? `Description: ${params.taskDescription}` : ""}
${params.dueDate ? `Due: ${params.dueDate}` : ""}`
  return suggestFromOptions({
    context: ctx,
    options: params.options,
    systemHint: "Suggest task priority: Low, Medium, or High.",
  })
}

async function chatCompletionWithVision(messages: Array<{ role: "system" | "user" | "assistant"; content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> }>): Promise<string | null> {
  if (!isAzureAIConfigured()) return null

  const url = `${AZURE_AI_ENDPOINT!.replace(/\/$/, "")}/openai/deployments/${AZURE_AI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_AI_KEY!,
      },
      body: JSON.stringify({
        messages,
        max_tokens: 300,
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      logger.error("Azure AI vision request failed", { status: res.status, statusText: res.statusText })
      return null
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim()
    return content || null
  } catch (err) {
    logger.error("Azure AI vision error", { error: err instanceof Error ? err.message : String(err) })
    return null
  }
}

/**
 * Suggest a project based on a photo (e.g. site photo, damage, renovation area).
 * Uses vision model to analyze the image and match to existing projects or suggest new ones.
 */
export async function suggestProjectFromPhoto(params: {
  imageBase64: string
  imageMimeType?: string
  existingProjectNames: string[]
  allowNew?: boolean
}): Promise<{ name: string; description?: string; fromExisting: boolean } | null> {
  const { imageBase64, imageMimeType = "image/jpeg", existingProjectNames, allowNew = true } = params
  if (!imageBase64 || !isAzureAIConfigured()) return null

  const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:${imageMimeType};base64,${imageBase64}`

  const systemPrompt = `You are an estate project manager. Analyze the photo and suggest the most relevant project or subproject for this work.
If the image shows renovation, construction, garden, electrical, plumbing, painting, paving, security, or similar work, suggest an appropriate project name.
${existingProjectNames.length > 0 ? `Prefer one of these existing projects if relevant: ${existingProjectNames.join(", ")}` : ""}
${allowNew ? "If no existing project fits, suggest a new project name and brief description." : "Reply with only an existing project name from the list."}
Reply in JSON: { "name": "Project Name", "description": "Brief description if new", "fromExisting": true/false }`

  const userContent: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
    { type: "text", text: "What project or subproject does this photo relate to? Reply in JSON only." },
    { type: "image_url", image_url: { url: dataUrl } },
  ]

  const result = await chatCompletionWithVision([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ])

  if (!result) return null

  try {
    const json = result.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim()
    const parsed = JSON.parse(json) as { name?: string; description?: string; fromExisting?: boolean }
    const name = parsed?.name?.trim()
    if (!name) return null
    const fromExisting = existingProjectNames.some((n) => n.toLowerCase() === name.toLowerCase())
    return {
      name,
      description: parsed.description?.trim(),
      fromExisting: parsed.fromExisting ?? fromExisting,
    }
  } catch {
    const match = existingProjectNames.find((n) => result.toLowerCase().includes(n.toLowerCase()))
    if (match) return { name: match, fromExisting: true }
    return { name: result.trim().slice(0, 80), fromExisting: false }
  }
}

/**
 * Refine a task or project description using AI.
 */
export async function refineDescription(params: {
  title: string
  description?: string
  context?: string
}): Promise<string | null> {
  const { title, description, context } = params
  if (!isAzureAIConfigured()) return null

  const systemPrompt = `You are an estate project manager. Refine the given task or project description to be clear, professional, and actionable.
Keep it concise (2-4 sentences). Include key details: scope, materials if relevant, location hints, and any constraints.`

  const userPrompt = `Title: ${title}
${description ? `Current description: ${description}` : "No description yet."}
${context ? `Context: ${context}` : ""}

Provide a refined description:`

  return chatCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ])
}
