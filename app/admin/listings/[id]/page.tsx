import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MapPin, Calendar, User, Tag, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { AdminBackButton } from "@/components/admin/admin-back-button"
import Image from "next/image"
import { ImageCarousel } from "@/components/image-carousel"
import { ListingRejectionDialog } from "@/components/admin/listing-rejection-dialog"
import { approveListing } from "@/app/admin/actions"
import { ApproveButton } from "./approve-button"
import { AdminListingActions } from "./admin-listing-actions"
import { UnhideButton } from "./unhide-button"
import { PermanentDeleteButton } from "./permanent-delete-button"

export default async function AdminListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

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

  // Fetch listing details with seller info
  const { data: listing, error } = await supabase
    .from('items')
    .select(`
      *,
      seller:profiles!seller_id(id, full_name, campus)
    `)
    .eq('id', id)
    .single()

  if (error || !listing) {
    notFound()
  }

  // Check for active conversations (for permanent delete)
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .eq('item_id', id)
    .eq('buyer_deleted', false)
    .or('seller_deleted.eq.false')

  const hasConversations = !!(conversations && conversations.length > 0)

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `RM ${price.toFixed(2)}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="p-8 space-y-6">
      {/* Back Button */}
      <AdminBackButton />

      {/* Listing Detail Card */}
      <div className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-xl p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-[TitleFont] tracking-wide font-normal">
              {listing.title}
            </h1>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={
                  listing.status === 'pending' 
                    ? "border-yellow-600 bg-yellow-50 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-600" 
                    : listing.status === 'available'
                    ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-50 hover:border-green-600"
                    : listing.status === 'rejected'
                    ? "border-red-600 bg-red-50 text-red-700 hover:bg-red-50 hover:border-red-600"
                    : "border-gray-600 bg-gray-50 text-gray-700 hover:bg-gray-50 hover:border-gray-600"
                }
              >
                {listing.status === 'pending' 
                  ? 'Pending Review' 
                  : listing.status === 'available'
                  ? 'Approved'
                  : listing.status === 'rejected'
                  ? 'Rejected'
                  : listing.status.toUpperCase()}
              </Badge>
              {listing.category && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200 border">
                  {listing.category}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>Seller: </span>
              <Link 
                href={`/admin/users/${listing.seller.id}`}
                className="text-[#00adb5] dark:text-[#00dee8] hover:underline font-medium"
              >
                {listing.seller.full_name}
              </Link>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{listing.campus} Campus</span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Posted: {formatDate(listing.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Image Carousel */}
        <div>
          <h3 className="text-lg font-semibold font-[TitleFont] mb-4">
            Product Images
          </h3>
          <Card className="shadow-lg isolate">
            <CardContent className="p-0">
              <ImageCarousel images={listing.images || []} alt={listing.title} />
            </CardContent>
          </Card>
        </div>

        {/* Listing Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Price */}
          <div className="bg-muted/30 p-3 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Price
            </div>
            <p className="font-bold text-xl text-[#00adb5] dark:text-[#00dee8]">{formatPrice(listing.price)}</p>
          </div>

          {/* Condition */}
          <div className="bg-muted/30 p-3 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Condition
            </div>
            <p className="font-medium truncate">{listing.condition || 'Not specified'}</p>
          </div>

          {/* Meetup Area */}
          <div className="bg-muted/30 p-3 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5" />
              Meetup Area
            </div>
            <p className="font-medium truncate">{listing.meetup_area || 'Not specified'}</p>
          </div>
        </div>

        {/* Description */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold font-[TitleFont] mb-4">
            Description
          </h3>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {listing.description || 'No description provided.'}
          </p>
        </div>

        {/* Rejection Info - Show if rejected */}
        {listing.status === 'rejected' && listing.rejection_reason && (
          <div className="pt-6 border-t">
            <div className="flex flex-col gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Rejection Reason</span>
              </div>
              <p className="text-sm text-foreground">{listing.rejection_reason}</p>
            </div>
          </div>
        )}

        {/* Actions - Only show if pending */}
        {listing.status === 'pending' && (
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold font-[TitleFont] mb-4">
              Admin Actions
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <ApproveButton listingId={listing.id} />
            </div>
          </div>
        )}

        {/* Already Approved Notice */}
        {listing.status === 'available' && (
          <>
            <div className="pt-6 border-t">
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">This listing has been approved and is visible in the marketplace</span>
              </div>
            </div>

            {/* Admin Moderation Actions */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold font-[TitleFont] mb-4">
                Admin Moderation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use these actions if this listing violates policies or receives multiple reports.
              </p>
              <AdminListingActions listingId={listing.id} listingTitle={listing.title} />
            </div>
          </>
        )}

        {/* Already Rejected Notice */}
        {listing.status === 'rejected' && (
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">This listing has been rejected. The seller can edit or delete it.</span>
            </div>
          </div>
        )}

        {/* Hidden Listing - Unhide Option */}
        {listing.status === 'hidden' && (
          <>
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold font-[TitleFont] mb-4">
                This Listing is Hidden
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This listing is currently hidden from the marketplace. You can make it visible again.
              </p>
              <UnhideButton listingId={listing.id} />
            </div>

            {/* Permanent Delete for Hidden */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold font-[TitleFont] mb-4 text-destructive">
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete this hidden listing from the database.
              </p>
              <PermanentDeleteButton 
                listingId={listing.id} 
                listingTitle={listing.title}
                hasConversations={hasConversations}
              />
            </div>
          </>
        )}

        {/* Deleted Listing - Permanent Delete */}
        {listing.status === 'deleted' && (
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold font-[TitleFont] mb-4 text-destructive">
              Permanently Delete Listing
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This listing is soft-deleted. You can permanently remove it from the database.
            </p>
            <PermanentDeleteButton 
              listingId={listing.id} 
              listingTitle={listing.title}
              hasConversations={hasConversations}
            />
          </div>
        )}
      </div>
    </div>
  )
}
