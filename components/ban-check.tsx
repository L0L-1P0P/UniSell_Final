"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export function BanCheck() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip check if already on banned page or auth pages
    if (pathname?.startsWith('/banned') || pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
      return
    }

    async function checkBan() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('banned_until')
        .eq('id', user.id)
        .single()

      // Check if user is banned
      if (profile?.banned_until && new Date(profile.banned_until) > new Date()) {
        router.push('/banned')
      }
    }

    checkBan()
  }, [pathname, router])

  return null
}
