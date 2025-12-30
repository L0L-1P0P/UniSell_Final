"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EyeOff, Loader2 } from "lucide-react"
import { hideListing } from "@/app/admin/actions"
import { useRouter } from "next/navigation"
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

interface AdminListingActionsProps {
  listingId: string
  listingTitle: string
}

export function AdminListingActions({ listingId, listingTitle }: AdminListingActionsProps) {
  const router = useRouter()
  const [isHiding, setIsHiding] = useState(false)
  const [showHideDialog, setShowHideDialog] = useState(false)
  const [hideReason, setHideReason] = useState("")
  const [error, setError] = useState("")

  const handleHide = async () => {
    if (hideReason.trim().length < 10) {
      setError("Please provide a reason (minimum 10 characters)")
      return
    }

    setIsHiding(true)
    setError("")

    const result = await hideListing(listingId, hideReason)

    if (result.success) {
      setShowHideDialog(false)
      setHideReason("")
      router.refresh()
    } else {
      setError(result.error || "Failed to hide listing")
      setIsHiding(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setShowHideDialog(true)}
        disabled={isHiding}
        variant="default"
        className="bg-orange-600 hover:bg-orange-700"
      >
        {isHiding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <EyeOff className="mr-2 h-5 w-5" />
        Hide Listing
      </Button>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      {/* Hide Reason Dialog */}
      <Dialog open={showHideDialog} onOpenChange={setShowHideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hide this listing?</DialogTitle>
            <DialogDescription>
              Provide a reason for hiding "{listingTitle}". The seller will see this message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hideReason">Hide Reason</Label>
              <Textarea
                id="hideReason"
                placeholder="e.g., This listing violates our policy on prohibited items..."
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                className="min-h-[100px]"
                disabled={isHiding}
              />
              <p className="text-xs text-muted-foreground">
                {hideReason.length}/10 characters minimum
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="default"
              className="bg-gray-600 hover:bg-gray-700"
              onClick={() => {
                setShowHideDialog(false)
                setHideReason("")
                setError("")
              }}
              disabled={isHiding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleHide}
              disabled={isHiding || hideReason.trim().length < 10}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isHiding ? "Hiding..." : "Hide Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
