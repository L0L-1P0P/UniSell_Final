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
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { rejectListing } from "@/app/admin/actions"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ListingRejectionDialogProps {
  listingId: string
  listingTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ListingRejectionDialog({ listingId, listingTitle, open, onOpenChange }: ListingRejectionDialogProps) {
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters")
      return
    }

    setIsSubmitting(true)
    setError("")

    const result = await rejectListing(listingId, reason)

    if (result.success) {
      onOpenChange(false)
      setReason("")
      router.refresh()
    } else {
      setError(result.error || "Failed to reject listing")
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setReason("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1e1e1e]">
        <DialogHeader>
          <DialogTitle>Reject Listing</DialogTitle>
          <DialogDescription>
            Provide a clear reason for rejecting "{listingTitle}". The seller will see this message and can edit the listing to address your concerns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason *</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Images are blurry, description is unclear, item violates community guidelines..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError("")
              }}
              className="min-h-[120px]"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {reason.length} / 10 minimum characters
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="default"
            className="bg-gray-600 hover:bg-gray-700"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleSubmit}
            disabled={isSubmitting || reason.trim().length < 10}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
