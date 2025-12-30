'use client'

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitReview } from "@/app/reviews/actions"

interface ReviewFormProps {
  itemId: string
  sellerId: string
  sellerName: string
  onSuccess?: () => void
}

export function ReviewForm({ itemId, sellerId, sellerName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    setIsSubmitting(true)
    const result = await submitReview(itemId, sellerId, rating)
    setIsSubmitting(false)

    if (result.error) {
      alert(result.error)
    } else {
      setSubmitted(true)
      onSuccess?.()
    }
  }

  if (submitted) {
    return (
      <div className="p-6 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800 text-center">
        <p className="text-green-700 dark:text-green-300 font-semibold">
          ✓ Thank you for your review!
        </p>
      </div>
    )
  }

  return (
    <div className="border-t border-border/40 p-6 bg-muted/30 shrink-0">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center">
          <h3 className="font-semibold mb-2">Rate your experience with {sellerName}</h3>
          
          {/* Star Rating */}
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>
    </div>
  )
}
