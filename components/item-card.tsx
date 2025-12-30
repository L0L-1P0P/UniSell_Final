"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin } from "lucide-react"
import { toggleFavorite } from "@/app/favorites/actions"
import { useState } from "react"

interface ItemCardProps {
  item: any
  isFavorited?: boolean
}

export function ItemCard({ item, isFavorited = false }: ItemCardProps) {
  const [isFav, setIsFav] = useState(isFavorited)
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + "y ago"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + "mo ago"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + "d ago"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + "h ago"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + "m ago"
    return "just now"
  }

  // Category color mapping based on category-card.tsx
  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase()
    
    if (categoryLower.includes('electronic')) {
      return { bg: 'bg-[#005bb5]/10 dark:bg-[#A2D2FF]/10', text: 'text-[#005bb5] dark:text-[#A2D2FF]' }
    } else if (categoryLower.includes('fashion') || categoryLower.includes('clothing')) {
      return { bg: 'bg-[#d6336c]/10 dark:bg-[#FFB7B2]/10', text: 'text-[#d6336c] dark:text-[#FFB7B2]' }
    } else if (categoryLower.includes('furniture') || categoryLower.includes('home')) {
      return { bg: 'bg-[#d97706]/10 dark:bg-[#FBC78F]/10', text: 'text-[#d97706] dark:text-[#FBC78F]' }
    } else if (categoryLower.includes('book')) {
      return { bg: 'bg-[#059669]/10 dark:bg-[#B0F2C2]/10', text: 'text-[#059669] dark:text-[#B0F2C2]' }
    } else if (categoryLower.includes('room') || categoryLower.includes('rental')) {
      return { bg: 'bg-[#703aed]/10 dark:bg-[#E0BBE4]/10', text: 'text-[#703aed] dark:text-[#E0BBE4]' }
    } else if (categoryLower.includes('vehicle') || categoryLower.includes('transport')) {
      return { bg: 'bg-[#F6BE00]/10 dark:bg-[#FDFD96]/10', text: 'text-[#F6BE00] dark:text-[#FDFD96]' }
    } else {
      // Others (Teal)
      return { bg: 'bg-[#0d9488]/10 dark:bg-[#99E1D9]/10', text: 'text-[#0d9488] dark:text-[#99E1D9]' }
    }
  }

  const categoryColors = item.category ? getCategoryColor(item.category) : { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' }

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Optimistic update
    setIsFav(!isFav)
    
    try {
      await toggleFavorite(item.id)
    } catch (error) {
      // Revert on error
      setIsFav(isFav)
      console.error("Error toggling favorite:", error)
    }
  }

  return (
    <Link href={`/items/${item.id}`} className="group h-full block">
      <div className="flex flex-col h-full overflow-hidden transition-all duration-300 border border-gray-200/60 dark:border-gray-700/60 rounded-xl bg-white dark:bg-[#1e1e1e] text-card-foreground shadow-md hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-muted">
          <Image 
            src={item.images?.[0] || '/placeholder.png'} 
            alt={item.title} 
            fill 
            className="object-cover" 
          />
          {/* Heart Button Positioned Top Right */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-[#00dee8] hover:text-black transition-colors backdrop-blur-sm"
          >
            <Heart size={16} className={isFav ? "fill-current text-red-500" : ""} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 pt-2 pb-2 flex flex-col gap-2 flex-1">
          {/* Title */}
          <h3 className="font-[TitleFont] tracking-wide font-normal text-sm sm:text-lg md:text-xl line-clamp-1 group-hover:text-[#00dee8] transition-colors" title={item.title}>
            {item.title}
          </h3>
          
          {/* Price */}
          <p className="text-sm sm:text-base font-[TitleFont] tracking-wide text-[#00dee8]">
            {item.price === 0 ? "Free" : `RM ${item.price.toFixed(2)}`}
          </p>

          {/* Badges Row: Condition | Category | Subcategory */}
          <div className="flex flex-wrap gap-1.5 mt-0">
            <Badge variant="outline" className="hidden sm:inline-flex text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 border-muted-foreground/30 text-muted-foreground whitespace-nowrap font-[TitleFont] tracking-wide font-normal">
              {item.condition}
            </Badge>
            <Badge variant="secondary" className={`text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 whitespace-nowrap ${categoryColors.bg} ${categoryColors.text} hover:opacity-80 font-[TitleFont] tracking-wide font-normal`}>
              {item.category}
            </Badge>
            {item.sub_category && (
              <Badge variant="secondary" className="hidden sm:inline-flex text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 bg-muted text-muted-foreground hover:bg-muted/80 whitespace-nowrap font-[TitleFont] tracking-wide font-normal">
                {item.sub_category}
              </Badge>
            )}
          </div>
        </div>

        {/* Footer - Full width border */}
        <div className="border-t border-gray-300/70 dark:border-gray-700/30">
          <div className="px-4 py-2 sm:py-3 flex items-center justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            <div className="hidden sm:flex items-center gap-1">
              <span>{item.seller?.full_name || 'Unknown'}</span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {item.meetup_area && (
                <div className="hidden sm:flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{item.meetup_area}</span>
                </div>
              )}
              <span>{timeAgo(item.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
