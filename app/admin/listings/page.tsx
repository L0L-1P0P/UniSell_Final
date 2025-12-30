import { createClient } from "@/utils/supabase/server"
import { ListingManagementTabs } from "@/components/admin/listing-management-tabs"
import { redirect } from "next/navigation"

export default async function ListingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('usm_role')
    .eq('id', user.id)
    .single()
  
  if (currentUserProfile?.usm_role !== 'admin') {
    redirect('/')
  }

  const { tab } = await searchParams

  // Fetch pending listings (status = 'pending')
  const { data: pendingListings, error: pendingError } = await supabase
    .from('items')
    .select(`
      *,
      seller:profiles!seller_id(full_name, campus)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Fetch active listings (status = 'available' only)
  const { data: activeListings, error: activeError } = await supabase
    .from('items')
    .select(`
      *,
      seller:profiles!seller_id(full_name, campus)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })

  // Fetch hidden listings (status = 'sold', 'deleted', 'rejected', or 'hidden')
  const { data: hiddenListings, error: hiddenError } = await supabase
    .from('items')
    .select(`
      *,
      seller:profiles!seller_id(full_name, campus)
    `)
    .in('status', ['sold', 'deleted', 'rejected', 'hidden'])
    .order('created_at', { ascending: false })

  if (pendingError) console.error('Error fetching pending listings:', pendingError)
  if (activeError) console.error('Error fetching active listings:', activeError)
  if (hiddenError) console.error('Error fetching hidden listings:', hiddenError)

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-[TitleFont] tracking-wide font-normal">
          Listing Management
        </h1>
        <p className="text-muted-foreground">
          Review pending listings and manage active/hidden marketplace items.
        </p>
      </div>

      <ListingManagementTabs 
        pendingListings={pendingListings || []} 
        activeListings={activeListings || []} 
        hiddenListings={hiddenListings || []}
      />
    </div>
  )
}
