import { createClient } from "@/utils/supabase/server"
import { UserManagementTabs } from "@/components/admin/user-management-tabs"

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createClient()

  // Fetch pending users
  const { data: pendingUsers, error: pendingError } = await supabase
    .from('profiles')
    .select('*')
    .eq('verification_status', 'pending')
    .order('joined_at', { ascending: false })

  console.log('[Users Page] Pending users:', pendingUsers?.length, 'Error:', pendingError)

  // Fetch verified users only
  const { data: activeUsers, error: activeError } = await supabase
    .from('profiles')
    .select('*')
    .eq('verification_status', 'verified')
    .order('joined_at', { ascending: false })

  console.log('[Users Page] Active users:', activeUsers?.length, 'Error:', activeError)

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <h1 className="text-3xl font-[TitleFont] tracking-wide font-normal">
        User Management
      </h1>

      {/* Tabs */}
      <UserManagementTabs 
        pendingUsers={pendingUsers || []} 
        activeUsers={activeUsers || []} 
      />
    </div>
  )
}
