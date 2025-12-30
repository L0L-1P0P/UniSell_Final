"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { RejectionDialog } from "@/components/admin/rejection-dialog"
import { approveUser } from "@/app/admin/actions"
import { useRouter } from "next/navigation"

interface UserActionsProps {
  userId: string
  userName: string
}

export function UserActions({ userId, userName }: UserActionsProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    const result = await approveUser(userId)
    
    if (result.success) {
      router.push('/admin/users')
    } else {
      alert(result.error || 'Failed to approve user')
      setIsApproving(false)
    }
  }

  return (
    <>
      <div className="pt-6 border-t flex items-center gap-4">
        <Button
          onClick={handleApprove}
          disabled={isApproving}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {isApproving ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5 mr-2" />
          )}
          {isApproving ? "Approving..." : "Approve User"}
        </Button>
        
        <Button
          onClick={() => setRejectDialogOpen(true)}
          variant="default"
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          <XCircle className="h-5 w-5 mr-2" />
          Reject User
        </Button>
      </div>

      <RejectionDialog
        userId={userId}
        userName={userName}
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
      />
    </>
  )
}
