"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BanDialog } from "@/components/admin/ban-dialog"
import { updateReportStatus, dismissReport, hideListing } from "@/app/admin/actions"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, X, EyeOff, Ban } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ReportActionsProps {
  reportId: string
  reportStatus: string
  reportType: "item" | "user"
  targetUserId?: string
  targetUserName?: string
  targetItemId?: string
  targetItemTitle?: string
}

export function ReportActions({
  reportId,
  reportStatus,
  reportType,
  targetUserId,
  targetUserName,
  targetItemId,
  targetItemTitle,
}: ReportActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Ban Dialog state
  const [showBanDialog, setShowBanDialog] = useState(false)

  // Hide Listing Dialog state
  const [showHideDialog, setShowHideDialog] = useState(false)
  const [hideReason, setHideReason] = useState("")

  // Dismiss Dialog state
  const [showDismissDialog, setShowDismissDialog] = useState(false)

  const handleMarkAsReviewed = async () => {
    setIsLoading(true)
    setError("")
    const result = await updateReportStatus(reportId, "reviewed")
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || "Failed to update status")
    }
    setIsLoading(false)
  }

  const handleDismiss = async () => {
    setIsLoading(true)
    setError("")
    const result = await dismissReport(reportId)
    if (result.success) {
      setShowDismissDialog(false)
      router.push("/admin/reports")
      router.refresh()
    } else {
      setError(result.error || "Failed to dismiss report")
      setIsLoading(false)
    }
  }

  const handleHideListing = async () => {
    if (!targetItemId) return
    
    if (hideReason.trim().length < 10) {
      setError("Reason must be at least 10 characters")
      return
    }

    setIsLoading(true)
    setError("")
    
    const result = await hideListing(targetItemId, hideReason)
    
    if (result.success) {
      // Update report status to actioned
      await updateReportStatus(reportId, "actioned")
      setShowHideDialog(false)
      router.refresh()
    } else {
      setError(result.error || "Failed to hide listing")
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Mark as Reviewed */}
        {reportStatus === "pending" && (
          <Button
            onClick={handleMarkAsReviewed}
            disabled={isLoading}
            variant="default"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Mark as Reviewed
          </Button>
        )}

        {/* Dismiss Report */}
        {reportStatus !== "dismissed" && (
          <Button
            onClick={() => setShowDismissDialog(true)}
            disabled={isLoading}
            variant="default"
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
            Dismiss Report
          </Button>
        )}

        {/* Quick Actions based on report type */}
        {reportStatus !== "actioned" && reportStatus !== "dismissed" && (
          <>
            {reportType === "item" && targetItemId && (
              <Button
                onClick={() => setShowHideDialog(true)}
                disabled={isLoading}
                variant="default"
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
              >
                <EyeOff className="h-4 w-4" />
                Hide Listing
              </Button>
            )}

            {reportType === "user" && targetUserId && targetUserName && (
              <Button
                onClick={() => setShowBanDialog(true)}
                disabled={isLoading}
                variant="default"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              >
                <Ban className="h-4 w-4" />
                Ban User
              </Button>
            )}
          </>
        )}
      </div>

      {/* Ban Dialog */}
      {reportType === "user" && targetUserId && targetUserName && (
        <BanDialog
          userId={targetUserId}
          userName={targetUserName}
          open={showBanDialog}
          onOpenChange={setShowBanDialog}
        />
      )}

      {/* Hide Listing Dialog */}
      <AlertDialog open={showHideDialog} onOpenChange={setShowHideDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hide Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Hide "{targetItemTitle}" from public view. The owner will see the reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2 py-4">
            <Label htmlFor="hide-reason">Reason for hiding *</Label>
            <Textarea
              id="hide-reason"
              placeholder="e.g., Violates community guidelines, inappropriate content..."
              value={hideReason}
              onChange={(e) => {
                setHideReason(e.target.value)
                setError("")
              }}
              className="min-h-[100px]"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {hideReason.length} / 10 minimum characters
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleHideListing()
              }}
              disabled={isLoading || hideReason.trim().length < 10}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Hide
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dismiss Confirmation Dialog */}
      <AlertDialog open={showDismissDialog} onOpenChange={setShowDismissDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dismiss Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to dismiss this report? This action marks the report as dismissed and no further action will be taken.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDismiss()
              }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Dismiss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
