import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/')
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('usm_role')
    .eq('id', user.id)
    .single()

  console.log('[Admin Access Check]', {
    userId: user.id,
    email: user.email,
    profile,
    profileError,
    userRole: profile?.usm_role
  })

  if (profile?.usm_role !== 'admin') {
    console.log('[Admin Access Denied] User role:', profile?.usm_role)
    redirect('/')
  }

  console.log('[Admin Access Granted]')

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-background admin-layout">
          {children}
        </main>
      </div>
    </div>
  )
}
