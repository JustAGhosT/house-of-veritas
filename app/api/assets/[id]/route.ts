import { NextResponse } from "next/server"
import { getAsset, updateAsset, getBaserowEmployeeIdByAppId } from "@/lib/services/baserow"
import { withRole } from "@/lib/auth/rbac"
import { logger } from "@/lib/logger"
import { toISODateString } from "@/lib/utils"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id, 10)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 })
  }
  try {
    const asset = await getAsset(id)
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }
    return NextResponse.json({ asset })
  } catch (error) {
    logger.error("GET asset error", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 })
  }
}

export const PATCH = withRole("admin", "operator", "employee")(
  async (request, context) => {
    try {
      const params = await (context.params ?? Promise.resolve({}))
      const idParam = params?.id
      if (!idParam) {
        return NextResponse.json({ error: "Asset ID required" }, { status: 400 })
      }
      const id = parseInt(idParam, 10)
      if (Number.isNaN(id)) {
        return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 })
      }

      const body = await request.json()
      const { action, checkedOutBy, expectedReturnDate, personaId } = body

      const asset = await getAsset(id)
      if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 })
      }

      if (action === "checkout") {
        if (asset.checkedOutBy) {
          return NextResponse.json(
            { error: "Asset is already checked out" },
            { status: 400 }
          )
        }

        const lockoutUntil = asset.lateReturnLockoutUntil
        if (lockoutUntil) {
          const lockoutDate = new Date(lockoutUntil)
          lockoutDate.setHours(0, 0, 0, 0)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (lockoutDate > today) {
            return NextResponse.json(
              {
                error: "Checkout blocked: asset has late return lockout until " + lockoutUntil,
              },
              { status: 403 }
            )
          }
        }

        if (!expectedReturnDate) {
          return NextResponse.json(
            { error: "expectedReturnDate is required for checkout" },
            { status: 400 }
          )
        }

        const userId = request.headers.get("x-user-id") || personaId
        const employeeId =
          (await getBaserowEmployeeIdByAppId(checkedOutBy || userId)) ?? undefined
        if (!employeeId) {
          return NextResponse.json(
            { error: "Could not resolve checkout user to employee" },
            { status: 400 }
          )
        }

        const today = toISODateString()
        const updated = await updateAsset(id, {
          checkedOutBy: employeeId,
          checkOutDate: today,
          expectedReturnDate,
        })
        return NextResponse.json({ asset: updated })
      }

      if (action === "checkin") {
        if (!asset.checkedOutBy) {
          return NextResponse.json(
            { error: "Asset is not checked out" },
            { status: 400 }
          )
        }

        const updated = await updateAsset(id, {
          checkedOutBy: null,
          checkOutDate: null,
          expectedReturnDate: null,
        })
        return NextResponse.json({ asset: updated })
      }

      return NextResponse.json(
        { error: "Invalid action. Use 'checkout' or 'checkin'" },
        { status: 400 }
      )
    } catch (error) {
      logger.error("PATCH asset error", {
        error: error instanceof Error ? error.message : String(error),
      })
      return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
    }
  }
)
