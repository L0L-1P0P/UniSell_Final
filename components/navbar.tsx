"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare, Heart, Plus } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { UnreadBadge } from "@/components/unread-badge"

interface NavbarProps {
  user?: {
    email?: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  } | null
  isAdmin?: boolean
}

export function Navbar({ user, isAdmin }: NavbarProps) {
  const pathname = usePathname()
  
  // Hide navbar in admin routes
  if (pathname?.startsWith('/admin')) {
    return null
  }

  // Helper function to check if a path is active
  const isActive = (path: string) => pathname?.startsWith(path)

  // Active and inactive class definitions
  const activeClass = "!bg-[#00dee8] !text-black"
  const inactiveClass = "text-foreground"

  if (!user) return null

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-[#1e1e1e] shadow-md dark:shadow-[0_2px_6px_0px_rgba(255,255,255,0.1),0_0px_4px_-1px_rgba(255,255,255,0.1)]">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Logo Image - Show on mobile and large screens, hide on medium */}
          <div className="relative h-10 w-10 md:hidden lg:block">
            <Image 
              src="/logo2.png" 
              alt="UniSell Logo" 
              width={40} 
              height={40}
              className="object-contain"
            />
          </div>
          {/* Text - Hide on mobile, show on medium and large */}
          <div className="hidden md:block text-2xl font-[TitleFont] tracking-normal text-[#00adb5] dark:text-[#00dee8]">
            UniSell
          </div>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Trigger (Optional, if SearchBar is hidden on mobile) */}
          <div className="md:hidden">
             {/* You might want a search icon here for mobile if SearchBar is hidden */}
          </div>

          {user ? (
            <>
              {/* Chat Icon */}
              <Button 
                variant="navicon" 
                size="icon" 
                asChild 
                className={`relative h-9 w-9 rounded-x cursor-pointer ${
                  isActive('/chat') ? activeClass : inactiveClass
                }`}
              >
                <Link href="/chat">
                  <MessageSquare className="h-5 w-5" />
                  <UnreadBadge />
                  <span className="sr-only">Chat</span>
                </Link>
              </Button>

              {/* Favorites Icon */}
              <Button 
                variant="navicon" 
                size="icon" 
                asChild 
                className={`relative h-9 w-9 rounded-x cursor-pointer ${
                  isActive('/favorites') ? activeClass : inactiveClass
                }`}
              >
                <Link href="/favorites">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Favorites</span>
                </Link>
              </Button>

              {/* Post Item Button */}
              <Button 
                variant="pureglow" 
                size="m" 
                asChild 
                className="flex text-black font-[TitleFont] font-normal"
              >
                <Link href="/sell">
                  <Plus className="h-4 w-4" />
                  <span className="sm:hidden">Post</span>
                  <span className="hidden sm:inline">Post Item</span>
                </Link>
              </Button>

              {/* User Navigation */}
              <UserNav 
                user={user} 
                isActive={isActive('/profile') || isActive('/my-listings')}
                isAdmin={isAdmin}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}
