"use client"

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'

interface OnlineUsersContextType {
  onlineCount: number
}

const OnlineUsersContext = createContext<OnlineUsersContextType>({
  onlineCount: 0,
})

export function useOnlineUsers() {
  return useContext(OnlineUsersContext)
}

export function OnlineUsersProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [onlineCount, setOnlineCount] = useState(0)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    const setupChannel = async (userId: string | null) => {
      // Clean up previous channel
      if (channelRef.current) {
        await channelRef.current.untrack()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }

      const newChannel = supabase.channel('online-users')

      // Listener for state changes
      const updateCount = () => {
        const state = newChannel.presenceState()
        const userIds = new Set<string>()
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              userIds.add(presence.user_id)
            }
          })
        })

        setOnlineCount(userIds.size)
      }

      newChannel
        .on('presence', { event: 'sync' }, () => {
          updateCount()
        })
        .on('presence', { event: 'join' }, () => {
          updateCount()
        })
        .on('presence', { event: 'leave' }, () => {
          updateCount()
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            if (userId) {
              await newChannel.track({
                user_id: userId,
                online_at: new Date().toISOString(),
              })
            }
            setTimeout(() => updateCount(), 200)
          }
        })

      channelRef.current = newChannel
    }

    // Immediately setup on mount
    const initializePresence = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      await setupChannel(user?.id || null)
    }

    initializePresence()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const userId = session?.user?.id || null
        setupChannel(userId)
      }
    )

    return () => {
      subscription.unsubscribe()
      if (channelRef.current) {
        channelRef.current.untrack()
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [supabase])

  return (
    <OnlineUsersContext.Provider value={{ onlineCount }}>
      {children}
    </OnlineUsersContext.Provider>
  )
}
