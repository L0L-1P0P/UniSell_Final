"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { permanentlyDeleteListing } from "@/app/admin/actions"
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

interface PermanentDeleteButtonProps {
  listingId: string
  listingTitle: string
  hasConversations: boolean
}

export function PermanentDeleteButton({ listingId, listingTitle, hasConversations }: PermanentDeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setIsDeleting(true)
    setError("")
    setShowDeleteDialog(false)

    const result = await permanentlyDeleteListing(listingId)

    if (result.success) {
      router.push('/admin/listings')
      router.refresh()
    } else {
      setError(result.error || "Failed to delete listing")
      setIsDeleting(false)
    }
  }

  if (hasConversations) {
    return (
      <div className="space-y-3">
        <Button
          disabled
          variant="default"
          className="opacity-50 cursor-not-allowed bg-red-600"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Delete Permanently (Not Available)
        </Button>
        <p className="text-sm text-muted-foreground">
          This listing cannot be permanently deleted because it has active conversations. 
          Conversations must be deleted by both parties first.
        </p>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setShowDeleteDialog(true)}
        disabled={isDeleting}
        variant="default"
        className="bg-red-600 hover:bg-red-700"
      >
        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Trash2 className="mr-2 h-5 w-5" />
        Delete Permanently
      </Button>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete this listing?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>"{listingTitle}" will be <strong>permanently removed</strong> from the database.</div>
                <div className="font-medium text-destructive">This action CANNOT be undone.</div>
                <div className="text-sm">All associated data including images and metadata will be deleted.</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
