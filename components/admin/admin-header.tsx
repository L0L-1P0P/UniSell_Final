"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, ChevronRight } from "lucide-react"

export function AdminHeader() {
  const pathname = usePathname()
  
  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname?.split('/').filter(Boolean) || []
    
    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      return { name, href }
    })
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <Link
              href={crumb.href}
              className={index === breadcrumbs.length - 1 
                ? "font-medium" 
                : "text-muted-foreground hover:text-foreground"
              }
            >
              {crumb.name}
            </Link>
          </div>
        ))}
      </div>

      {/* Exit to App Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/">
          <Home className="h-4 w-4 mr-2" />
          Exit to App
        </Link>
      </Button>
    </header>
  )
}
