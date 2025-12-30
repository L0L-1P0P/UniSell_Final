import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

/**
 * Check if the current user is banned and redirect to /banned page if they are.
 * Call this at the top of any protected page that requires authentication.
 * 
 * @returns void - Redirects to /banned if user is banned, otherwise continues
 */
export async function checkBanStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return // Not logged in, no ban check needed
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('banned_until')
    .eq('id', user.id)
    .single()

  if (profile?.banned_until) {
    const bannedUntil = new Date(profile.banned_until)
    if (bannedUntil > new Date()) {
      redirect('/banned')
    }
  }
}
