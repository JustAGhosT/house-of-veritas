import { readFile, writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { logger } from "@/lib/logger"

const STORAGE_OPTIONS_PATH = join(process.cwd(), "data", "storage-options.json")

export const DEFAULT_STORAGE_OPTIONS = [
  "kitchen",
  "storeroom",
  "garage",
  "workshop",
  "garden shed",
  "main lounge",
  "patio",
  "office",
  "basement",
]

export async function loadStorageOptions(): Promise<string[]> {
  try {
    const data = await readFile(STORAGE_OPTIONS_PATH, "utf-8")
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : DEFAULT_STORAGE_OPTIONS
  } catch {
    return DEFAULT_STORAGE_OPTIONS
  }
}

export async function saveStorageOptions(options: string[]): Promise<void> {
  await mkdir(join(process.cwd(), "data"), { recursive: true })
  await writeFile(STORAGE_OPTIONS_PATH, JSON.stringify(options, null, 2), "utf-8")
}
