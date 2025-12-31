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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { banUser } from "@/app/admin/actions"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface BanDialogProps {
  userId: string
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DURATIONS = [
  { value: '1day', label: '1 Day' },
  { value: '3days', label: '3 Days' },
  { value: '1week', label: '1 Week' },
  { value: '1month', label: '1 Month' },
  { value: 'permanent', label: 'Permanent' },
]

export function BanDialog({ userId, userName, open, onOpenChange }: BanDialogProps) {
  const router = useRouter()
  const [duration, setDuration] = useState("1week")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const getExpiryPreview = () => {
    const now = new Date()
    switch (duration) {
      case '1day':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toLocaleString()
      case '3days':
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleString()
      case '1week':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleString()
      case '1month':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleString()
      case 'permanent':
        return 'Never (Permanent)'
      default:
        return ''
    }
  }

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters")
      return
    }

    setIsSubmitting(true)
    setError("")

    const result = await banUser(userId, duration, reason)

    if (result.success) {
      onOpenChange(false)
      setDuration("1week")
      setReason("")
      router.push('/admin/users')
    } else {
      setError(result.error || "Failed to ban user")
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setDuration("1week")
    setReason("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1e1e1e]">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Ban {userName} from accessing the platform. They will see the ban reason.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Ban Duration *</Label>
            <Select value={duration} onValueChange={setDuration} disabled={isSubmitting}>
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map(d => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Expires: {getExpiryPreview()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ban-reason">Ban Reason *</Label>
            <Textarea
              id="ban-reason"
              placeholder="e.g., Inappropriate behavior, spam, violating community guidelines..."
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
            Confirm Ban
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
