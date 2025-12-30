"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Tag, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { format } from "date-fns"

interface Listing {
  id: string
  title: string
  price: number
  category: string
  status: string
  created_at: string
  images: string[]
  campus: string
  seller?: {
    full_name: string | null
    campus: string | null
  }
}

interface ListingManagementTabsProps {
  pendingListings: Listing[]
  activeListings: Listing[]
  hiddenListings: Listing[]
}

export function ListingManagementTabs({ pendingListings, activeListings, hiddenListings }: ListingManagementTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get current tab from URL, default to 'pending'
  const currentTab = searchParams.get('tab') || 'pending'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  const ListingCard = ({ listing, type }: { listing: Listing, type: 'pending' | 'active' | 'hidden' }) => (
    <Link
      href={`/admin/listings/${listing.id}`}
      className={`bg-white dark:bg-[#1e1e1e] border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer group flex gap-4 ${
        type === 'pending' 
          ? 'border-yellow-300 dark:border-yellow-700 hover:border-yellow-500' 
          : type === 'active'
            ? 'border-green-300 dark:border-green-800 hover:border-green-500'
            : 'border-gray-200 dark:border-gray-800 hover:border-gray-400'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden bg-muted">
        {type === 'hidden' && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              {listing.status}
            </span>
          </div>
        )}
        {listing.images && listing.images[0] ? (
          <Image 
            src={listing.images[0]} 
            alt={listing.title} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-slate-100 dark:bg-slate-800 text-muted-foreground">
            <span className="text-xs">No Img</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold font-[TitleFont] truncate">
              {listing.title}
            </h3>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 min-w-fit shrink-0">
              {listing.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-[#00adb5] dark:text-[#00dee8] mt-0.5">
            <span>RM {listing.price.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-muted-foreground mt-2">
          {listing.seller && (
            <div className="flex items-center gap-1 truncate">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{listing.seller.full_name || 'Unknown Seller'}</span>
            </div>
          )}
          {listing.campus && (
            <div className="flex items-center gap-1 shrink-0">
              <MapPin className="h-3 w-3" />
              <span>{listing.campus}</span>
            </div>
          )}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(listing.created_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      <div className={`self-center ml-3 text-xs font-medium transition-all whitespace-nowrap hidden sm:block ${
        type === 'pending' 
          ? 'text-muted-foreground group-hover:text-yellow-600 group-hover:translate-x-1' 
          : 'text-muted-foreground group-hover:text-cyan-600 group-hover:translate-x-1'
      }`}>
        {type === 'pending' ? 'Review →' : 'Manage →'}
      </div>
    </Link>
  )

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 max-w-md">
        <TabsTrigger value="pending">
          Pending ({pendingListings?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="active">
          Active ({activeListings?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="hidden">
          Hidden ({hiddenListings?.length || 0})
        </TabsTrigger>
      </TabsList>

      {/* Pending Listings Tab */}
      <TabsContent value="pending" className="space-y-4 mt-6">
        {pendingListings && pendingListings.length > 0 ? (
          <div className="grid gap-4">
            {pendingListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} type="pending" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#1e1e1e] rounded-xl border-2">
            <p className="text-muted-foreground">No pending listings</p>
          </div>
        )}
      </TabsContent>

      {/* Active Listings Tab */}
      <TabsContent value="active" className="space-y-4 mt-6">
        {activeListings && activeListings.length > 0 ? (
          <div className="grid gap-4">
            {activeListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} type="active" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#1e1e1e] rounded-xl border-2">
            <p className="text-muted-foreground">No active listings</p>
          </div>
        )}
      </TabsContent>

      {/* Hidden Listings Tab */}
      <TabsContent value="hidden" className="space-y-4 mt-6">
        {hiddenListings && hiddenListings.length > 0 ? (
          <div className="grid gap-4">
            {hiddenListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} type="hidden" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#1e1e1e] rounded-xl border-2">
            <p className="text-muted-foreground">No hidden listings</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
