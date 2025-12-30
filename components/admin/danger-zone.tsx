"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Ban, Trash2 } from "lucide-react"
import { BanDialog } from "./ban-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"

interface DangerZoneProps {
  userId: string
  userName: string
}

export function DangerZone({ userId, userName }: DangerZoneProps) {
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <div className="pt-6 border-t border-red-200 dark:border-red-900">
        <h3 className="text-lg font-semibold font-[TitleFont] text-red-600 mb-4">
          Danger Zone
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border-2 border-yellow-500 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
            <div>
              <h4 className="font-medium">Ban User</h4>
              <p className="text-sm text-muted-foreground">
                Temporarily or permanently suspend this user's account
              </p>
            </div>
            <Button
              onClick={() => setBanDialogOpen(true)}
              variant="default"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Ban className="h-4 w-4 mr-2" />
              Ban
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border-2 border-red-500 rounded-lg bg-red-50 dark:bg-red-900/10">
            <div>
              <h4 className="font-medium text-red-600">Delete User</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this user and all their data
              </p>
            </div>
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              variant="default"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <BanDialog
        userId={userId}
        userName={userName}
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
      />

      <DeleteUserDialog
        userId={userId}
        userName={userName}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}
