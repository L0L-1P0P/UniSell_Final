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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteUser } from "@/app/admin/actions"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle } from "lucide-react"

interface DeleteUserDialogProps {
  userId: string
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({ userId, userName, open, onOpenChange }: DeleteUserDialogProps) {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (confirmation !== "DELETE") {
      setError("Please type DELETE to confirm")
      return
    }

    setIsSubmitting(true)
    setError("")

    const result = await deleteUser(userId)

    if (result.success) {
      onOpenChange(false)
      setConfirmation("")
      router.push('/admin/users')
    } else {
      setError(result.error || "Failed to delete user")
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setConfirmation("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1e1e1e]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete User - PERMANENT
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete <strong>{userName}</strong>'s account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
              The following will be permanently deleted:
            </h4>
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
              <li>User profile and account</li>
              <li>All listings and item images</li>
              <li>All messages and conversations</li>
              <li>All reviews and ratings</li>
              <li>All reports (made by and against)</li>
              <li>All favorites</li>
              <li>IC/Identity documents</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <strong>DELETE</strong> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmation}
              onChange={(e) => {
                setConfirmation(e.target.value)
                setError("")
              }}
              placeholder="DELETE"
              disabled={isSubmitting}
            />
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
            disabled={isSubmitting || confirmation !== "DELETE"}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
