'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

const CATEGORIES: Record<string, string[]> = {
  "Electronics": [
    "Mobile Phones & Tablets",
    "Computers & Laptops",
    "Phone & Computer Accessories",
    "TV, Audio & Video",
    "Cameras & Photography",
    "Gaming & Consoles"
  ],
  "Fashion": [
    "Men's Clothing",
    "Women's Clothing",
    "Shoes",
    "Bags & Wallets",
    "Watches & Accessories"
  ],
  "Furniture & Living": [
    "Tables & Desks",
    "Chairs",
    "Beds & Mattresses",
    "Sofas",
    "Storage & Organization",
    "Home Decor"
  ],
  "Books & Stationery": [
    "Textbooks",
    "Course Notes & Past Years",
    "Fiction & Non-Fiction",
    "Comics & Manga",
    "Stationery"
  ],
  "Room Rental": [
    "Single Room",
    "Shared Room",
    "Whole Unit / House",
    "Short-term / Homestay"
  ],
  "Vehicles": [
    "Motorcycles",
    "Bicycles",
    "Cars",
    "E-Scooters & Skateboards"
  ],
  "Others": [
    "Sports & Equipment",
    "Music Instruments",
    "Tickets & Vouchers",
    "Miscellaneous"
  ]
}

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [category, setCategory] = useState('All')
  const [subCategory, setSubCategory] = useState('All')

  useEffect(() => {
    setCategory(searchParams.get("category") || 'All')
    setSubCategory(searchParams.get("sub_category") || 'All')
  }, [searchParams])

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setSubCategory('All') // Reset subcategory when category changes
    
    const params = new URLSearchParams(searchParams.toString())
    const query = params.get('q')
    
    // Build new URL
    const newParams = new URLSearchParams()
    if (query) newParams.set('q', query)
    if (newCategory !== 'All') newParams.set('category', newCategory)
    
    router.push(`/search?${newParams.toString()}`)
  }

  const handleSubCategoryChange = (newSubCategory: string) => {
    setSubCategory(newSubCategory)
    
    const params = new URLSearchParams(searchParams.toString())
    const query = params.get('q')
    
    // Build new URL
    const newParams = new URLSearchParams()
    if (query) newParams.set('q', query)
    if (category !== 'All') newParams.set('category', category)
    if (newSubCategory !== 'All') newParams.set('sub_category', newSubCategory)
    
    router.push(`/search?${newParams.toString()}`)
  }

  const subCategories = category !== 'All' ? CATEGORIES[category as keyof typeof CATEGORIES] || [] : []

  return (
    <div className="flex gap-3">
      {/* Category Filter */}
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[180px] bg-white dark:bg-[#2a2a2a] shadow-md dark:shadow-[0_2px_6px_0px_rgba(255,255,255,0.1)] border-0 hover:bg-white dark:hover:bg-[#2a2a2a] hover:shadow-lg hover:border hover:border-[#00dee8] transition-all rounded-full">
          <SelectValue>
            {category === 'All' ? 'Categories' : category}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {Object.keys(CATEGORIES).map((cat) => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subcategory Filter */}
      <Select 
        value={subCategory} 
        onValueChange={handleSubCategoryChange}
        disabled={category === 'All' || subCategories.length === 0}
      >
        <SelectTrigger className="w-[170px] bg-white dark:bg-[#2a2a2a] shadow-md dark:shadow-[0_2px_6px_0px_rgba(255,255,255,0.1)] border-0 hover:bg-white dark:hover:bg-[#2a2a2a] hover:shadow-lg hover:border hover:border-[#00dee8] transition-all rounded-full">
          <SelectValue>
            {subCategory === 'All' ? 'Sub-Categories' : subCategory}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {subCategories.map((subCat) => (
            <SelectItem key={subCat} value={subCat}>{subCat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
