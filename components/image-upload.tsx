"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Loader2, ImageIcon, CheckCircle } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onUpload: (files: UploadedFile[]) => void
  category?: string
  assetId?: string
  maxFiles?: number
  existingImages?: string[]
}

interface UploadedFile {
  id: string
  url: string
  filename: string
  storage: string
}

export function ImageUpload({ 
  onUpload, 
  category = "asset-photos",
  assetId,
  maxFiles = 5,
  existingImages = []
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [preview, setPreview] = useState<string[]>([...existingImages])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate total count
    if (preview.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`)
      return
    }

    setUploading(true)
    setError(null)

    const newPreviews: string[] = []
    const newUploads: UploadedFile[] = []

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Only image files allowed")
        continue
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large (max 5MB)")
        continue
      }

      // Create preview immediately
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string)
        setPreview(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)

      // Upload to server
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("category", category)
        if (assetId) formData.append("assetId", assetId)

        const res = await fetch("/api/files", {
          method: "POST",
          body: formData,
        })

        const data = await res.json()
        
        if (data.success) {
          newUploads.push(data.file)
        } else {
          setError(data.error || "Upload failed")
        }
      } catch (err: any) {
        setError(err.message || "Upload failed")
      }
    }

    setUploadedFiles(prev => [...prev, ...newUploads])
    onUpload([...uploadedFiles, ...newUploads])
    setUploading(false)

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [preview.length, maxFiles, category, assetId, uploadedFiles, onUpload])

  const removeImage = (index: number) => {
    const newPreviews = [...preview]
    newPreviews.splice(index, 1)
    setPreview(newPreviews)

    const newUploads = [...uploadedFiles]
    if (index < uploadedFiles.length) {
      // TODO: Delete from server
      newUploads.splice(index, 1)
      setUploadedFiles(newUploads)
      onUpload(newUploads)
    }
  }

  return (
    <div className="space-y-4">
      {/* Preview Grid */}
      {preview.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {preview.map((src, idx) => (
            <div key={idx} className="relative aspect-square group">
              <Image 
                src={src} 
                alt={`Upload ${idx + 1}`}
                fill
                className="object-cover rounded-lg border border-white/10"
                unoptimized
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>
              {idx < uploadedFiles.length && (
                <div className="absolute bottom-1 right-1 p-1 bg-green-500/80 rounded-full">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {preview.length < maxFiles && (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
            data-testid="image-upload-input"
          />
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            uploading ? "border-blue-500/50 bg-blue-500/5" : "border-white/20 hover:border-white/40"
          }`}>
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin mb-2" />
                <p className="text-white/60 text-sm">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-5 w-5 text-white/40" />
                  <ImageIcon className="h-5 w-5 text-white/40" />
                </div>
                <p className="text-white/60 text-sm">
                  Drop images here or click to upload
                </p>
                <p className="text-white/40 text-xs mt-1">
                  {maxFiles - preview.length} more images allowed (max 5MB each)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  )
}
