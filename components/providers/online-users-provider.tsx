"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

  useEffect(() => {
    // Keep a reference to the channel
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupChannel = async (userId: string | null) => {
      // Clean up previous channel
      if (channel) {
        supabase.removeChannel(channel)
      }

      channel = supabase.channel('online-users')

      // Listener for state changes (Counter Logic)
      const updateCount = () => {
        if (!channel) return
        const state = channel.presenceState()
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

      channel
        .on('presence', { event: 'sync' }, updateCount)
        .on('presence', { event: 'join' }, updateCount)
        .on('presence', { event: 'leave' }, updateCount)

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // If we have a user, track them (Tracker Logic)
          if (userId && channel) {
            await channel.track({
              user_id: userId,
              online_at: new Date().toISOString(),
            })
          }
          // Initial count check
          updateCount()
        }
      })
    }

    // Immediately setup on mount with current user
    const initializePresence = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      await setupChannel(user?.id || null)
    }

    initializePresence()

    // Also listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const userId = session?.user?.id || null
        setupChannel(userId)
      }
    )

    return () => {
      subscription.unsubscribe()
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase])

  return (
    <OnlineUsersContext.Provider value={{ onlineCount }}>
      {children}
    </OnlineUsersContext.Provider>
  )
}
