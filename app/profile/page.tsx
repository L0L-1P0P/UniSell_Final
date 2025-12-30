import { ProfileForm } from "@/components/profile-form"
import { createClient } from "@/utils/supabase/server"
import { checkBanStatus } from "@/utils/ban-check"
import { redirect } from "next/navigation"
import { getSellerRating } from "@/app/reviews/actions"
import { Star } from "lucide-react"
import { BackButton } from "@/components/back-button"

export default async function ProfilePage() {
  await checkBanStatus()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.verification_status !== 'verified') {
    redirect('/onboarding')
  }

  // Fetch seller rating
  const { averageRating, totalReviews } = await getSellerRating(user.id)

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] space-y-8">
      <BackButton />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-[TitleFont] font-normal">My Profile</h1>
        
        {/* Seller Rating Display */}
        {totalReviews > 0 && (
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b border-border/50 pb-2">My Information</h2>
          
          <ProfileForm user={{ email: user.email!, id: user.id }} profile={profile} />
        </div>
      </div>
    </div>
  )
}
