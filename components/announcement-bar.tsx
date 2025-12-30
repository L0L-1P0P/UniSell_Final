'use client'

import { useState } from "react"
import { X } from "lucide-react"

interface AnnouncementBarProps {
  initialContent: string | null
}

export function AnnouncementBar({ initialContent }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(!!initialContent)

  if (!isVisible || !initialContent) return null

  return (
    <div className="group bg-[#00adb5] dark:bg-[#00dee8] text-primary-foreground px-4 py-2 text-sm font-medium sticky top-16 z-40 transition-all duration-300 ease-in-out">
      <div className="container mx-auto flex items-center justify-start pr-8">
        <p className="truncate group-hover:whitespace-normal group-hover:text-clip group-hover:overflow-visible w-full cursor-default transition-all duration-300 ease-in-out" title={initialContent}>
          {initialContent}
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
