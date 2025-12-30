import { createClient } from "@/utils/supabase/server"
import { getFavoriteIds } from "@/app/favorites/actions"
import { ItemCard } from "@/components/item-card"
import { Item } from "@/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export async function ItemsGrid() {
  const supabase = await createClient()
  
  // Fetch items
  const { data: items } = await supabase
    .from('items')
    .select(`
      *,
      seller:profiles!seller_id(full_name, campus)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .returns<Item[]>()

  // Fetch user's favorite IDs
  const favoriteObjects = await getFavoriteIds()
  const favoriteIds = favoriteObjects.map(f => f.id)

  if (!items || items.length === 0) {
    return (
      <div className="glass-card rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center p-6">
          <p className="text-lg text-muted-foreground">No listings found</p>
          <Button asChild className="mt-4 bg-[#00dee8] text-black hover:bg-[#00dee8]/80">
            <Link href="/sell">Post the first item</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mt-12">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {items.map((item) => (
          <ItemCard 
            key={item.id} 
            item={item}
            isFavorited={favoriteIds.includes(item.id)}
          />
        ))}
      </div>
    </div>
  )
}
