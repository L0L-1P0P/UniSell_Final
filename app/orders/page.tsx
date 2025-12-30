import { createClient } from "@/utils/supabase/server"
import { checkBanStatus } from "@/utils/ban-check"
import { redirect } from "next/navigation"
import { ItemCard } from "@/components/item-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Item } from "@/types"
import { BackButton } from "@/components/back-button"

export default async function OrdersPage() {
  await checkBanStatus()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch items where user is the buyer
  const { data: purchasedItems } = await supabase
    .from('items')
    .select(`
      *,
      seller:profiles!seller_id(full_name, campus)
    `)
    .eq('buyer_id', user.id)
    .eq('status', 'sold')
    .order('created_at', { ascending: false })

  // Check which items have reviews
  const itemIds = purchasedItems?.map(item => item.id) || []
  const { data: reviews } = await supabase
    .from('reviews')
    .select('item_id')
    .in('item_id', itemIds)

  const reviewedItemIds = new Set(reviews?.map(r => r.item_id) || [])

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] space-y-8">
      <BackButton />
      <h1 className="text-3xl font-[TitleFont] font-normal">Order History</h1>
      
      {purchasedItems && purchasedItems.length > 0 ? (
        <div className="space-y-8">
          <p className="text-muted-foreground">
            You have purchased {purchasedItems.length} {purchasedItems.length === 1 ? 'item' : 'items'}
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {purchasedItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <ItemCard item={item as Item} isFavorited={false} />
                {!reviewedItemIds.has(item.id) && (
                  <Button
                    asChild
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    size="sm"
                  >
                    <Link href={`/chat?itemId=${item.id}`}>
                      Leave Review
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-xl text-muted-foreground mb-4">No purchases yet</p>
          <p className="text-sm text-muted-foreground">
            Items you buy will appear here
          </p>
          <Button asChild className="mt-6 bg-cyan-600 hover:bg-cyan-700">
            <Link href="/">Browse Items</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
