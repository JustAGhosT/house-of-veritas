import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

// Configuration
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
  ],
  uploadDir: '/tmp/uploads', // Local fallback, Azure preferred
}

// Azure Blob Storage configuration (optional)
const AZURE_CONFIG = {
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
  containerName: process.env.AZURE_STORAGE_CONTAINER || 'house-of-veritas',
}

// Check if Azure is configured
function isAzureConfigured(): boolean {
  return !!(AZURE_CONFIG.connectionString || (AZURE_CONFIG.accountName && AZURE_CONFIG.accountKey))
}

// Generate unique filename
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName)
  const baseName = path.basename(originalName, ext)
  const timestamp = Date.now()
  const hash = crypto.randomBytes(8).toString('hex')
  return `${baseName}-${timestamp}-${hash}${ext}`
}

// Validate file
function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return { valid: false, error: `File too large. Maximum size is ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB` }
  }
  
  if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed. Allowed: ${UPLOAD_CONFIG.allowedMimeTypes.join(', ')}` }
  }
  
  return { valid: true }
}

// Upload to Azure Blob Storage
async function uploadToAzure(
  buffer: Buffer,
  filename: string,
  contentType: string,
  container: string
): Promise<{ url: string; blobName: string }> {
  // Dynamic import to avoid errors when Azure SDK not installed
  const { BlobServiceClient, StorageSharedKeyCredential } = await import('@azure/storage-blob')
  
  let blobServiceClient: any
  
  if (AZURE_CONFIG.connectionString) {
    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONFIG.connectionString)
  } else if (AZURE_CONFIG.accountName && AZURE_CONFIG.accountKey) {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      AZURE_CONFIG.accountName,
      AZURE_CONFIG.accountKey
    )
    blobServiceClient = new BlobServiceClient(
      `https://${AZURE_CONFIG.accountName}.blob.core.windows.net`,
      sharedKeyCredential
    )
  }
  
  const containerClient = blobServiceClient.getContainerClient(container)
  
  // Create container if it doesn't exist
  await containerClient.createIfNotExists({ access: 'blob' })
  
  const blobName = `${Date.now()}/${filename}`
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  })
  
  return {
    url: blockBlobClient.url,
    blobName,
  }
}

// Upload to local filesystem (fallback)
async function uploadToLocal(
  buffer: Buffer,
  filename: string,
  category: string
): Promise<{ url: string; path: string }> {
  const uploadDir = path.join(UPLOAD_CONFIG.uploadDir, category)
  
  // Ensure directory exists
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  
  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, buffer)
  
  // Return a URL path (would need static file serving configured)
  return {
    url: `/uploads/${category}/${filename}`,
    path: filePath,
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = (formData.get('category') as string) || 'general'
    const assetId = formData.get('assetId') as string
    const userId = formData.get('userId') as string
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const uniqueFilename = generateUniqueFilename(file.name)
    
    let uploadResult: { url: string; storage: string; blobName?: string; path?: string }
    
    if (isAzureConfigured()) {
      // Upload to Azure Blob Storage
      const containerName = category === 'asset-photos' ? 'asset-photos' : 
                           category === 'invoices' ? 'invoice-scans' : 
                           AZURE_CONFIG.containerName
      
      const result = await uploadToAzure(buffer, uniqueFilename, file.type, containerName)
      uploadResult = {
        url: result.url,
        storage: 'azure',
        blobName: result.blobName,
      }
    } else {
      // Fallback to local storage
      const result = await uploadToLocal(buffer, uniqueFilename, category)
      uploadResult = {
        url: result.url,
        storage: 'local',
        path: result.path,
      }
    }
    
    // Create file metadata
    const fileMetadata = {
      id: crypto.randomUUID(),
      originalName: file.name,
      filename: uniqueFilename,
      url: uploadResult.url,
      size: file.size,
      mimeType: file.type,
      category,
      assetId,
      userId,
      storage: uploadResult.storage,
      blobName: uploadResult.blobName,
      uploadedAt: new Date().toISOString(),
    }
    
    return NextResponse.json({
      success: true,
      file: fileMetadata,
      azureConfigured: isAzureConfigured(),
    })
    
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Return upload configuration and status
  return NextResponse.json({
    maxFileSize: UPLOAD_CONFIG.maxFileSize,
    allowedMimeTypes: UPLOAD_CONFIG.allowedMimeTypes,
    azureConfigured: isAzureConfigured(),
    containers: ['asset-photos', 'invoice-scans', 'documents'],
  })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('id')
  const blobName = searchParams.get('blobName')
  const storage = searchParams.get('storage')
  const localPath = searchParams.get('path')
  
  if (!fileId) {
    return NextResponse.json(
      { success: false, error: 'File ID required' },
      { status: 400 }
    )
  }
  
  try {
    if (storage === 'azure' && blobName && isAzureConfigured()) {
      // Delete from Azure
      const { BlobServiceClient } = await import('@azure/storage-blob')
      const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONFIG.connectionString!)
      const containerClient = blobServiceClient.getContainerClient(AZURE_CONFIG.containerName)
      const blobClient = containerClient.getBlobClient(blobName)
      await blobClient.deleteIfExists()
    } else if (storage === 'local' && localPath) {
      // Delete from local
      await unlink(localPath)
    }
    
    return NextResponse.json({ success: true, deleted: fileId })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Delete failed' },
      { status: 500 }
    )
  }
}
