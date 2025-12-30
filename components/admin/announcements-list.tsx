"use client"
// lists announcements

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GripVertical, Eye, EyeOff, Trash2 } from "lucide-react"
import { toggleAnnouncementStatus, deleteAnnouncement, updateAnnouncementOrder } from "@/app/admin/announcements-actions"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Announcement {
  id: string
  title: string | null
  image_url: string
  display_order: number
  is_active: boolean
  created_at: string
}

interface AnnouncementsListProps {
  announcements: Announcement[]
}

export function AnnouncementsList({ announcements: initialAnnouncements }: AnnouncementsListProps) {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleStatus = async (id: string) => {
    const result = await toggleAnnouncementStatus(id)
    if (result.success) {
      // Update local state
      setAnnouncements(prev => prev.map(a => 
        a.id === id ? { ...a, is_active: !a.is_active } : a
      ))
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    setIsDeleting(true)
    const result = await deleteAnnouncement(deleteId)
    
    if (result.success) {
      setAnnouncements(prev => prev.filter(a => a.id !== deleteId))
      router.refresh()
    }
    
    setIsDeleting(false)
    setDeleteId(null)
  }

  const moveUp = async (index: number) => {
    if (index === 0) return

    const newAnnouncements = [...announcements]
    const [moved] = newAnnouncements.splice(index, 1)
    newAnnouncements.splice(index - 1, 0, moved)

    // Update display_order
    const updates = newAnnouncements.map((a, i) => ({ id: a.id, order: i }))
    await updateAnnouncementOrder(updates)

    setAnnouncements(newAnnouncements)
    router.refresh()
  }

  const moveDown = async (index: number) => {
    if (index === announcements.length - 1) return

    const newAnnouncements = [...announcements]
    const [moved] = newAnnouncements.splice(index, 1)
    newAnnouncements.splice(index + 1, 0, moved)

    // Update display_order
    const updates = newAnnouncements.map((a, i) => ({ id: a.id, order: i }))
    await updateAnnouncementOrder(updates)

    setAnnouncements(newAnnouncements)
    router.refresh()
  }

  return (
    <>
      <div className="grid gap-4">
        {announcements.map((announcement, index) => (
          <div
            key={announcement.id}
            className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-xl p-4 flex items-center gap-4"
          >
            {/* Drag Handle & Order */}
            <div className="flex flex-col items-center gap-1">
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
              <div className="text-sm font-semibold text-muted-foreground">
                #{index + 1}
              </div>
            </div>

            {/* Image Preview */}
            <div className="relative w-40 h-24 rounded-lg overflow-hidden border bg-muted shrink-0">
              <Image
                src={announcement.image_url}
                alt={announcement.title || "Announcement"}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">
                  {announcement.title || "Untitled Announcement"}
                </h3>
                <Badge variant={announcement.is_active ? "default" : "outline"} className={announcement.is_active ? "bg-green-500" : ""}>
                  {announcement.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Created {new Date(announcement.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Reorder Buttons */}
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="h-7 px-2"
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveDown(index)}
                  disabled={index === announcements.length - 1}
                  className="h-7 px-2"
                >
                  ↓
                </Button>
              </div>

              {/* Toggle Active */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(announcement.id)}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                {announcement.is_active ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>

              {/* Delete */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteId(announcement.id)}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the announcement image from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#1e1e1e] text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
