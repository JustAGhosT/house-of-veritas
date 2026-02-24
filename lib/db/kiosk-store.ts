import { ObjectId } from "mongodb"
import { getCollection, sanitizeDocument, sanitizeDocuments } from "@/lib/db/mongodb"
import { logger } from "@/lib/logger"

export interface KioskRequestDoc {
  _id?: ObjectId
  type: "stock_order" | "salary_advance" | "issue_report"
  employeeId: string
  employeeName: string
  data: Record<string, unknown>
  timestamp: string
  status: "pending" | "approved" | "rejected" | "completed"
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

export interface KioskStore {
  find(query: Record<string, unknown>): Promise<KioskRequestDoc[]>
  insertOne(doc: Omit<KioskRequestDoc, "_id">): Promise<{ insertedId: ObjectId }>
  updateOne(filter: { _id: ObjectId }, update: { $set: Record<string, unknown> }): Promise<unknown>
  findOne(filter: { _id: ObjectId }): Promise<KioskRequestDoc | null>
  countDocuments(): Promise<number>
  insertMany(docs: Omit<KioskRequestDoc, "_id">[]): Promise<unknown>
}

export const KIOSK_SEED_DATA: Omit<KioskRequestDoc, "_id">[] = [
  {
    type: "stock_order",
    employeeId: "lucky",
    employeeName: "Lucky",
    data: {
      itemName: "Fertilizer bags",
      quantity: 5,
      urgency: "normal",
      notes: "For the front garden beds",
    },
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: "approved",
    reviewedBy: "hans",
    reviewedAt: new Date(Date.now() - 43200000).toISOString(),
    notes: "Approved. Please order from Stodels.",
  },
  {
    type: "issue_report",
    employeeId: "charl",
    employeeName: "Charl",
    data: {
      assetName: "Workshop drill press",
      issueType: "maintenance",
      description: "Belt needs replacement, making squeaking noise",
      location: "Workshop",
    },
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: "pending",
  },
  {
    type: "salary_advance",
    employeeId: "lucky",
    employeeName: "Lucky",
    data: {
      amount: 1500,
      reason: "School fees for my daughter due this week",
      repaymentPlan: "2months",
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "pending",
  },
  {
    type: "stock_order",
    employeeId: "charl",
    employeeName: "Charl",
    data: {
      itemName: "WD-40 lubricant spray",
      quantity: 3,
      urgency: "urgent",
      notes: "Gate motor making grinding noises, need to lubricate urgently",
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: "pending",
  },
  {
    type: "issue_report",
    employeeId: "irma",
    employeeName: "Irma",
    data: {
      assetName: "Kitchen dishwasher",
      issueType: "broken",
      description: "Not draining water properly, leaves puddles inside after cycle",
      location: "Main Kitchen",
    },
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    status: "pending",
  },
  {
    type: "issue_report",
    employeeId: "lucky",
    employeeName: "Lucky",
    data: {
      assetName: "Pool pump room door",
      issueType: "safety",
      description: "Door lock is broken, pool chemicals accessible to anyone",
      location: "Pool area",
    },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: "pending",
  },
  {
    type: "salary_advance",
    employeeId: "charl",
    employeeName: "Charl",
    data: { amount: 800, reason: "Car repairs needed for commute", repaymentPlan: "1month" },
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    status: "rejected",
    reviewedBy: "hans",
    reviewedAt: new Date(Date.now() - 172800000).toISOString(),
    notes: "Please resubmit with vehicle repair quote attached.",
  },
]

const inMemoryStore = new Map<string, KioskRequestDoc>()
let inMemorySeeded = false

function seedInMemory() {
  if (inMemorySeeded) return
  for (const doc of KIOSK_SEED_DATA) {
    const id = new ObjectId()
    inMemoryStore.set(id.toString(), { ...doc, _id: id } as KioskRequestDoc)
  }
  inMemorySeeded = true
  logger.info("KioskStore: Seeded in-memory fallback", { count: KIOSK_SEED_DATA.length })
}

const inMemoryStoreAdapter: KioskStore = {
  async find(query: Record<string, unknown>) {
    seedInMemory()
    let items = Array.from(inMemoryStore.values())
    if (query.employeeId) items = items.filter((r) => r.employeeId === query.employeeId)
    if (query.type) items = items.filter((r) => r.type === query.type)
    if (query.status) items = items.filter((r) => r.status === query.status)
    return items.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1))
  },
  async insertOne(doc: Omit<KioskRequestDoc, "_id">) {
    seedInMemory()
    const id = new ObjectId()
    inMemoryStore.set(id.toString(), { ...doc, _id: id } as KioskRequestDoc)
    return { insertedId: id }
  },
  async updateOne(
    filter: { _id: ObjectId },
    update: { $set: Record<string, unknown> }
  ): Promise<void> {
    const existing = inMemoryStore.get(filter._id.toString())
    if (existing) {
      Object.assign(existing, update.$set)
    }
  },
  async findOne(filter: { _id: ObjectId }) {
    seedInMemory()
    return inMemoryStore.get(filter._id.toString()) ?? null
  },
  async countDocuments() {
    seedInMemory()
    return inMemoryStore.size
  },
  async insertMany(docs: Omit<KioskRequestDoc, "_id">[]) {
    for (const doc of docs) {
      const id = new ObjectId()
      inMemoryStore.set(id.toString(), { ...doc, _id: id } as KioskRequestDoc)
    }
  },
}

async function getMongoStore(): Promise<KioskStore> {
  const collection = await getCollection<KioskRequestDoc>("kiosk_requests")
  const count = await collection.countDocuments()
  if (count === 0 && KIOSK_SEED_DATA.length > 0) {
    await collection.insertMany(KIOSK_SEED_DATA as KioskRequestDoc[])
    logger.info("KioskStore: Seeded MongoDB", { count: KIOSK_SEED_DATA.length })
  }
  return {
    find: (q) => collection.find(q).sort({ timestamp: -1 }).toArray(),
    insertOne: (doc) => collection.insertOne(doc as KioskRequestDoc),
    updateOne: async (filter, update) => {
      await collection.updateOne(filter, update)
    },
    findOne: (filter) => collection.findOne(filter),
    countDocuments: () => collection.countDocuments(),
    insertMany: async (docs) => {
      await collection.insertMany(docs as KioskRequestDoc[])
    },
  }
}

let cachedStore: KioskStore | null = null
let storeMode: "mongodb" | "memory" = "mongodb"

export async function getKioskStore(): Promise<{ store: KioskStore; mode: "mongodb" | "memory" }> {
  if (cachedStore) return { store: cachedStore, mode: storeMode }
  try {
    cachedStore = await getMongoStore()
    storeMode = "mongodb"
    return { store: cachedStore, mode: "mongodb" }
  } catch (error) {
    logger.warn("KioskStore: MongoDB unavailable, using in-memory fallback", {
      error: error instanceof Error ? error.message : String(error),
    })
    cachedStore = inMemoryStoreAdapter
    storeMode = "memory"
    return { store: cachedStore, mode: "memory" }
  }
}

export function sanitizeKioskDoc(doc: KioskRequestDoc) {
  return sanitizeDocument(doc)
}

export function sanitizeKioskDocs(docs: KioskRequestDoc[]) {
  return sanitizeDocuments(docs)
}
