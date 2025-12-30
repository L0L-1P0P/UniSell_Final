import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { ItemCard } from "@/components/item-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart, Trash2, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { toggleFavorite } from "@/app/favorites/actions"
import { BackButton } from "@/components/back-button"
import { checkBanStatus } from "@/utils/ban-check"

export default async function FavoritesPage() {
  await checkBanStatus()
  
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch favorited items
  const { data: favoriteItems, error } = await supabase
    .from("items")
    .select(`
      *,
      seller:profiles!seller_id(full_name, campus),
      favorites!inner(*)
    `)
    .eq("favorites.user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching favorites:", error)
  }

  // Time formatting helper
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

  // Helper for category colors
  const getCategoryColor = (category: string) => {
    const categoryLower = category ? category.toLowerCase() : ''
    
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
      return { bg: 'bg-[#0d9488]/10 dark:bg-[#99E1D9]/10', text: 'text-[#0d9488] dark:text-[#99E1D9]' }
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Back Button */}
        <BackButton />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-[TitleFont] tracking-wide font-normal">
            My Favorites
          </h1>
          <p className="text-muted-foreground mt-2">
            Items you've saved for later
          </p>
        </div>

        {/* Content */}
        {favoriteItems && favoriteItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteItems.map((item) => {
              // Check if item is unavailable (deleted or sold)
              if (item.status === 'deleted' || item.status === 'sold') {
                const categoryColors = getCategoryColor(item.category)
                
                return (
                  <div key={item.id} className="relative flex flex-col h-full overflow-hidden transition-all duration-300 border border-border/50 rounded-xl bg-muted/30 text-card-foreground shadow-sm">
                    {/* Faded Background Image */}
                    <div className="relative aspect-square">
                      <Image 
                        src={item.images?.[0] || '/placeholder.png'} 
                        fill 
                        className="object-cover grayscale opacity-50" 
                        alt={item.title || "Unavailable Item"} 
                      />
                      
                      {/* Status Badge Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/20 backdrop-blur-[1px]">
                         <Badge variant={item.status === 'deleted' ? "destructive" : "secondary"} className="z-10 text-gray-300 dark:text-gray-700 text-md px-3 py-1 shadow-md dark:bg-gray-200 bg-gray-700 hover:bg-gray-600 dark:hover:bg-gray-300 select-none">
                          {item.status === 'deleted' ? 'DELETED' : 'SOLD'}
                        </Badge>

                        {/* The Explicit Remove Button */}
                        <form action={async () => {
                          "use server"
                          await toggleFavorite(item.id)
                        }} className="z-20">
                          <Button variant="destructive" size="sm" className="shadow-lg transition-transform cursor-pointer pointer-events-auto rounded-full bg-red-500 hover:bg-red-700">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </form>
                      </div>
                    </div>

                    {/* Content Section - Matches ItemCard structure but muted */}
                    <div className="p-4 pt-2 pb-2 flex flex-col gap-2 flex-1 opacity-60">
                      {/* Title */}
                      <h3 className="font-semibold text-sm sm:text-lg md:text-xl line-clamp-1 pointer-events-none" title={item.title}>
                        {item.title}
                      </h3>
                      
                      {/* Price */}
                      <p className="text-sm sm:text-base font-bold text-muted-foreground pointer-events-none">
                        {item.price === 0 ? "Free" : `RM ${item.price.toFixed(2)}`}
                      </p>

                      {/* Badges Row */}
                      <div className="flex flex-wrap gap-1.5 mt-1 pointer-events-none">
                        <Badge variant="outline" className="hidden sm:inline-flex text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 border-muted-foreground/30 text-muted-foreground whitespace-nowrap">
                          {item.condition}
                        </Badge>
                        <Badge variant="secondary" className={`text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 whitespace-nowrap ${categoryColors.bg} ${categoryColors.text} opacity-70`}>
                          {item.category}
                        </Badge>
                        {item.sub_category && (
                          <Badge variant="secondary" className="hidden sm:inline-flex text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 bg-muted text-muted-foreground whitespace-nowrap">
                            {item.sub_category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Footer - Full width border */}
                    <div className="border-t border-gray-300/50 dark:border-gray-700/30 opacity-60">
                      <div className="px-4 py-2 sm:py-3 flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground pointer-events-none">
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
                )
              }
              
              // Render normal card for available items
              return (
                <ItemCard 
                  key={item.id} 
                  item={item}
                  isFavorited={true}
                />
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Go explore and save items you're interested in!
            </p>
            <Button asChild className="bg-[#00dee8] text-black hover:bg-[#00dee8]/80">
              <Link href="/">Browse Listings</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
