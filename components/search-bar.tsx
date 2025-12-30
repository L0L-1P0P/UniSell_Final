'use client'

import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

interface SearchBarProps {
  onSearchPage?: boolean
}

export function SearchBar({ onSearchPage = false }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [term, setTerm] = useState("")

  useEffect(() => {
    setTerm(searchParams.get("q") || "")
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (term.trim()) {
      router.push(`/search?q=${encodeURIComponent(term.trim())}`)
    } else {
      router.push('/search')
    }
  }

  const handleClear = () => {
    setTerm("")
    // Only navigate to /search if we're on the search page
    if (onSearchPage) {
      router.push('/search')
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-3 w-full pt-4 px-4">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search items..."
          className="w-full pr-12 pl-6 bg-white dark:bg-[#2a2a2a] h-12 text-md md:text-sm font-[TitleFont] tracking-wide shadow-lg rounded-full border-0 focus-visible:ring-2 focus-visible:ring-[#00dee8] placeholder:text-gray-400 placeholder:font-normal"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        {term && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="h-12 w-12 rounded-full bg-[#00dee8] hover:bg-[#00dee8]/90 flex items-center justify-center transition-colors shadow-md hover:shadow-lg shrink-0"
      >
        <Search className="h-5 w-5 text-black" />
      </button>
    </form>
  )
}
