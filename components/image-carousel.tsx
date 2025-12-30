"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageCarouselProps {
  images: string[]
  alt: string
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (!images || images.length === 0) {
    return <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">No images</div>
  }

  return (
    <div className="relative">
      <div className="aspect-video overflow-hidden bg-muted">
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`${alt} - Image ${currentIndex + 1}`}
          className="h-full w-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full 
              bg-[#00dee8]/20 dark:bg-[#00dee8]/20 
              border border-[#00dee8]/60 dark:border-[#00dee8]/50
              backdrop-blur-md
              shadow-lg
              hover:bg-[#00dee8]/5 0 hover:border-[#00dee8] hover:scale-105
              dark:hover:bg-[#00dee8]/50 dark:hover:border-[#00dee8]
              transition-all duration-300 ease-out"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5 text-[#00dee8] drop-shadow-lg" />
            <span className="sr-only">Previous image</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full 
              bg-[#00dee8]/20 dark:bg-[#00dee8]/20 
              border border-[#00dee8]/60 dark:border-[#00dee8]/50
              backdrop-blur-md
              shadow-lg
              hover:bg-[#00dee8]/50 hover:border-[#00dee8] hover:scale-105
              dark:hover:bg-[#00dee8]/50 dark:hover:border-[#00dee8]
              transition-all duration-300 ease-out"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5 text-[#00dee8] drop-shadow-lg" />
            <span className="sr-only">Next image</span>
          </Button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentIndex ? "bg-primary w-4" : "bg-background/60",
                )}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
