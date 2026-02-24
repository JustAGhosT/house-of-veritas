"use client"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ReportData {
  title: string
  subtitle?: string
  generatedAt: Date
  data: any
  type: "expenses" | "tasks" | "time" | "audit"
}

// House of Veritas brand colors (RGB)
const BRAND_COLORS = {
  primary: [30, 64, 175] as [number, number, number], // #1E40AF
  secondary: [5, 150, 105] as [number, number, number], // #059669
  dark: [10, 10, 15] as [number, number, number], // #0a0a0f
  text: [255, 255, 255] as [number, number, number],
  muted: [156, 163, 175] as [number, number, number],
}

export function generatePDFReport(reportData: ReportData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(...BRAND_COLORS.primary)
  doc.rect(0, 0, pageWidth, 40, "F")

  // Logo placeholder
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("HV", 15, 25)

  // Title
  doc.setFontSize(18)
  doc.text(reportData.title, 35, 20)

  // Subtitle
  if (reportData.subtitle) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(reportData.subtitle, 35, 28)
  }

  // Generated date
  doc.setFontSize(8)
  doc.text(`Generated: ${reportData.generatedAt.toLocaleString()}`, pageWidth - 15, 35, {
    align: "right",
  })

  // Reset text color
  doc.setTextColor(0, 0, 0)

  let yPos = 50

  // Generate content based on report type
  switch (reportData.type) {
    case "expenses":
      yPos = generateExpenseReport(doc, reportData.data, yPos)
      break
    case "tasks":
      yPos = generateTaskReport(doc, reportData.data, yPos)
      break
    case "time":
      yPos = generateTimeReport(doc, reportData.data, yPos)
      break
    case "audit":
      yPos = generateAuditReport(doc, reportData.data, yPos)
      break
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...BRAND_COLORS.muted)
    doc.text(
      `House of Veritas | Confidential | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
  }

  // Save the PDF
  const filename = `${reportData.type}-report-${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(filename)
}

function generateExpenseReport(doc: jsPDF, data: any, startY: number): number {
  let yPos = startY

  // Summary section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Summary", 15, yPos)
  yPos += 10

  if (data.summary) {
    const summaryData = [
      ["Total Expenses", `R ${data.summary.total?.toLocaleString() || 0}`],
      ["Approved", `R ${data.summary.approved?.toLocaleString() || 0}`],
      ["Pending", `R ${data.summary.pending?.toLocaleString() || 0}`],
      ["Number of Expenses", data.summary.count?.toString() || "0"],
    ]

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: summaryData,
      theme: "plain",
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { halign: "right" },
      },
      margin: { left: 15 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Expenses table
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Expense Details", 15, yPos)
  yPos += 5

  if (data.expenses && data.expenses.length > 0) {
    const tableData = data.expenses.map((exp: any) => [
      exp.date,
      exp.category,
      `R ${exp.amount}`,
      exp.status.charAt(0).toUpperCase() + exp.status.slice(1),
      exp.submittedBy,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Category", "Amount", "Status", "Submitted By"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: BRAND_COLORS.primary },
      styles: { fontSize: 9 },
      margin: { left: 15, right: 15 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Category breakdown
  if (data.summary?.byCategory) {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("By Category", 15, yPos)
    yPos += 5

    const categoryData = Object.entries(data.summary.byCategory).map(([cat, amount]) => [
      cat,
      `R ${(amount as number).toLocaleString()}`,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Category", "Amount"]],
      body: categoryData,
      theme: "striped",
      headStyles: { fillColor: BRAND_COLORS.secondary },
      styles: { fontSize: 9 },
      margin: { left: 15, right: 15 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  return yPos
}

function generateTaskReport(doc: jsPDF, data: any, startY: number): number {
  let yPos = startY

  // Summary
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Summary", 15, yPos)
  yPos += 10

  if (data.summary) {
    const summaryData = [
      ["Total Tasks", data.summary.total?.toString() || "0"],
      ["Completed", data.summary.completed?.toString() || "0"],
      ["In Progress", data.summary.inProgress?.toString() || "0"],
      ["Pending", data.summary.pending?.toString() || "0"],
    ]

    autoTable(doc, {
      startY: yPos,
      body: summaryData,
      theme: "plain",
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { halign: "right" },
      },
      margin: { left: 15 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Tasks table
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Task Details", 15, yPos)
  yPos += 5

  if (data.tasks && data.tasks.length > 0) {
    const tableData = data.tasks.map((task: any) => [
      task.title,
      task.assignee,
      task.status.replace("_", " ").charAt(0).toUpperCase() +
        task.status.replace("_", " ").slice(1),
      task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
      task.completedDate || "-",
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Task", "Assignee", "Status", "Priority", "Completed"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: BRAND_COLORS.primary },
      styles: { fontSize: 9 },
      margin: { left: 15, right: 15 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  return yPos
}

function generateTimeReport(doc: jsPDF, data: any, startY: number): number {
  let yPos = startY

  // Summary
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Summary", 15, yPos)
  yPos += 10

  if (data.summary) {
    const summaryData = [
      ["Total Hours", `${data.summary.totalHours?.toFixed(1) || 0}h`],
      ["Regular Hours", `${data.summary.regularHours?.toFixed(1) || 0}h`],
      ["Overtime", `${data.summary.totalOvertime?.toFixed(1) || 0}h`],
      ["Days Worked", data.summary.daysWorked?.toString() || "0"],
      ["Average Daily", `${data.summary.averageDaily?.toFixed(1) || 0}h`],
    ]

    autoTable(doc, {
      startY: yPos,
      body: summaryData,
      theme: "plain",
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { halign: "right" },
      },
      margin: { left: 15 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Time entries table
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Time Log Details", 15, yPos)
  yPos += 5

  if (data.entries && data.entries.length > 0) {
    const tableData = data.entries.map((entry: any) => [
      entry.date,
      entry.user,
      entry.clockIn,
      entry.clockOut,
      `${entry.hours}h`,
      entry.overtime > 0 ? `+${entry.overtime}h` : "-",
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Date", "User", "Clock In", "Clock Out", "Hours", "Overtime"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: BRAND_COLORS.primary },
      styles: { fontSize: 9 },
      margin: { left: 15, right: 15 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  return yPos
}

function generateAuditReport(doc: jsPDF, data: any, startY: number): number {
  let yPos = startY

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Activity Log", 15, yPos)
  yPos += 5

  if (data.logs && data.logs.length > 0) {
    const tableData = data.logs.map((log: any) => [
      new Date(log.timestamp).toLocaleString(),
      log.userName,
      log.action.replace(/_/g, " "),
      log.resourceType,
      log.resourceName || "-",
      log.success ? "Yes" : "No",
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Timestamp", "User", "Action", "Resource", "Name", "Success"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: BRAND_COLORS.primary },
      styles: { fontSize: 8 },
      margin: { left: 15, right: 15 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  return yPos
}

export default generatePDFReport
