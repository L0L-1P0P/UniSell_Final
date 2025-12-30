"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, School, Phone } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface Profile {
  id: string
  full_name: string | null
  usm_role: string | null
  email: string | null
  campus: string | null
  mobile_number: string | null
  verification_status: string | null
  [key: string]: any
}

interface UserManagementTabsProps {
  pendingUsers: Profile[]
  activeUsers: Profile[]
}

export function UserManagementTabs({ pendingUsers, activeUsers }: UserManagementTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get current tab from URL, default to 'pending'
  const currentTab = searchParams.get('tab') || 'pending'

  const handleTabChange = (value: string) => {
    // Create new URLSearchParams object to avoid modifying read-only params
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    
    // Push new URL
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="pending">
          Pending ({pendingUsers?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="active">
          Active ({activeUsers?.length || 0})
        </TabsTrigger>
      </TabsList>

      {/* Pending Users Tab */}
      <TabsContent value="pending" className="space-y-4 mt-6">
        {pendingUsers && pendingUsers.length > 0 ? (
          <div className="grid gap-4">
            {pendingUsers.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="bg-white dark:bg-[#1e1e1e] border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 hover:border-yellow-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold font-[TitleFont] truncate">
                        {user.full_name}
                      </h3>
                      <Badge variant="outline" className="capitalize text-[10px] px-1.5 py-0 h-4 min-w-fit">
                        {user.usm_role || 'user'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.mobile_number && (
                        <div className="flex items-center gap-1 truncate">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span className="truncate">{user.mobile_number}</span>
                        </div>
                      )}
                      {user.campus && (
                        <div className="flex items-center gap-1 shrink-0">
                          <School className="h-3 w-3" />
                          {user.campus}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-3 text-xs text-muted-foreground group-hover:text-yellow-600 group-hover:translate-x-1 transition-all whitespace-nowrap">
                    Review →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#1e1e1e] rounded-xl border-2">
            <p className="text-muted-foreground">No pending users</p>
          </div>
        )}
      </TabsContent>

      {/* Active Users Tab */}
      <TabsContent value="active" className="space-y-4 mt-6">
        {activeUsers && activeUsers.length > 0 ? (
          <div className="grid gap-4">
            {activeUsers.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="bg-white dark:bg-[#1e1e1e] border border-green-300 dark:border-green-800 rounded-lg p-3 hover:border-green-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold font-[TitleFont] truncate">
                        {user.full_name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className="capitalize text-[10px] px-1.5 py-0 h-4 min-w-fit"
                      >
                        {user.usm_role || 'user'}
                      </Badge>
                      <div className="flex items-center gap-1 text-green-600 text-[10px] ml-1">
                        <CheckCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">Verified</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>

                      {user.campus && (
                        <div className="flex items-center gap-1 shrink-0">
                          <School className="h-3 w-3" />
                          {user.campus}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-3 text-xs text-muted-foreground group-hover:text-green-600 group-hover:translate-x-1 transition-all whitespace-nowrap">
                    Manage →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#1e1e1e] rounded-xl border-2">
            <p className="text-muted-foreground">No active users</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
