"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleFavorite } from "@/app/favorites/actions"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  itemId: string
  initialFavorited?: boolean
  className?: string
}

export function FavoriteButton({ itemId, initialFavorited = false, className }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    // Optimistic UI update
    const previousState = isFavorited
    setIsFavorited(!isFavorited)
    setIsLoading(true)

    try {
      const result = await toggleFavorite(itemId)
      
      if (result.error) {
        // Revert on error
        setIsFavorited(previousState)
        console.error("Error toggling favorite:", result.error)
      }
    } catch (error) {
      // Revert on error
      setIsFavorited(previousState)
      console.error("Error toggling favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="lg" 
      className={cn(
        "w-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]",
        isFavorited 
          ? "border-2 border-red-500 text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30" 
          : "border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500",
        className
      )}
      onClick={handleToggle}
      disabled={isLoading}
    >
      <Heart className={cn("mr-2 h-5 w-5", isFavorited && "fill-current")} />
      {isFavorited ? "Favorited" : "Add to Favorites"}
    </Button>
  )
}
