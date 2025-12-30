"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { approveListing } from "@/app/admin/actions"
import { useRouter } from "next/navigation"
import { ListingRejectionDialog } from "@/components/admin/listing-rejection-dialog"

interface ApproveButtonProps {
  listingId: string
}

export function ApproveButton({ listingId }: ApproveButtonProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState("")

  const handleApprove = async () => {
    setIsApproving(true)
    setError("")

    const result = await approveListing(listingId)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || "Failed to approve listing")
      setIsApproving(false)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleApprove}
          disabled={isApproving}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <CheckCircle className="mr-2 h-5 w-5" />
          Approve Listing
        </Button>
        <Button
          onClick={() => setIsDialogOpen(true)}
          disabled={isApproving}
          variant="default"
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          Reject Listing
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      <ListingRejectionDialog
        listingId={listingId}
        listingTitle="this listing"
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}
