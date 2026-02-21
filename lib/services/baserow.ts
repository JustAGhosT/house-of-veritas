// Baserow API Integration Service
// This service handles all interactions with the Baserow operational database

interface BaserowConfig {
  apiUrl: string
  apiToken: string
  databaseId: string
}

// Table IDs - these will be configured once Baserow is deployed
interface TableIds {
  employees: number
  assets: number
  tasks: number
  timeClock: number
  incidents: number
  vehicleLogs: number
  expenses: number
  documentExpiry: number
}

// Generic row type
interface BaserowRow {
  id: number
  [key: string]: any
}

// Employee type
export interface Employee {
  id: number
  fullName: string
  idNumber?: string
  role: string
  employmentStartDate?: string
  probationStatus?: string
  contractRef?: string
  leaveBalance: number
  email: string
  phone: string
  photo?: string
}

// Asset type
export interface Asset {
  id: number
  assetId: string
  type: string
  description?: string
  purchaseDate?: string
  price?: number
  condition: string
  location: string
  checkedOutBy?: number
  checkOutDate?: string
  photo?: string
}

// Task type
export interface Task {
  id: number
  title: string
  description?: string
  assignedTo?: number
  assignedToName?: string
  dueDate?: string
  priority: "Low" | "Medium" | "High"
  status: "Not Started" | "In Progress" | "Completed"
  timeSpent?: number
  completionNotes?: string
  relatedAsset?: number
  project?: string
  createdDate?: string
  completedDate?: string
}

// Time Clock Entry type
export interface TimeClockEntry {
  id: number
  employee: number
  employeeName?: string
  date: string
  clockIn?: string
  clockOut?: string
  breakDuration?: number
  totalHours?: number
  overtimeHours?: number
  approvalStatus: "Pending" | "Approved" | "Rejected"
  notes?: string
}

// Expense type
export interface Expense {
  id: number
  requester: number
  requesterName?: string
  type: "Request" | "Post-Hoc"
  category: string
  amount: number
  vendor?: string
  date: string
  approvalStatus: "Pending" | "Approved" | "Rejected" | "Post-Hoc"
  receipt?: string
  project?: string
  milestone?: string
  notes?: string
  approver?: number
  approvalDate?: string
}

// Vehicle Log type
export interface VehicleLog {
  id: number
  driver: number
  driverName?: string
  vehicle: number
  vehicleName?: string
  dateOut: string
  dateIn?: string
  odometerStart: number
  odometerEnd?: number
  distance?: number
  fuelAdded?: number
  fuelCost?: number
  childPassenger?: boolean
  notes?: string
}

// Default config - uses environment variables or fallback
const getConfig = (): BaserowConfig => ({
  apiUrl: process.env.BASEROW_API_URL || "https://ops.nexamesh.ai/api",
  apiToken: process.env.BASEROW_API_TOKEN || "",
  databaseId: process.env.BASEROW_DATABASE_ID || "",
})

// Table IDs - would be configured after Baserow deployment
const getTableIds = (): TableIds => ({
  employees: parseInt(process.env.BASEROW_TABLE_EMPLOYEES || "0"),
  assets: parseInt(process.env.BASEROW_TABLE_ASSETS || "0"),
  tasks: parseInt(process.env.BASEROW_TABLE_TASKS || "0"),
  timeClock: parseInt(process.env.BASEROW_TABLE_TIME_CLOCK || "0"),
  incidents: parseInt(process.env.BASEROW_TABLE_INCIDENTS || "0"),
  vehicleLogs: parseInt(process.env.BASEROW_TABLE_VEHICLE_LOGS || "0"),
  expenses: parseInt(process.env.BASEROW_TABLE_EXPENSES || "0"),
  documentExpiry: parseInt(process.env.BASEROW_TABLE_DOCUMENT_EXPIRY || "0"),
})

// Check if Baserow is configured
export const isBaserowConfigured = (): boolean => {
  const config = getConfig()
  return !!config.apiToken && !!config.databaseId
}

