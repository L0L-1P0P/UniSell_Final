import { ItemActions } from "@/components/item-actions"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Clock } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { checkBanStatus } from "@/utils/ban-check"

export default async function MyListingsPage() {
  await checkBanStatus()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check verification status
  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('id', user.id)
    .single()

  if (profile?.verification_status !== 'verified') {
    redirect('/onboarding')
  }

  // Fetch Inactive Listings (pending, rejected, or hidden by admin)
  const { data: inactiveItems } = await supabase
    .from('items')
    .select('*')
    .eq('seller_id', user.id)
    .in('status', ['pending', 'rejected', 'hidden'])
    .order('created_at', { ascending: false })

  // Fetch Active Listings
  const { data: activeItems } = await supabase
    .from('items')
    .select('*')
    .eq('seller_id', user.id)
    .eq('status', 'available')
    .order('created_at', { ascending: false })

  // Fetch Sold History
  const { data: soldItems } = await supabase
    .from('items')
    .select('*')
    .eq('seller_id', user.id)
    .eq('status', 'sold')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] space-y-8">
      <BackButton />
      <h1 className="text-3xl font-[TitleFont] font-normal">My Inventory</h1>

      <div className="glass-card p-6 min-h-[500px]">
        <Tabs defaultValue="inactive" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="inactive">Inactive ({inactiveItems?.length || 0})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeItems?.length || 0})</TabsTrigger>
            <TabsTrigger value="sold">Sold ({soldItems?.length || 0})</TabsTrigger>
          </TabsList>

          {/* Inactive Listings Tab */}
          <TabsContent value="inactive" className="space-y-4">
            {inactiveItems && inactiveItems.length > 0 ? (
              inactiveItems.map((item: any) => {
                const isPending = item.status === 'pending'
                const isRejected = item.status === 'rejected'
                const isHidden = item.status === 'hidden'

                return (
                  <div 
                    key={item.id} 
                    className={`flex flex-col gap-3 p-4 rounded-lg border-2 ${
                      isPending ? 'border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-900/10' :
                      isRejected ? 'border-red-500/30 bg-red-50/50 dark:bg-red-900/10' :
                      'border-gray-500/30 bg-gray-50/50 dark:bg-gray-900/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Image */}
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                        {item.images && item.images[0] ? (
                          <>
                            <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                            <div className={`absolute inset-0 ${
                              isPending ? 'bg-yellow-500/10' :
                              isRejected ? 'bg-red-500/10' :
                              'bg-gray-500/10'
                            }`} />
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full w-full text-xs text-muted-foreground">No Img</div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <p className="text-sm text-[#00adb5]">RM {item.price.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Posted {new Date(item.created_at).toLocaleDateString()}</p>
                      </div>

                      {/* Status Badge */}
                      <div className={`px-3 py-1 text-xs rounded-full font-medium ${
                        isPending ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-500' :
                        isRejected ? 'bg-red-500/20 text-red-700 dark:text-red-500' :
                        'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                      }`}>
                        {isPending ? 'PENDING REVIEW' : isRejected ? 'REJECTED' : 'HIDDEN BY ADMIN'}
                      </div>

                      {/* Actions */}
                      <ItemActions itemId={item.id} />
                    </div>

                    {/* Status Message/Reason */}
                    {isPending && (
                      <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <p className="text-xs font-medium text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Waiting for admin approval
                        </p>
                      </div>
                    )}

                    {isRejected && item.rejection_reason && (
                      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-xs font-medium text-red-800 dark:text-red-400 mb-1">Admin Feedback:</p>
                        <p className="text-sm text-red-900 dark:text-red-300">{item.rejection_reason}</p>
                        <p className="text-xs text-red-700 dark:text-red-500 mt-2">You can edit this listing to address the concerns.</p>
                      </div>
                    )}

                    {isHidden && (
                      <div className="bg-gray-100 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-400 mb-1">Hidden by Admin:</p>
                        <p className="text-sm text-gray-900 dark:text-gray-300">
                          {item.hidden_reason || 'This listing was hidden due to policy violations or reports. Please contact support if you have questions.'}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No inactive listings.</p>
              </div>
            )}
          </TabsContent>

          {/* Active Listings Tab */}
          <TabsContent value="active" className="space-y-4">
            {activeItems && activeItems.length > 0 ? (
              activeItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-border/40 bg-background/40 hover:bg-background/60 transition-colors">
                  {/* Image */}
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                    {item.images && item.images[0] ? (
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-xs text-muted-foreground">No Img</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <p className="text-sm text-[#00adb5]">RM {item.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <ItemActions itemId={item.id} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No active listings.
              </div>
            )}
          </TabsContent>

          {/* Sold History Tab */}
          <TabsContent value="sold" className="space-y-4">
            {soldItems && soldItems.length > 0 ? (
              soldItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-border/40 bg-muted/20 opacity-70">
                  {/* Image */}
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0 grayscale">
                    {item.images && item.images[0] ? (
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-xs text-muted-foreground">No Img</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-muted-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">RM {item.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Sold on {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="px-3 py-1 bg-green-500/10 text-green-600 text-xs rounded-full font-medium">
                    SOLD
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No sold items yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
