"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Upload, X } from "lucide-react"
import { createAnnouncement } from "@/app/admin/announcements-actions"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function AnnouncementUploadDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed")
      return
    }

    setError("")
    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError("Please select an image")
      return
    }

    setIsUploading(true)
    setError("")

    const formData = new FormData()
    formData.append("image", selectedFile)
    formData.append("title", title)

    const result = await createAnnouncement(formData)

    if (result.success) {
      // Reset form
      setTitle("")
      setSelectedFile(null)
      setPreviewUrl("")
      setOpen(false)
      router.refresh()
    } else {
      setError(result.error || "Upload failed")
    }

    setIsUploading(false)
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#00dee8] text-black hover:bg-[#00c5d0]">
          <Plus className="h-4 w-4 mr-2" />
          Upload Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#1e1e1e]">
        <DialogHeader>
          <DialogTitle>Upload Announcement Image</DialogTitle>
          <DialogDescription>
            Upload an image for the home page carousel (recommended: 1920x500px)
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Image File</Label>
            {!selectedFile ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-[#00dee8] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload image</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, or WebP (max 5MB)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1920x500px
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative">
                {previewUrl && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFile}
                  className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUploading}
              className="bg-[#1e1e1e] text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="bg-[#00dee8] text-black hover:bg-[#00c5d0]"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
