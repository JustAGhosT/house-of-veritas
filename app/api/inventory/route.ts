import { NextResponse } from 'next/server'

// Inventory item types
interface InventoryItem {
  id: string
  name: string
  category: 'building_materials' | 'cleaning_supplies' | 'garden_supplies' | 'workshop_consumables' | 'household' | 'fuel' | 'other'
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  lastRestocked: string
  averageConsumption: number // per month
  location: string
  supplier?: string
  unitCost: number
  totalValue: number
  expiryDate?: string
  barcode?: string
  consumptionHistory: Array<{
    date: string
    quantity: number
    usedBy: string
    purpose: string
  }>
}

// In-memory inventory store
let inventory: InventoryItem[] = [
  {
    id: 'inv_001',
    name: 'Cement 50kg bags',
    category: 'building_materials',
    unit: 'bags',
    currentStock: 8,
    minStock: 5,
    maxStock: 20,
    reorderPoint: 5,
    lastRestocked: '2026-02-10',
    averageConsumption: 6,
    location: 'Workshop Store',
    supplier: 'Cashbuild',
    unitCost: 89.95,
    totalValue: 719.60,
    consumptionHistory: [
      { date: '2026-02-18', quantity: 2, usedBy: 'charl', purpose: 'Fence repair' },
    ],
  },
  {
    id: 'inv_002',
    name: 'Pool Chlorine 5kg',
    category: 'household',
    unit: 'buckets',
    currentStock: 2,
    minStock: 3,
    maxStock: 6,
    reorderPoint: 3,
    lastRestocked: '2026-01-25',
    averageConsumption: 2,
    location: 'Pool House',
    supplier: 'Pool & Spa',
    unitCost: 285.00,
    totalValue: 570.00,
    consumptionHistory: [
      { date: '2026-02-15', quantity: 1, usedBy: 'lucky', purpose: 'Weekly pool treatment' },
    ],
  },
  {
    id: 'inv_003',
    name: 'Diesel (Litres)',
    category: 'fuel',
    unit: 'litres',
    currentStock: 45,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 50,
    lastRestocked: '2026-02-05',
    averageConsumption: 80,
    location: 'Fuel Store',
    unitCost: 23.50,
    totalValue: 1057.50,
    consumptionHistory: [
      { date: '2026-02-19', quantity: 35, usedBy: 'charl', purpose: 'Generator & Tractor' },
    ],
  },
  {
    id: 'inv_004',
    name: 'Garden fertilizer 25kg',
    category: 'garden_supplies',
    unit: 'bags',
    currentStock: 4,
    minStock: 2,
    maxStock: 8,
    reorderPoint: 2,
    lastRestocked: '2026-02-01',
    averageConsumption: 1.5,
    location: 'Garden Shed',
    supplier: 'Stodels',
    unitCost: 195.00,
    totalValue: 780.00,
    consumptionHistory: [],
  },
  {
    id: 'inv_005',
    name: 'Cleaning detergent 5L',
    category: 'cleaning_supplies',
    unit: 'bottles',
    currentStock: 3,
    minStock: 4,
    maxStock: 10,
    reorderPoint: 4,
    lastRestocked: '2026-02-08',
    averageConsumption: 3,
    location: 'Scullery',
    supplier: 'Makro',
    unitCost: 125.00,
    totalValue: 375.00,
    consumptionHistory: [
      { date: '2026-02-17', quantity: 1, usedBy: 'irma', purpose: 'Weekly cleaning' },
    ],
  },
  {
    id: 'inv_006',
    name: 'Paint - White 20L',
    category: 'building_materials',
    unit: 'buckets',
    currentStock: 1,
    minStock: 2,
    maxStock: 5,
    reorderPoint: 2,
    lastRestocked: '2025-12-15',
    averageConsumption: 0.5,
    location: 'Workshop Store',
    supplier: 'Builders Warehouse',
    unitCost: 899.00,
    totalValue: 899.00,
    consumptionHistory: [],
  },
]

// GET - List inventory with filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const lowStock = searchParams.get('lowStock') === 'true'
  const location = searchParams.get('location')

  let items = [...inventory]

  if (category) {
    items = items.filter(i => i.category === category)
  }
  if (lowStock) {
    items = items.filter(i => i.currentStock <= i.reorderPoint)
  }
  if (location) {
    items = items.filter(i => i.location.toLowerCase().includes(location.toLowerCase()))
  }

  // Calculate alerts
  const alerts = inventory
    .filter(i => i.currentStock <= i.reorderPoint)
    .map(i => ({
      id: i.id,
      name: i.name,
      currentStock: i.currentStock,
      reorderPoint: i.reorderPoint,
      urgency: i.currentStock <= i.minStock ? 'critical' : 'warning',
      estimatedDaysLeft: i.averageConsumption > 0 
        ? Math.round((i.currentStock / i.averageConsumption) * 30) 
        : null,
    }))

  // Summary
  const summary = {
    totalItems: items.length,
    totalValue: items.reduce((sum, i) => sum + i.totalValue, 0),
    lowStockCount: alerts.filter(a => a.urgency === 'warning').length,
    criticalCount: alerts.filter(a => a.urgency === 'critical').length,
    byCategory: items.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }

  return NextResponse.json({
    items,
    alerts,
    summary,
  })
}

