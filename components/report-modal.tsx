'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { submitReport } from "@/app/reports/actions"
import { Flag, AlertCircle, CheckCircle2 } from "lucide-react"

interface ReportModalProps {
  type: 'listing' | 'user'
  id: string
  name: string
  trigger?: React.ReactNode
}

const LISTING_REASONS = [
  "Prohibited Item",
  "Counterfeit",
  "Scam",
  "Wrong Category",
  "Other"
]

const USER_REASONS = [
  "Harassment",
  "Suspicious Behavior",
  "Did not show up",
  "Scam attempt",
  "Other"
]

export function ReportModal({ type, id, name, trigger }: ReportModalProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const reasons = type === 'listing' ? LISTING_REASONS : USER_REASONS
  const title = type === 'listing' ? `Report Listing: ${name}` : `Report User: ${name}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason) {
      setFeedback({ type: 'error', message: 'Please select a reason' })
      return
    }

    setFeedback(null)
    setIsSubmitting(true)
    
    const result = await submitReport({
      type,
      id,
      reason,
      details
    })

    setIsSubmitting(false)

    if (result.error) {
      setFeedback({ type: 'error', message: result.error })
    } else {
      setFeedback({ 
        type: 'success', 
        message: 'Report submitted successfully. Thank you for keeping our community safe.' 
      })
      // Auto-close after 2 seconds
      setTimeout(() => {
        setOpen(false)
        setReason("")
        setDetails("")
        setFeedback(null)
      }, 2000)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset form when closing
      setReason("")
      setDetails("")
      setFeedback(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Flag className="mr-2 h-4 w-4" />
            Report {type === 'listing' ? 'Listing' : 'User'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-[#1e1e1e] border border-border">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          
          {/* Feedback Message */}
          {feedback && (
            <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              feedback.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium">{feedback.message}</p>
            </div>
          )}
          
          <div className="space-y-4 py-3">
            {/* Reason Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Reason for reporting *</Label>
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-0.5">
                {reasons.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      reason === r
                        ? 'bg-red-500 text-white shadow-sm hover:bg-red-600'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setReason(r)}
                  >
                    <span className="text-sm font-medium">{r}</span>
                  </button>
                ))}
              </RadioGroup>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <Label htmlFor="details" className="text-sm font-semibold">
                Additional details <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </Label>
              <Textarea
                id="details"
                placeholder="Provide any additional context..."
                value={details}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDetails(e.target.value)}
                rows={3}
                className="resize-none text-sm bg-gray-50 dark:bg-black placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="hover:bg-muted transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || feedback?.type === 'success'}
              className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Submitting...</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                <>
                  <Flag className="mr-1.5 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
