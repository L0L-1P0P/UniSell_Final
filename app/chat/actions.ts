'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function markMessagesAsRead(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error("Error marking messages as read:", error)
    return { error: "Failed to mark messages as read" }
  }

  return { success: true }
}

export async function deleteConversation(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  // Get conversation to check user role
  const { data: conv, error: fetchError } = await supabase
    .from('conversations')
    .select('buyer_id, seller_id, buyer_deleted, seller_deleted')
    .eq('id', conversationId)
    .single()

  if (fetchError || !conv) {
    return { error: "Conversation not found" }
  }

  const isBuyer = conv.buyer_id === user.id
  const isSeller = conv.seller_id === user.id

  if (!isBuyer && !isSeller) {
    return { error: "Unauthorized" }
  }

  // Determine which field to update
  const updateField = isBuyer ? 'buyer_deleted' : 'seller_deleted'
  const otherFieldDeleted = isBuyer ? conv.seller_deleted : conv.buyer_deleted

  // If other user already deleted, hard delete
  if (otherFieldDeleted) {
    // Delete messages first (cascade will handle this, but explicit is better)
    await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId)

    // Delete conversation
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (deleteError) {
      console.error("Error deleting conversation:", deleteError)
      return { error: "Failed to delete conversation" }
    }
  } else {
    // Soft delete - just mark as deleted for this user
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ [updateField]: true })
      .eq('id', conversationId)

    if (updateError) {
      console.error("Error soft-deleting conversation:", updateError)
      return { error: "Failed to delete conversation" }
    }
  }

  // Revalidate both the chat list and specific chat page
  revalidatePath('/chat', 'layout')
  revalidatePath(`/chat/${conversationId}`)
  
  return { success: true }
}