// POST - Add inventory item or record consumption
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    // Record consumption
    if (action === 'consume') {
      const { itemId, quantity, usedBy, purpose } = body
      
      const index = inventory.findIndex(i => i.id === itemId)
      if (index === -1) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }

      if (inventory[index].currentStock < quantity) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
      }

      inventory[index].currentStock -= quantity
      inventory[index].totalValue = inventory[index].currentStock * inventory[index].unitCost
      inventory[index].consumptionHistory.push({
        date: new Date().toISOString().split('T')[0],
        quantity,
        usedBy,
        purpose,
      })

      // Check if alert needed
      const needsAlert = inventory[index].currentStock <= inventory[index].reorderPoint

      return NextResponse.json({
        success: true,
        item: inventory[index],
        alert: needsAlert ? {
          message: `Low stock alert: ${inventory[index].name}`,
          currentStock: inventory[index].currentStock,
          reorderPoint: inventory[index].reorderPoint,
        } : null,
      })
    }

    // Restock item
    if (action === 'restock') {
      const { itemId, quantity, unitCost } = body
      
      const index = inventory.findIndex(i => i.id === itemId)
      if (index === -1) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }

      inventory[index].currentStock += quantity
      if (unitCost) {
        inventory[index].unitCost = unitCost
      }
      inventory[index].totalValue = inventory[index].currentStock * inventory[index].unitCost
      inventory[index].lastRestocked = new Date().toISOString().split('T')[0]

      return NextResponse.json({
        success: true,
        item: inventory[index],
      })
    }

    // Add new inventory item
    const {
      name,
      category,
      unit,
      currentStock,
      minStock,
      maxStock,
      reorderPoint,
      location,
      supplier,
      unitCost,
    } = body

    if (!name || !category || !unit || !location) {
      return NextResponse.json(
        { error: 'name, category, unit, and location are required' },
        { status: 400 }
      )
    }

    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      name,
      category,
      unit,
      currentStock: currentStock || 0,
      minStock: minStock || 1,
      maxStock: maxStock || 10,
      reorderPoint: reorderPoint || minStock || 1,
      lastRestocked: new Date().toISOString().split('T')[0],
      averageConsumption: 0,
      location,
      supplier,
      unitCost: unitCost || 0,
      totalValue: (currentStock || 0) * (unitCost || 0),
      consumptionHistory: [],
    }

    inventory.push(newItem)

    return NextResponse.json({
      success: true,
      item: newItem,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Operation failed', details: error.message },
      { status: 500 }
    )
  }
}

// Generate shopping list from low stock items
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { action, store } = body

    if (action === 'generate-shopping-list') {
      const lowStockItems = inventory.filter(i => i.currentStock <= i.reorderPoint)
      
      const shoppingList = lowStockItems.map(item => ({
        name: item.name,
        currentStock: item.currentStock,
        orderQuantity: item.maxStock - item.currentStock,
        unit: item.unit,
        estimatedCost: (item.maxStock - item.currentStock) * item.unitCost,
        supplier: item.supplier || 'Any',
        priority: item.currentStock <= item.minStock ? 'high' : 'medium',
      }))

      const totalEstimatedCost = shoppingList.reduce((sum, i) => sum + i.estimatedCost, 0)

      // Generate store-specific list
      const storeUrls: Record<string, string> = {
        cashbuild: 'https://www.cashbuild.co.za/search?q=',
        builders: 'https://www.builders.co.za/search/?text=',
        makro: 'https://www.makro.co.za/search/?text=',
        stodels: 'https://www.stodels.co.za/catalogsearch/result/?q=',
      }

      const storeSearchLinks = store && storeUrls[store.toLowerCase()]
        ? shoppingList.map(item => ({
            item: item.name,
            searchUrl: `${storeUrls[store.toLowerCase()]}${encodeURIComponent(item.name)}`,
          }))
        : null

      return NextResponse.json({
        success: true,
        shoppingList,
        totalEstimatedCost,
        itemCount: shoppingList.length,
        storeSearchLinks,
        generatedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Operation failed', details: error.message },
      { status: 500 }
    )
  }
}
