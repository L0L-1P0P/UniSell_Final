import { createClient } from "@/utils/supabase/server"
import { checkBanStatus } from "@/utils/ban-check"
import { redirect } from "next/navigation"
import { Item } from "@/types"
import { ItemCard } from "@/components/item-card"
import { getFavoriteIds } from "@/app/favorites/actions"
import { SearchBar } from "@/components/search-bar"
import { SearchFilters } from "@/components/search-filters"
import { SearchSort } from "@/components/search-sort"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string, category?: string, sub_category?: string, sort?: string }> }) {
  await checkBanStatus()
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parse Search Params
  const query = (await searchParams)?.q || ''
  const category = (await searchParams)?.category || 'All'
  const subCategory = (await searchParams)?.sub_category || 'All'
  const sort = (await searchParams)?.sort || 'date_desc'

  // Base Query
  let itemsQuery = supabase
    .from('items')
    .select(`
      *,
      seller:profiles!seller_id(full_name, campus)
    `)
    .eq('status', 'available')

  // Apply Search Filter
  if (query) {
    itemsQuery = itemsQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  }

  // Apply Category Filter
  if (category && category !== 'All') {
    itemsQuery = itemsQuery.eq('category', category)
  }

  // Apply Subcategory Filter
  if (subCategory && subCategory !== 'All') {
    itemsQuery = itemsQuery.eq('sub_category', subCategory)
  }

  // Apply Sorting
  switch (sort) {
    case 'price_asc':
      itemsQuery = itemsQuery.order('price', { ascending: true })
      break
    case 'price_desc':
      itemsQuery = itemsQuery.order('price', { ascending: false })
      break
    case 'date_asc':
      itemsQuery = itemsQuery.order('created_at', { ascending: true })
      break
    case 'date_desc':
    default:
      itemsQuery = itemsQuery.order('created_at', { ascending: false })
      break
  }

  const { data: items } = await itemsQuery.returns<Item[]>()

  // Fetch user's favorite IDs
  const favoriteObjects = await getFavoriteIds()
  const favoriteIds = favoriteObjects.map(f => f.id)


  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <Button variant="ghost" asChild className="font-[TitleFont] font-normal">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="max-w-4xl mx-auto">
            <SearchBar onSearchPage={true} />
          </div>
        </div>

        {/* Filters and Sort Row */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <SearchFilters />
            </div>
            <SearchSort />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-[TitleFont] font-normal mb-2">
              {query ? `Search results for "${query}"` : "Search Results"}
            </h1>
            <p className="text-muted-foreground font-[TitleFont] font-normal">
              {items && items.length > 0 
                ? `Found ${items.length} ${items.length === 1 ? 'item' : 'items'}`
                : 'No items found'}
            </p>
          </div>
          
          {(query || category !== 'All' || subCategory !== 'All') && (
            <Button variant="outline" asChild className="font-[TitleFont] font-normal">
              <Link href="/search">Clear filters</Link>
            </Button>
          )}
        </div>

        {/* Results */}
        {items && items.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {items.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item}
                isFavorited={favoriteIds.includes(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col items-center justify-center py-12 text-center p-6">
              <p className="text-lg text-muted-foreground font-[TitleFont] font-normal mb-4">
                No items found matching your search
              </p>
              <Button asChild className="bg-[#00dee8] text-black hover:bg-[#00dee8]/80 font-[TitleFont] font-normal">
                <Link href="/">Browse all items</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
