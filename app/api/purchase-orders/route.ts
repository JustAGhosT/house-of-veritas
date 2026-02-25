import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/rbac"
import { readFile, writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { routeToInngest } from "@/lib/workflows"
import { logger } from "@/lib/logger"

interface PurchaseOrder {
  id: string
  vendor: string
  amount: number
  items: string
  status: "draft" | "pending_approval" | "approved" | "ordered" | "received"
  createdBy: string
  createdAt: string
  updatedAt: string
}

const PO_PATH = join(process.cwd(), "data", "purchase-orders.json")

async function loadPOs(): Promise<PurchaseOrder[]> {
  try {
    const data = await readFile(PO_PATH, "utf-8")
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function savePOs(orders: PurchaseOrder[]): Promise<void> {
  await mkdir(join(process.cwd(), "data"), { recursive: true })
  await writeFile(PO_PATH, JSON.stringify(orders, null, 2), "utf-8")
}

export async function GET() {
  try {
    const orders = await loadPOs()
    return NextResponse.json({ purchaseOrders: orders })
  } catch (err) {
    logger.error("Failed to load purchase orders", {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: "Failed to load purchase orders" }, { status: 500 })
  }
}

export const POST = withRole("admin", "operator")(async (request, context) => {
  try {
    const body = await request.json()
    const { vendor, amount, items } = body

    if (!vendor || amount == null) {
      return NextResponse.json(
        { error: "vendor and amount are required" },
        { status: 400 }
      )
    }

    const orders = await loadPOs()
    const id = `po-${Date.now()}`
    const now = new Date().toISOString()

    const po: PurchaseOrder = {
      id,
      vendor,
      amount: Number(amount),
      items: items ?? "",
      status: "pending_approval",
      createdBy: context.userId,
      createdAt: now,
      updatedAt: now,
    }

    orders.push(po)
    await savePOs(orders)

    await routeToInngest({
      name: "house-of-veritas/purchase_order.created",
      data: {
        poId: id,
        vendor,
        amount: po.amount,
        items: po.items,
        createdBy: context.userId,
      },
    })

    return NextResponse.json({ purchaseOrder: po })
  } catch (err) {
    logger.error("Failed to create purchase order", {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 })
  }
})
