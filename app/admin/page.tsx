import { createClient } from "@/utils/supabase/server"
import { StatCard } from "@/components/admin/stat-card"
import { Users, Package, Flag, UserCog, ShoppingBag } from "lucide-react"
import { OnlineUserCounter } from "@/components/admin/online-user-counter"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch Pending Stats (Row 1 - Critical)
  const { count: pendingUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'pending')

  const { count: pendingListings } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: pendingReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Fetch General Stats (Row 2)


  const { count: activeListings } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalListings } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <h1 className="text-3xl font-[TitleFont] tracking-wide font-normal">
        Dashboard Overview
      </h1>

      {/* Pending Items Row - Critical Priority */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Pending Items (Require Attention)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Pending Users"
            value={pendingUsers || 0}
            icon={UserCog}
            variant={pendingUsers && pendingUsers > 0 ? 'warning' : 'default'}
            href="/admin/users"
          />
          
          <StatCard
            title="Pending Listings"
            value={pendingListings || 0}
            icon={Package}
            variant={pendingListings && pendingListings > 0 ? 'warning' : 'default'}
            href="/admin/listings"
          />
          
          <StatCard
            title="Pending Reports"
            value={pendingReports || 0}
            icon={Flag}
            variant={pendingReports && pendingReports > 0 ? 'critical' : 'default'}
            href="/admin/reports"
          />
        </div>
      </div>

      {/* General Stats Row */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          General Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <OnlineUserCounter />
          
          <StatCard
            title="Active Listings"
            value={activeListings || 0}
            icon={ShoppingBag}
            variant="default"
            href="/admin/listings"
          />
          
          <StatCard
            title="Total Users"
            value={totalUsers || 0}
            icon={Users}
            variant="default"
            href="/admin/users"
          />
          
          <StatCard
            title="Total Listings"
            value={totalListings || 0}
            icon={Package}
            variant="default"
            href="/admin/listings"
          />
        </div>
      </div>
    </div>
  )
}
