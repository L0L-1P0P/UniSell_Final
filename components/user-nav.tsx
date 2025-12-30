"use client"

import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { User, List, LogOut, History, Settings, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserNavProps {
  user: {
    email?: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
  isActive?: boolean
  isAdmin?: boolean
}

export function UserNav({ user, isActive = false, isAdmin = false }: UserNavProps) {
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Student"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="navicon" 
          size="icon" 
          className={`relative h-9 w-9 rounded-x cursor-pointer ${
            isActive ? 'bg-[#00dee8] text-black' : ''
          }`}
        >
          <User className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 shadow-xl z-100" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-lg font-medium leading-none">{displayName}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#00dee8]/50 transition-colors font-medium text-[#00adb5] dark:text-[#00dee8]">
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Admin Portal</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#00dee8]/50 transition-colors font-medium">
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#00dee8]/50 transition-colors font-medium">
          <Link href="/my-listings">
            <List className="mr-2 h-4 w-4" />
            <span>My Listings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#00dee8]/50 transition-colors font-medium">
          <Link href="/orders">
            <History className="mr-2 h-4 w-4" />
            <span>Order History</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#00dee8]/50 transition-colors font-medium">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/30 cursor-pointer"
          onSelect={async (event) => {
            event.preventDefault()
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
