"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleFavorite(itemId: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: "Unauthorized" }
  }

  // Check if favorite exists
  const { data: existing, error: checkError } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .eq("item_id", itemId)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "not found" error, which is expected when favorite doesn't exist
    return { error: checkError.message }
  }

  if (existing) {
    // Delete favorite
    const { error: deleteError } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("item_id", itemId)

    if (deleteError) {
      return { error: deleteError.message }
    }
  } else {
    // Insert favorite
    const { error: insertError } = await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        item_id: itemId,
      })

    if (insertError) {
      return { error: insertError.message }
    }
  }

  // Revalidate paths
  revalidatePath("/")
  revalidatePath("/favorites")
  
  return { success: true }
}

export async function getFavoriteIds() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return []
  }

  // Fetch all favorite item IDs and status for this user
  const { data, error } = await supabase
    .from("favorites")
    .select(`
      item_id,
      items!inner(status)
    `)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error fetching favorite IDs:", error)
    return []
  }

  // Return array of favorite objects
  return data.map((fav) => {
    // Handle items as array or single object depending on Supabase return
    const item = Array.isArray(fav.items) ? fav.items[0] : fav.items
    return {
      id: fav.item_id,
      status: item?.status
    }
  })
}
