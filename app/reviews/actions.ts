'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitReview(itemId: string, sellerId: string, rating: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  // Verify user is the buyer
  const { data: item } = await supabase
    .from('items')
    .select('buyer_id, seller_id')
    .eq('id', itemId)
    .single()

  if (item?.buyer_id !== user.id) {
    return { error: "Only the buyer can leave a review" }
  }

  // Check if review already exists
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('item_id', itemId)
    .single()

  if (existing) {
    return { error: "You have already reviewed this purchase" }
  }

  // Insert review (rating only, no comment)
  const { error } = await supabase
    .from('reviews')
    .insert({
      item_id: itemId,
      seller_id: sellerId,
      buyer_id: user.id,
      rating
    })

  if (error) {
    console.error("Review submission error:", error)
    return { error: "Failed to submit review" }
  }

  revalidatePath(`/chat`)
  revalidatePath(`/profile`)
  return { success: true }
}

export async function getSellerRating(sellerId: string) {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('seller_id', sellerId)

  if (!reviews || reviews.length === 0) {
    return { averageRating: 0, totalReviews: 0 }
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
  const averageRating = totalRating / reviews.length

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: reviews.length
  }
}
