import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import { SellForm } from "@/components/sell-form"

export default async function SellPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check verification status and ban status
  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status, banned_until')
    .eq('id', user.id)
    .single()

  // Check if banned
  if (profile?.banned_until) {
    const bannedUntil = new Date(profile.banned_until)
    if (bannedUntil > new Date()) {
      redirect('/banned')
    }
  }

  if (profile?.verification_status !== 'verified') {
    // If not verified, redirect to home
    redirect('/')
  }

  const params = await searchParams
  const editId = params.edit

  // If edit mode, fetch the listing
  let listing = null
  let hasActiveChats = false

  if (editId) {
    const { data: listingData, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', editId)
      .eq('seller_id', user.id)
      .single()

    if (error || !listingData) {
      notFound()
    }

    listing = listingData

    // Check for active conversations
    const { count } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', editId)
      .eq('buyer_deleted', false)
      .eq('seller_deleted', false)

    hasActiveChats = (count || 0) > 0
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SellForm listing={listing} hasActiveChats={hasActiveChats} />
    </div>
  )
}
