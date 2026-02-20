import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Upload directory
const UPLOAD_DIR = '/tmp/hov-uploads'

// Allowed file types
const ALLOWED_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
  receipt: ['image/jpeg', 'image/png', 'application/pdf'],
}

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// In-memory file metadata store (in production, use database)
const fileStore: Map<string, {
  id: string
  originalName: string
  storedName: string
  mimeType: string
  size: number
  uploadedBy: string
  uploadedAt: Date
  category: string
  resourceType?: string
  resourceId?: string
}> = new Map()

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

// GET - List uploaded files
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const category = searchParams.get('category')
  const resourceType = searchParams.get('resourceType')
  const resourceId = searchParams.get('resourceId')

  let files = Array.from(fileStore.values())

  if (userId) {
    files = files.filter(f => f.uploadedBy === userId)
  }
  if (category) {
    files = files.filter(f => f.category === category)
  }
  if (resourceType) {
    files = files.filter(f => f.resourceType === resourceType)
  }
  if (resourceId) {
    files = files.filter(f => f.resourceId === resourceId)
  }

  return NextResponse.json({
    files: files.map(f => ({
      ...f,
      url: `/api/uploads/${f.id}`,
    })),
    total: files.length,
  })
}

// POST - Upload file
export async function POST(request: Request) {
  try {
    await ensureUploadDir()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string
    const category = formData.get('category') as string || 'general'
    const resourceType = formData.get('resourceType') as string | null
    const resourceId = formData.get('resourceId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ALLOWED_TYPES[category] || Object.values(ALLOWED_TYPES).flat()
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const ext = path.extname(file.name)
    const storedName = `${fileId}${ext}`
    const filePath = path.join(UPLOAD_DIR, storedName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Store metadata
    const metadata = {
      id: fileId,
      originalName: file.name,
      storedName,
      mimeType: file.type,
      size: file.size,
      uploadedBy: userId,
      uploadedAt: new Date(),
      category,
      resourceType: resourceType || undefined,
      resourceId: resourceId || undefined,
    }
    fileStore.set(fileId, metadata)

    return NextResponse.json({
      success: true,
      file: {
        ...metadata,
        url: `/api/uploads/${fileId}`,
      },
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete file
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('id')

  if (!fileId) {
    return NextResponse.json({ error: 'File ID required' }, { status: 400 })
  }

  const file = fileStore.get(fileId)
  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  // In production, also delete the actual file
  fileStore.delete(fileId)

  return NextResponse.json({ success: true, deletedId: fileId })
}
