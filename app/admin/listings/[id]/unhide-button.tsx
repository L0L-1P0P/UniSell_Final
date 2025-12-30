"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Loader2 } from "lucide-react"
import { unhideListing } from "@/app/admin/actions"
import { useRouter } from "next/navigation"

interface UnhideButtonProps {
  listingId: string
}

export function UnhideButton({ listingId }: UnhideButtonProps) {
  const router = useRouter()
  const [isUnhiding, setIsUnhiding] = useState(false)
  const [error, setError] = useState("")

  const handleUnhide = async () => {
    setIsUnhiding(true)
    setError("")

    const result = await unhideListing(listingId)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || "Failed to unhide listing")
      setIsUnhiding(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleUnhide}
        disabled={isUnhiding}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isUnhiding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Eye className="mr-2 h-5 w-5" />
        Make Visible Again
      </Button>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </>
  )
}
