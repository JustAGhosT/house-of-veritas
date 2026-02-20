import { NextResponse } from 'next/server'

export async function GET() {
  const assets = [
    {
      id: 1,
      assetId: 'WS-001',
      name: 'Industrial Drill Press',
      type: 'Equipment',
      location: 'Workshop',
      condition: 'Good',
      purchaseDate: '2022-05-15',
      value: 8500,
      checkedOutBy: null,
      lastMaintenance: '2024-11-10',
      nextMaintenance: '2025-02-10'
    },
    {
      id: 2,
      assetId: 'VH-001',
      name: 'Toyota Hilux',
      type: 'Vehicle',
      location: 'Garage',
      condition: 'Excellent',
      purchaseDate: '2021-03-20',
      value: 385000,
      checkedOutBy: 'Lucky',
      lastMaintenance: '2024-12-05',
      nextMaintenance: '2025-03-05'
    },
    {
      id: 3,
      assetId: 'GD-001',
      name: 'Commercial Lawnmower',
      type: 'Equipment',
      location: 'Garden Shed',
      condition: 'Good',
      purchaseDate: '2023-01-10',
      value: 12500,
      checkedOutBy: 'Lucky',
      lastMaintenance: '2025-01-05',
      nextMaintenance: '2025-04-05'
    },
    {
      id: 4,
      assetId: 'WS-002',
      name: 'Welding Machine',
      type: 'Equipment',
      location: 'Workshop',
      condition: 'Fair',
      purchaseDate: '2020-08-12',
      value: 15000,
      checkedOutBy: 'Charl',
      lastMaintenance: '2024-10-20',
      nextMaintenance: '2025-01-20'
    },
    {
      id: 5,
      assetId: 'GD-002',
      name: 'Irrigation Control System',
      type: 'Equipment',
      location: 'Garden',
      condition: 'Excellent',
      purchaseDate: '2023-06-15',
      value: 8900,
      checkedOutBy: null,
      lastMaintenance: '2024-12-10',
      nextMaintenance: '2025-06-10'
    },
    {
      id: 6,
      assetId: 'HH-001',
      name: 'Industrial Vacuum Cleaner',
      type: 'Household',
      location: 'Storage Room',
      condition: 'Good',
      purchaseDate: '2022-11-05',
      value: 4500,
      checkedOutBy: 'Irma',
      lastMaintenance: '2024-11-15',
      nextMaintenance: '2025-05-15'
    }
  ]

  const summary = {
    total: assets.length,
    totalValue: assets.reduce((sum, asset) => sum + asset.value, 0),
    checkedOut: assets.filter(a => a.checkedOutBy !== null).length,
    maintenanceDue: assets.filter(a => new Date(a.nextMaintenance) < new Date(Date.now() + 30*24*60*60*1000)).length,
    byType: {
      Equipment: assets.filter(a => a.type === 'Equipment').length,
      Vehicle: assets.filter(a => a.type === 'Vehicle').length,
      Household: assets.filter(a => a.type === 'Household').length
    }
  }

  return NextResponse.json({ assets, summary })
}
