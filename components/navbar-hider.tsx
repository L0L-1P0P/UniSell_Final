'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function NavbarHider() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Hide navbar on banned page and auth pages
    if (pathname?.startsWith('/banned') || 
        pathname?.startsWith('/forgot-password') || 
        pathname?.startsWith('/reset-password')) {
      document.body.classList.add('hide-navbar')
      return
    }
    
    // Check for 404 page
    const is404 = document.title.includes('404') || 
                  document.title.toLowerCase().includes('not found') ||
                  window.location.pathname === '/not-found' ||
                  document.querySelector('h1')?.textContent === '404'
    
    if (is404) {
      document.body.classList.add('hide-navbar')
    } else {
      document.body.classList.remove('hide-navbar')
    }
    
    return () => {
      if (!pathname?.startsWith('/banned') && 
          !pathname?.startsWith('/forgot-password') && 
          !pathname?.startsWith('/reset-password') && 
          !is404) {
        document.body.classList.remove('hide-navbar')
      }
    }
  }, [pathname])
  
  return null
}
