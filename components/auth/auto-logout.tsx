'use client'

import { useEffect, useCallback } from 'react'
import { signout } from '@/app/auth/actions'
import { useRouter } from 'next/navigation'

interface AutoLogoutProps {
  timeoutMs?: number // Default: 30 minutes (1800000ms)
}

export function AutoLogout({ timeoutMs = 1800000 }: AutoLogoutProps) {
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    // Perform logout
    await signout()
    // Redirect handled by server action or:
    router.push('/login')
  }, [router])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const resetTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(handleLogout, timeoutMs)
    }

    // Events to track activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    // Set initial timer
    resetTimer()

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [handleLogout, timeoutMs])

  return null // Render nothing
}
