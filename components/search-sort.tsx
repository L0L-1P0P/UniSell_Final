'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export function SearchSort() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sort, setSort] = useState('date_desc')

  useEffect(() => {
    setSort(searchParams.get("sort") || 'date_desc')
  }, [searchParams])

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', newSort)
    
    router.push(`/search?${params.toString()}`)
  }

  return (
    <Select value={sort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[170px] bg-white dark:bg-[#2a2a2a] shadow-md dark:shadow-[0_2px_6px_0px_rgba(255,255,255,0.1)] border-0 hover:bg-white dark:hover:bg-[#2a2a2a] hover:shadow-lg hover:border hover:border-[#00dee8] transition-all rounded-full">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="date_desc">Latest</SelectItem>
        <SelectItem value="date_asc">Oldest</SelectItem>
        <SelectItem value="price_asc">Price: Low to High</SelectItem>
        <SelectItem value="price_desc">Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
  )
}
