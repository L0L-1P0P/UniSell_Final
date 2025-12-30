"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Flag, 
  Megaphone 
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Listing Management', href: '/admin/listings', icon: Package },
  { name: 'Reports', href: '/admin/reports', icon: Flag },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full w-16 lg:w-64 bg-[#1e1e1e] text-white border-r border-gray-800 transition-all duration-300">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center lg:justify-start px-4 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
          <div className="relative h-8 w-8 shrink-0">
             <Image 
               src="/logo2.png" 
               alt="UniSell Logo" 
               fill
               className="object-contain"
             />
          </div>
          <span className="text-xl font-[TitleFont] tracking-wide text-[#00dee8] hidden lg:block whitespace-nowrap">
            UniSell Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 lg:p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = 
            item.href === '/admin' 
              ? pathname === '/admin'
              : pathname?.startsWith(item.href)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-[TitleFont] tracking-wide",
                "justify-center lg:justify-start",
                isActive
                  ? "bg-[#00dee8] text-black font-medium"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
              title={item.name} // Tooltip for collapsed state
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:block whitespace-nowrap">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 hidden lg:block">
        <p>Admin Panel v1.0</p>
      </div>
    </div>
  )
}
