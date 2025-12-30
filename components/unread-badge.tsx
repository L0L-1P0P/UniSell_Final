'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function UnreadBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true
    let pollInterval: NodeJS.Timeout

    // Fetch unread count
    const fetchCount = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !mounted) return

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', user.id)

      if (mounted) {
        setCount(unreadCount || 0)
      }
    }

    // Initial fetch
    fetchCount()

    // Poll every 10 seconds for updates
    // This is more reliable than real-time for global message listening
    // because real-time events are filtered by RLS
    pollInterval = setInterval(fetchCount, 10000)

    return () => {
      mounted = false
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [])

  if (count === 0) return null

  return (
    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
      {count > 9 ? '9+' : count}
    </div>
  )
}