// Generic fetch function
async function baserowFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  const config = getConfig()

  if (!config.apiToken) {
    return null
  }

  try {
    const response = await fetch(`${config.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Token ${config.apiToken}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Baserow API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Baserow API error:", error)
    return null
  }
}

// ==================== EMPLOYEES ====================

export async function getEmployees(): Promise<Employee[]> {
  const tableIds = getTableIds()
  
  if (!isBaserowConfigured() || !tableIds.employees) {
    return getMockEmployees()
  }

  const result = await baserowFetch<{ results: BaserowRow[] }>(
    `/database/rows/table/${tableIds.employees}/?user_field_names=true`
  )

  if (!result) {
    return getMockEmployees()
  }

  return result.results.map(mapRowToEmployee)
}

export async function getEmployee(id: number): Promise<Employee | null> {
  const tableIds = getTableIds()

  if (!isBaserowConfigured() || !tableIds.employees) {
    return getMockEmployees().find((e) => e.id === id) || null
  }

  const row = await baserowFetch<BaserowRow>(
    `/database/rows/table/${tableIds.employees}/${id}/?user_field_names=true`
  )

  return row ? mapRowToEmployee(row) : null
}

// ==================== TASKS ====================

export async function getTasks(filters?: {
  assignedTo?: number
  status?: string
}): Promise<Task[]> {
  const tableIds = getTableIds()

  if (!isBaserowConfigured() || !tableIds.tasks) {
    let tasks = getMockTasks()
    if (filters?.assignedTo) {
      tasks = tasks.filter((t) => t.assignedTo === filters.assignedTo)
    }
    if (filters?.status) {
      tasks = tasks.filter((t) => t.status === filters.status)
    }
    return tasks
  }

  let endpoint = `/database/rows/table/${tableIds.tasks}/?user_field_names=true`
  // Add filters if provided
  if (filters?.assignedTo) {
    endpoint += `&filter__field_assigned_to__link_row_has=${filters.assignedTo}`
  }
  if (filters?.status) {
    endpoint += `&filter__field_status__equal=${filters.status}`
  }

  const result = await baserowFetch<{ results: BaserowRow[] }>(endpoint)

  if (!result) {
    return getMockTasks()
  }

  return result.results.map(mapRowToTask)
}

export async function createTask(task: Omit<Task, "id">): Promise<Task | null> {
  const tableIds = getTableIds()

  if (!isBaserowConfigured() || !tableIds.tasks) {
    return { ...task, id: Date.now() } as Task
  }

  const row = await baserowFetch<BaserowRow>(
    `/database/rows/table/${tableIds.tasks}/?user_field_names=true`,
    {
      method: "POST",
      body: JSON.stringify(mapTaskToRow(task)),
    }
  )

  return row ? mapRowToTask(row) : null
}

export async function updateTask(
  id: number,
  updates: Partial<Task>
): Promise<Task | null> {
  const tableIds = getTableIds()

  if (!isBaserowConfigured() || !tableIds.tasks) {
    const mockTask = getMockTasks().find((t) => t.id === id)
    return mockTask ? { ...mockTask, ...updates } : null
  }

  const row = await baserowFetch<BaserowRow>(
    `/database/rows/table/${tableIds.tasks}/${id}/?user_field_names=true`,
    {
      method: "PATCH",
      body: JSON.stringify(mapTaskToRow(updates)),
    }
  )

  return row ? mapRowToTask(row) : null
}

// ==================== EXPENSES ====================

export async function getExpenses(filters?: {
  requester?: number
  status?: string
}): Promise<Expense[]> {
  const tableIds = getTableIds()

  if (!isBaserowConfigured() || !tableIds.expenses) {
    let expenses = getMockExpenses()
    if (filters?.requester) {
      expenses = expenses.filter((e) => e.requester === filters.requester)
    }
    if (filters?.status) {
      expenses = expenses.filter((e) => e.approvalStatus === filters.status)
    }
    return expenses
  }

  let endpoint = `/database/rows/table/${tableIds.expenses}/?user_field_names=true`
  
  const result = await baserowFetch<{ results: BaserowRow[] }>(endpoint)

  if (!result) {
    return getMockExpenses()
  }

  return result.results.map(mapRowToExpense)
}

export async function createExpense(expense: Omit<Expense, "id">): Promise<Expense | null> {
  const tableIds = getTableIds()

  if (!isBaserowConfigured() || !tableIds.expenses) {
    return { ...expense, id: Date.now() } as Expense
  }

  const row = await baserowFetch<BaserowRow>(
    `/database/rows/table/${tableIds.expenses}/?user_field_names=true`,
    {
      method: "POST",
      body: JSON.stringify(mapExpenseToRow(expense)),
    }
  )

  return row ? mapRowToExpense(row) : null
}

export async function updateExpense(
  id: number,
  updates: Partial<Expense>
): Promise<Expense | null> {
  const tableIds = getTableIds()

  if (!isBaserowConfigured() || !tableIds.expenses) {
    const mockExpense = getMockExpenses().find((e) => e.id === id)
    return mockExpense ? { ...mockExpense, ...updates } : null
  }

  const row = await baserowFetch<BaserowRow>(
    `/database/rows/table/${tableIds.expenses}/${id}/?user_field_names=true`,
    {
      method: "PATCH",
      body: JSON.stringify(mapExpenseToRow(updates)),
    }
  )

  return row ? mapRowToExpense(row) : null
}

// ==================== ASSETS ====================

export async function getAssets(filters?: {
  type?: string
  location?: string
}): Promise<Asset[]> {
  const tableIds = getTableIds()

  if (!isBaserowConfigured() || !tableIds.assets) {
    return getMockAssets()
  }

  const result = await baserowFetch<{ results: BaserowRow[] }>(
    `/database/rows/table/${tableIds.assets}/?user_field_names=true`
  )

  if (!result) {
    return getMockAssets()
  }

  return result.results.map(mapRowToAsset)
}

// ==================== TIME CLOCK ====================

export async function getTimeClockEntries(filters?: {
  employee?: number
  date?: string
}): Promise<TimeClockEntry[]> {
  const tableIds = getTableIds()

  if (!isBaserowConfigured() || !tableIds.timeClock) {
    return getMockTimeClockEntries()
  }

  const result = await baserowFetch<{ results: BaserowRow[] }>(
    `/database/rows/table/${tableIds.timeClock}/?user_field_names=true`
  )

  if (!result) {
    return getMockTimeClockEntries()
  }

  return result.results.map(mapRowToTimeClockEntry)
}

export async function clockIn(employeeId: number): Promise<TimeClockEntry | null> {
  const tableIds = getTableIds()
  const now = new Date()

  const entry: Omit<TimeClockEntry, "id"> = {
    employee: employeeId,
    date: now.toISOString().split("T")[0],
    clockIn: now.toTimeString().slice(0, 5),
    approvalStatus: "Pending",
  }

  if (!isBaserowConfigured() || !tableIds.timeClock) {
    return { ...entry, id: Date.now() }
  }

  const row = await baserowFetch<BaserowRow>(
    `/database/rows/table/${tableIds.timeClock}/?user_field_names=true`,
    {
      method: "POST",
      body: JSON.stringify(entry),
    }
  )

  return row ? mapRowToTimeClockEntry(row) : { ...entry, id: Date.now() }
}

export async function clockOut(entryId: number): Promise<TimeClockEntry | null> {
  const tableIds = getTableIds()
  const now = new Date()

  if (!isBaserowConfigured() || !tableIds.timeClock) {
    return null
  }

  const row = await baserowFetch<BaserowRow>(
    `/database/rows/table/${tableIds.timeClock}/${entryId}/?user_field_names=true`,
    {
      method: "PATCH",
      body: JSON.stringify({ clockOut: now.toTimeString().slice(0, 5) }),
    }
  )

  return row ? mapRowToTimeClockEntry(row) : null
}

// ==================== VEHICLE LOGS ====================

export async function getVehicleLogs(filters?: {
  driver?: number
}): Promise<VehicleLog[]> {
  const tableIds = getTableIds()

  if (!isBaserowConfigured() || !tableIds.vehicleLogs) {
    return getMockVehicleLogs()
  }

  const result = await baserowFetch<{ results: BaserowRow[] }>(
    `/database/rows/table/${tableIds.vehicleLogs}/?user_field_names=true`
  )

  if (!result) {
    return getMockVehicleLogs()
  }

  return result.results.map(mapRowToVehicleLog)
}

// ==================== MAPPING FUNCTIONS ====================

function mapRowToEmployee(row: BaserowRow): Employee {
  return {
    id: row.id,
    fullName: row["Full Name"] || row.full_name || "",
    idNumber: row["ID Number"] || row.id_number,
    role: row["Role"]?.value || row.role || "",
    employmentStartDate: row["Employment Start Date"] || row.employment_start_date,
    probationStatus: row["Probation Status"]?.value || row.probation_status,
    contractRef: row["Contract Ref"] || row.contract_ref,
    leaveBalance: row["Leave Balance"] || row.leave_balance || 0,
    email: row["Email"] || row.email || "",
    phone: row["Phone"] || row.phone || "",
    photo: row["Photo"]?.[0]?.url || row.photo,
  }
}

function mapRowToTask(row: BaserowRow): Task {
  return {
    id: row.id,
    title: row["Title"] || row.title || "",
    description: row["Description"] || row.description,
    assignedTo: row["Assigned To"]?.[0]?.id || row.assigned_to,
    assignedToName: row["Assigned To"]?.[0]?.value || "",
    dueDate: row["Due Date"] || row.due_date,
    priority: row["Priority"]?.value || row.priority || "Medium",
    status: row["Status"]?.value || row.status || "Not Started",
    timeSpent: row["Time Spent"] || row.time_spent,
    completionNotes: row["Completion Notes"] || row.completion_notes,
    relatedAsset: row["Related Asset"]?.[0]?.id || row.related_asset,
    project: row["Project"] || row.project,
    createdDate: row["Created Date"] || row.created_date,
    completedDate: row["Completed Date"] || row.completed_date,
  }
}

function mapTaskToRow(task: Partial<Task>): Record<string, any> {
  const row: Record<string, any> = {}
  if (task.title !== undefined) row["Title"] = task.title
  if (task.description !== undefined) row["Description"] = task.description
  if (task.assignedTo !== undefined) row["Assigned To"] = [task.assignedTo]
  if (task.dueDate !== undefined) row["Due Date"] = task.dueDate
  if (task.priority !== undefined) row["Priority"] = task.priority
  if (task.status !== undefined) row["Status"] = task.status
  if (task.timeSpent !== undefined) row["Time Spent"] = task.timeSpent
  if (task.completionNotes !== undefined) row["Completion Notes"] = task.completionNotes
  if (task.project !== undefined) row["Project"] = task.project
  return row
}

function mapRowToExpense(row: BaserowRow): Expense {
  return {
    id: row.id,
    requester: row["Requester"]?.[0]?.id || row.requester || 0,
    requesterName: row["Requester"]?.[0]?.value || "",
    type: row["Type"]?.value || row.type || "Request",
    category: row["Category"]?.value || row.category || "",
    amount: row["Amount"] || row.amount || 0,
    vendor: row["Vendor"] || row.vendor,
    date: row["Date"] || row.date || "",
    approvalStatus: row["Approval Status"]?.value || row.approval_status || "Pending",
    receipt: row["Receipt"]?.[0]?.url || row.receipt,
    project: row["Project"] || row.project,
    milestone: row["Milestone"] || row.milestone,
    notes: row["Notes"] || row.notes,
    approver: row["Approver"]?.[0]?.id || row.approver,
    approvalDate: row["Approval Date"] || row.approval_date,
  }
}

function mapExpenseToRow(expense: Partial<Expense>): Record<string, any> {
  const row: Record<string, any> = {}
  if (expense.requester !== undefined) row["Requester"] = [expense.requester]
  if (expense.type !== undefined) row["Type"] = expense.type
  if (expense.category !== undefined) row["Category"] = expense.category
  if (expense.amount !== undefined) row["Amount"] = expense.amount
  if (expense.vendor !== undefined) row["Vendor"] = expense.vendor
  if (expense.date !== undefined) row["Date"] = expense.date
  if (expense.approvalStatus !== undefined) row["Approval Status"] = expense.approvalStatus
  if (expense.project !== undefined) row["Project"] = expense.project
  if (expense.notes !== undefined) row["Notes"] = expense.notes
  if (expense.approver !== undefined) row["Approver"] = [expense.approver]
  if (expense.approvalDate !== undefined) row["Approval Date"] = expense.approvalDate
  return row
}

function mapRowToAsset(row: BaserowRow): Asset {
  return {
    id: row.id,
    assetId: row["Asset ID"] || row.asset_id || "",
    type: row["Type"]?.value || row.type || "",
    description: row["Description"] || row.description,
    purchaseDate: row["Purchase Date"] || row.purchase_date,
    price: row["Price"] || row.price,
    condition: row["Condition"]?.value || row.condition || "",
    location: row["Location"]?.value || row.location || "",
    checkedOutBy: row["Checked Out By"]?.[0]?.id || row.checked_out_by,
    checkOutDate: row["Check Out Date"] || row.check_out_date,
    photo: row["Photo"]?.[0]?.url || row.photo,
  }
}

function mapRowToTimeClockEntry(row: BaserowRow): TimeClockEntry {
  return {
    id: row.id,
    employee: row["Employee"]?.[0]?.id || row.employee || 0,
    employeeName: row["Employee"]?.[0]?.value || "",
    date: row["Date"] || row.date || "",
    clockIn: row["Clock In"] || row.clock_in,
    clockOut: row["Clock Out"] || row.clock_out,
    breakDuration: row["Break Duration"] || row.break_duration,
    totalHours: row["Total Hours"] || row.total_hours,
    overtimeHours: row["Overtime Hours"] || row.overtime_hours,
    approvalStatus: row["Approval Status"]?.value || row.approval_status || "Pending",
    notes: row["Notes"] || row.notes,
  }
}

function mapRowToVehicleLog(row: BaserowRow): VehicleLog {
  return {
    id: row.id,
    driver: row["Driver"]?.[0]?.id || row.driver || 0,
    driverName: row["Driver"]?.[0]?.value || "",
    vehicle: row["Vehicle"]?.[0]?.id || row.vehicle || 0,
    vehicleName: row["Vehicle"]?.[0]?.value || "",
    dateOut: row["Date Out"] || row.date_out || "",
    dateIn: row["Date In"] || row.date_in,
    odometerStart: row["Odometer Start"] || row.odometer_start || 0,
    odometerEnd: row["Odometer End"] || row.odometer_end,
    distance: row["Distance"] || row.distance,
    fuelAdded: row["Fuel Added"] || row.fuel_added,
    fuelCost: row["Fuel Cost"] || row.fuel_cost,
    childPassenger: row["Child Passenger"] || row.child_passenger,
    notes: row["Notes"] || row.notes,
  }
}

// ==================== MOCK DATA ====================

function getMockEmployees(): Employee[] {
  return [
    {
      id: 1,
      fullName: "Hans van der Berg",
      role: "Owner",
      leaveBalance: 21,
      email: "hans@houseofv.com",
      phone: "+27692381255",
    },
    {
      id: 2,
      fullName: "Charl Pieterse",
      role: "Employee",
      leaveBalance: 15,
      email: "charl@houseofv.com",
      phone: "+27711488390",
    },
    {
      id: 3,
      fullName: "Lucky Mokoena",
      role: "Employee",
      leaveBalance: 8,
      email: "lucky@houseofv.com",
      phone: "+27794142410",
    },
    {
      id: 4,
      fullName: "Irma van Niekerk",
      role: "Resident",
      leaveBalance: 0,
      email: "irma@houseofv.com",
      phone: "+27711488390",
    },
  ]
}

function getMockTasks(): Task[] {
  return [
    { id: 1, title: "Fix electrical outlet - Kitchen", assignedTo: 2, assignedToName: "Charl", priority: "High", status: "In Progress", dueDate: new Date().toISOString().split("T")[0], project: "Electrical Work" },
    { id: 2, title: "Repair leaking pipe - Bathroom", assignedTo: 2, assignedToName: "Charl", priority: "High", status: "Completed", dueDate: new Date().toISOString().split("T")[0], project: "Plumbing" },
    { id: 3, title: "Weekly lawn mowing", assignedTo: 3, assignedToName: "Lucky", priority: "Medium", status: "Completed", dueDate: new Date().toISOString().split("T")[0], project: "Garden Maintenance" },
    { id: 4, title: "Trim hedges - front", assignedTo: 3, assignedToName: "Lucky", priority: "Medium", status: "Completed", dueDate: new Date().toISOString().split("T")[0], project: "Garden Maintenance" },
    { id: 5, title: "Fix irrigation zone 3", assignedTo: 3, assignedToName: "Lucky", priority: "High", status: "In Progress", dueDate: new Date().toISOString().split("T")[0], project: "Garden Maintenance" },
    { id: 6, title: "Morning kitchen clean", assignedTo: 4, assignedToName: "Irma", priority: "Medium", status: "Completed", dueDate: new Date().toISOString().split("T")[0], project: "Household" },
    { id: 7, title: "Meal preparation - dinner", assignedTo: 4, assignedToName: "Irma", priority: "High", status: "In Progress", dueDate: new Date().toISOString().split("T")[0], project: "Household" },
  ]
}

function getMockExpenses(): Expense[] {
  return [
    { id: 1, requester: 2, requesterName: "Charl", type: "Request", category: "Materials", amount: 850, date: new Date().toISOString().split("T")[0], approvalStatus: "Pending", project: "Workshop" },
    { id: 2, requester: 3, requesterName: "Lucky", type: "Request", category: "Supplies", amount: 320, date: new Date().toISOString().split("T")[0], approvalStatus: "Pending", project: "Garden" },
    { id: 3, requester: 3, requesterName: "Lucky", type: "Post-Hoc", category: "Fuel", amount: 280, date: new Date(Date.now() - 86400000).toISOString().split("T")[0], approvalStatus: "Approved" },
    { id: 4, requester: 2, requesterName: "Charl", type: "Post-Hoc", category: "Fuel", amount: 450, date: new Date(Date.now() - 172800000).toISOString().split("T")[0], approvalStatus: "Approved" },
  ]
}

function getMockAssets(): Asset[] {
  return [
    { id: 1, assetId: "WS-001", type: "Tool", description: "Makita Drill Set", condition: "Good", location: "Workshop", checkedOutBy: 2 },
    { id: 2, assetId: "WS-002", type: "Tool", description: "Angle Grinder", condition: "Good", location: "Workshop", checkedOutBy: 2 },
    { id: 3, assetId: "WS-003", type: "Tool", description: "Multimeter", condition: "Excellent", location: "Workshop" },
    { id: 4, assetId: "VH-001", type: "Vehicle", description: "Toyota Hilux", condition: "Good", location: "Garage" },
    { id: 5, assetId: "GD-001", type: "Equipment", description: "Lawn Mower", condition: "Good", location: "Garden Shed" },
  ]
}

function getMockTimeClockEntries(): TimeClockEntry[] {
  const today = new Date().toISOString().split("T")[0]
  return [
    { id: 1, employee: 2, employeeName: "Charl", date: today, clockIn: "07:15", approvalStatus: "Pending" },
    { id: 2, employee: 3, employeeName: "Lucky", date: today, clockIn: "06:30", approvalStatus: "Pending" },
  ]
}

function getMockVehicleLogs(): VehicleLog[] {
  return [
    { id: 1, driver: 3, driverName: "Lucky", vehicle: 4, vehicleName: "Toyota Hilux", dateOut: new Date().toISOString().split("T")[0], odometerStart: 124532 },
    { id: 2, driver: 2, driverName: "Charl", vehicle: 4, vehicleName: "Toyota Hilux", dateOut: new Date(Date.now() - 86400000).toISOString().split("T")[0], dateIn: new Date(Date.now() - 86400000).toISOString().split("T")[0], odometerStart: 124500, odometerEnd: 124532, distance: 32 },
  ]
}
