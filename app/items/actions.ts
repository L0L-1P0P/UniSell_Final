'use server'

import { Item } from "@/types"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createListing(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to sell items." }
  }

  const title = formData.get("title") as string
  const price = parseFloat(formData.get("price") as string)
  const category = formData.get("category") as string
  const sub_category = formData.get("sub_category") as string
  const condition = formData.get("condition") as string
  const description = formData.get("description") as string
  const meetup_area = formData.get("meetup_area") as string
  const images = formData.getAll("images") as File[]
  const show_contact_info = formData.get("show_contact_info") === "true"

  if (!title || !price || !category || !sub_category || !condition || !description || !meetup_area) {
    return { error: "Please fill in all fields." }
  }

  if (images.length === 0 || images[0].size === 0) {
     return { error: "Please upload at least one image." }
  }

  if (images.length > 5) {
     return { error: "You can only upload up to 5 images." }
  }

  const imageUrls: string[] = []

  for (const image of images) {
    if (image.size === 0) continue;
    
    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('public-items')
      .upload(fileName, image)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: "Failed to upload image." }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('public-items')
      .getPublicUrl(fileName)
    
    imageUrls.push(publicUrl)
  }

  // Fetch user's campus from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('campus')
    .eq('id', user.id)
    .single()

  // Default to 'Main' if fetch fails or value is invalid
  // Allowed values: 'Main', 'Engineering', 'Health'
  const validCampuses = ['Main', 'Engineering', 'Health']
  const userCampus = profile?.campus && validCampuses.includes(profile.campus) 
    ? profile.campus 
    : 'Main'

  const { error: insertError } = await supabase
    .from('items')
    .insert({
      seller_id: user.id,
      title,
      price,
      category,
      sub_category,
      condition,
      description,
      meetup_area,
      campus: userCampus,
      status: 'pending', // New listings await admin approval
      images: imageUrls,
      show_contact_info: show_contact_info,
    })

  if (insertError) {
    console.error("Database error:", insertError)
    return { error: "Failed to create listing." }
  }

  redirect('/')
}

export async function completeDeal(itemId: string, buyerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  // Update item status and set buyer
  const { error } = await supabase
    .from('items')
    .update({ 
      status: 'sold',
      buyer_id: buyerId 
    })
    .eq('id', itemId)
    .eq('seller_id', user.id) // Only seller can mark as sold

  if (error) {
    console.error("Error completing deal:", error)
    return { error: "Failed to complete deal" }
  }

  revalidatePath('/chat')
  revalidatePath(`/items/${itemId}`)
  revalidatePath('/profile')
  return { success: true }
}

export async function markItemSold(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  // Mark as sold without specifying buyer (for sales outside the platform)
  const { error } = await supabase
    .from('items')
    .update({ status: 'sold' })
    .eq('id', itemId)
    .eq('seller_id', user.id)

  if (error) {
    console.error("Error marking item sold:", error)
    return { error: "Failed to update item" }
  }

  revalidatePath('/profile')
  revalidatePath('/my-listings')
  return { success: true }
}

export async function deleteItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from('items')
    .update({ status: 'deleted' })
    .eq('id', itemId)
    .eq('seller_id', user.id)

  if (error) {
    console.error("Error deleting item:", error)
    return { error: "Failed to delete item" }
  }

  revalidatePath('/profile')
  return { success: true }
}

// Helper function to check if listing has active conversations
async function checkActiveConversations(itemId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { count } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('item_id', itemId)
    .eq('buyer_deleted', false)
    .eq('seller_deleted', false)
  
  return (count || 0) > 0
}

export async function updateListing(listingId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to edit listings." }
  }

  // Fetch current listing to verify ownership and check status
  const { data: currentListing, error: fetchError } = await supabase
    .from('items')
    .select('*')
    .eq('id', listingId)
    .eq('seller_id', user.id)
    .single()

  if (fetchError || !currentListing) {
    return { error: "Listing not found or you don't have permission to edit it." }
  }

  // Extract form data
  const title = formData.get("title") as string
  const price = parseFloat(formData.get("price") as string)
  const category = formData.get("category") as string
  const sub_category = formData.get("sub_category") as string
  const condition = formData.get("condition") as string
  const description = formData.get("description") as string
  const meetup_area = formData.get("meetup_area") as string
  const images = formData.getAll("images") as File[]
  const existingImageUrls = formData.get("existingImages") as string
  const show_contact_info = formData.get("show_contact_info") === "true"

  if (!title || !price || !category || !sub_category || !condition || !description || !meetup_area) {
    return { error: "Please fill in all fields." }
  }

  // Check for active conversations
  const hasActiveChats = await checkActiveConversations(listingId)

  // Determine if this is a major edit or minor edit
  const isMajorEdit = 
    title !== currentListing.title ||
    description !== currentListing.description ||
    category !== currentListing.category ||
    sub_category !== currentListing.sub_category ||
    condition !== currentListing.condition ||
    images.some(img => img.size > 0) // New images uploaded

  // Tier 3: Active listing with chats - block major edits
  if (currentListing.status === 'available' && hasActiveChats && isMajorEdit) {
    return { 
      error: "This listing has active chats. You can only edit price and meetup area. For major changes, please create a new listing." 
    }
  }

  // Handle image uploads
  let finalImageUrls: string[] = []
  
  // Parse existing images if provided
  if (existingImageUrls) {
    try {
      finalImageUrls = JSON.parse(existingImageUrls)
    } catch (e) {
      finalImageUrls = []
    }
  }

  // Upload new images if provided
  for (const image of images) {
    if (image.size === 0) continue
    
    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('public-items')
      .upload(fileName, image)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: "Failed to upload image." }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('public-items')
      .getPublicUrl(fileName)
    
    finalImageUrls.push(publicUrl)
  }

  if (finalImageUrls.length === 0) {
    return { error: "Please provide at least one image." }
  }

  if (finalImageUrls.length > 5) {
    return { error: "You can only have up to 5 images." }
  }

  // Determine new status based on three-tier logic
  let newStatus: string
  let newRejectionReason: string | null = null

  if (currentListing.status === 'rejected') {
    // Tier 1: Rejected listings always go to pending
    newStatus = 'pending'
    newRejectionReason = null // Clear rejection reason
  } else if (currentListing.status === 'available' && hasActiveChats && !isMajorEdit) {
    // Tier 3: Active with chats, minor edit - stay available
    newStatus = 'available'
  } else if (currentListing.status === 'available' && !hasActiveChats) {
    // Tier 2: Active without chats - go to pending
    newStatus = 'pending'
  } else {
    // Pending listings stay pending
    newStatus = 'pending'
  }

  // Update the listing
  const { error: updateError } = await supabase
    .from('items')
    .update({
      title,
      price,
      category,
      sub_category,
      condition,
      description,
      meetup_area,
      images: finalImageUrls,
      show_contact_info,
      status: newStatus,
      rejection_reason: newRejectionReason,
    })
    .eq('id', listingId)
    .eq('seller_id', user.id)

  if (updateError) {
    console.error("Database error:", updateError)
    return { error: "Failed to update listing." }
  }

  revalidatePath('/my-listings')
  revalidatePath(`/items/${listingId}`)
  revalidatePath('/admin/listings')
  
  redirect('/my-listings')
}
