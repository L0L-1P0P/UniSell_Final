'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface ConversationUnreadBadgeProps {
  conversationId: string
}

export function ConversationUnreadBadge({ conversationId }: ConversationUnreadBadgeProps) {
  const [count, setCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial count for this conversation
    const fetchCount = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', user.id)

      setCount(count || 0)
    }

    fetchCount()

    // Real-time subscription for this conversation
    const channel = supabase
      .channel(`conversation-unread-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Increment if message is for current user
        if (payload.new.sender_id !== user.id) {
          setCount(prev => prev + 1)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Decrement if message was marked as read
        if (payload.new.is_read && !payload.old.is_read && payload.new.sender_id !== user.id) {
          setCount(prev => Math.max(0, prev - 1))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  if (count === 0) return null

  return (
    <div className="shrink-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </div>
  )
}
