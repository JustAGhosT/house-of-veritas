import { NextResponse } from 'next/server'

export async function GET() {
  const vehicles = [
    {
      id: 1,
      date: '2025-01-22',
      driver: 'Lucky',
      vehicle: 'Toyota Hilux',
      purpose: 'Materials pickup',
      odometerStart: 45823,
      odometerEnd: 45891,
      distance: 68,
      fuelAdded: 25,
      fuelCost: 562.50,
      childPassenger: false,
      authorized: true,
      status: 'Completed'
    },
    {
      id: 2,
      date: '2025-01-20',
      driver: 'Charl',
      vehicle: 'Toyota Hilux',
      purpose: 'Hardware store visit',
      odometerStart: 45763,
      odometerEnd: 45823,
      distance: 60,
      fuelAdded: 0,
      fuelCost: 0,
      childPassenger: false,
      authorized: true,
      status: 'Completed'
    },
    {
      id: 3,
      date: '2025-01-18',
      driver: 'Irma',
      vehicle: 'Toyota Hilux',
      purpose: 'School drop-off and pickup',
      odometerStart: 45720,
      odometerEnd: 45763,
      distance: 43,
      fuelAdded: 30,
      fuelCost: 675.00,
      childPassenger: true,
      authorized: true,
      status: 'Completed'
    },
    {
      id: 4,
      date: '2025-01-23',
      driver: 'Lucky',
      vehicle: 'Toyota Hilux',
      purpose: 'Garden center visit',
      odometerStart: 45891,
      odometerEnd: null,
      distance: null,
      fuelAdded: 0,
      fuelCost: 0,
      childPassenger: false,
      authorized: true,
      status: 'In Use'
    }
  ]

  const summary = {
    totalTrips: vehicles.length,
    totalDistance: vehicles.filter(v => v.distance).reduce((sum, v) => sum + v.distance, 0),
    totalFuelCost: vehicles.reduce((sum, v) => sum + v.fuelCost, 0),
    averageDistancePerTrip: Math.round(vehicles.filter(v => v.distance).reduce((sum, v) => sum + v.distance, 0) / vehicles.filter(v => v.distance).length),
    tripsWithChildren: vehicles.filter(v => v.childPassenger).length,
    currentOdometer: 45891
  }

  return NextResponse.json({ vehicles, summary })
}
