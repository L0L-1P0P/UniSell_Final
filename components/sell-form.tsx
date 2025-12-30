'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createListing, updateListing } from "@/app/items/actions"
import { useState, useRef, useEffect } from "react"
import { ImagePlus, X, AlertCircle, Info } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface SellFormProps {
  listing?: any
  hasActiveChats?: boolean
}

export function SellForm({ listing, hasActiveChats = false }: SellFormProps) {
  const router = useRouter()
  const [loading, setLoadingState] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const isEditMode = !!listing
  const isLimitedEdit = isEditMode && listing.status === 'available' && hasActiveChats
  
  // File Management State
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(listing?.images || [])
  
  const [category, setCategory] = useState<string>(listing?.category || "")
  const [subCategory, setSubCategory] = useState<string>(listing?.sub_category || "")
  const [condition, setCondition] = useState<string>(listing?.condition || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const subCategories: Record<string, string[]> = {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      
      // Calculate how many we can add
      const remainingSlots = 5 - images.length
      
      if (remainingSlots <= 0) {
        setError("You can only upload up to 5 images.")
        return
      }

      const filesToAdd = fileArray.slice(0, remainingSlots)
      
      // Update Files State
      const updatedFiles = [...images, ...filesToAdd]
      setImages(updatedFiles)
      setError(null)

      // Generate Previews for NEW files only and append
      filesToAdd.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
    
    // Reset input so same file can be selected again if needed
    if (e.target) {
        e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newFiles = [...images]
    newFiles.splice(index, 1)
    setImages(newFiles)

    const newPreviews = [...previews]
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)
  }

  const removeExistingImage = (index: number) => {
    const newExisting = [...existingImages]
    newExisting.splice(index, 1)
    setExistingImages(newExisting)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (value.includes('.')) {
      const parts = value.split('.')
      if (parts[1].length > 2) {
        // Enforce max 2 decimal places
        value = `${parts[0]}.${parts[1].slice(0, 2)}`
        e.target.value = value
      }
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoadingState(true)
    setError(null)

    // In edit mode, check if we have existing or new images
    if (!isEditMode && images.length === 0) {
      setError("Please upload at least one image.")
      setLoadingState(false)
      return
    }

    if (isEditMode && existingImages.length === 0 && images.length === 0) {
      setError("Please provide at least one image.")
      setLoadingState(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    
    // Manually handle images: Remove existing 'images' field and append from state
    formData.delete('images')
    images.forEach((file) => {
        formData.append('images', file)
    })

    // For edit mode, include existing images
    if (isEditMode) {
      formData.set('existingImages', JSON.stringify(existingImages))
    }

    // Handle Checkbox
    const showContact = (e.currentTarget.elements.namedItem('show_contact_info') as HTMLInputElement).checked
    formData.set('show_contact_info', String(showContact))

    let result
    if (isEditMode) {
      result = await updateListing(listing.id, formData)
    } else {
      result = await createListing(formData)
    }

    if (result?.error) {
      setError(result.error)
      setLoadingState(false)
    }
    // Success redirect is handled in Server Action
  }

  return (
    <div className="w-full max-w-2xl glass-card flex flex-col gap-6 py-8 px-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-[TitleFont] font-normal text-[#00adb5] dark:text-[#00dee8]">
          {isEditMode ? 'Edit Listing' : 'Sell an Item'}
        </h1>
        <p className="text-muted-foreground font-[TitleFont] font-normal">
          {isEditMode ? 'Update your listing details' : 'List your item for sale in the marketplace'}
        </p>
      </div>

      {/* Rejection Reason Alert */}
      {isEditMode && listing.status === 'rejected' && listing.rejection_reason && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400 font-medium">
            <AlertCircle className="h-5 w-5" />
            <span>Admin Feedback</span>
          </div>
          <p className="text-sm text-red-900 dark:text-red-300">{listing.rejection_reason}</p>
          <p className="text-xs text-red-700 dark:text-red-500 mt-1">
            Please address the concerns above. Your listing will be reviewed again after you submit changes.
          </p>
        </div>
      )}

      {/* Active Chats - Editing Blocked */}
      {isLimitedEdit ? (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 font-medium text-lg">
              <Info className="h-6 w-6" />
              <span>Editing Not Available</span>
            </div>
            <p className="text-blue-900 dark:text-blue-300">
              This listing has active conversations with buyers. To protect their experience, editing is disabled.
            </p>
            <div className="bg-blue-100 dark:bg-blue-950/30 rounded p-3 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">What you can do:</p>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>Mark this item as sold when the deal is complete</li>
                <li>Create a new listing if you need to make changes</li>
                <li>Wait for conversations to end, then edit</li>
              </ul>
            </div>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/my-listings')}
            className="w-full"
          >
            Back to My Listings
          </Button>
        </div>
      ) : (

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2 font-[TitleFont] font-normal">
          <Label>Item Images <span className="text-xs text-muted-foreground ml-2">(Max 5)</span></Label>
          <div className="grid grid-cols-3 gap-4">
            {/* Existing Images (Edit Mode) */}
            {existingImages.map((src, index) => (
              <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                <Image src={src} alt="Existing" fill className="object-cover" />
                {!isLimitedEdit && (
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                )}
              </div>
            ))}
            
            {/* New Image Previews */}
            {previews.map((src, index) => (
              <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                <Image src={src} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            {(existingImages.length + images.length) < 5 && !isLimitedEdit && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-[#00dee8] transition-colors bg-background/50"
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-2">Add Photos</span>
              </div>
            )}
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Title */}
        <div className="space-y-2 font-[TitleFont] font-normal">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="e.g. Calculus Textbook" defaultValue={listing?.title || ""} disabled={isLimitedEdit} required />
        </div>


        {/* Price */}
        <div className="space-y-2 font-[TitleFont] font-normal">
          <Label htmlFor="price">Price (RM)</Label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-muted-foreground pointer-events-none">RM</span>
            <Input 
              id="price" 
              name="price" 
              type="number" 
              step="0.01" 
              min="0" 
              style={{ paddingLeft: "3rem", fontSize: "1rem" }} 
              placeholder="0.00" 
              defaultValue={listing?.price || ""}
              required 
              onChange={handlePriceChange}
            />
          </div>
        </div>

        {/* Category & Sub-Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 font-[TitleFont] font-normal">
            <Label htmlFor="category">Category</Label>
            <Select name="category" value={category} onValueChange={setCategory} disabled={isLimitedEdit} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(subCategories).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 font-[TitleFont] font-normal">
            <Label htmlFor="sub_category">Sub-Category</Label>
            <Select name="sub_category" value={subCategory} onValueChange={setSubCategory} disabled={!category || isLimitedEdit} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Sub-Category" />
              </SelectTrigger>
              <SelectContent>
                {category && subCategories[category]?.map((sub) => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Condition & Meetup Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 font-[TitleFont] font-normal">
            <Label htmlFor="condition">Condition</Label>
            <Select name="condition" value={condition} onValueChange={setCondition} disabled={isLimitedEdit} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Brand New">Brand New</SelectItem>
                <SelectItem value="Like New">Like New</SelectItem>
                <SelectItem value="Lightly Used">Lightly Used</SelectItem>
                <SelectItem value="Heavily Used">Heavily Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 font-[TitleFont] font-normal">
            <Label htmlFor="meetup_area">Preferred Meetup Area</Label>
            <Input id="meetup_area" name="meetup_area" placeholder="e.g., Fajar Harapan Cafe or DTSP" defaultValue={listing?.meetup_area || ""} required />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 font-[TitleFont] font-normal">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            className="w-full min-h-[120px] px-4 py-3 rounded-lg outline-none transition-all duration-200 ease-in-out bg-white border border-gray-400 text-black placeholder:text-gray-400 dark:bg-black/50 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 focus:border-[#00dee8] focus:ring-1 focus:ring-[#00dee8] disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Describe your item..."
            defaultValue={listing?.description || ""}
            disabled={isLimitedEdit}
            required
          />
        </div>

        {/* Privacy Control */}
        <div className="flex items-center space-x-2 font-[TitleFont] font-normal">
            <input 
                type="checkbox" 
                id="show_contact_info" 
                name="show_contact_info"
                defaultChecked={listing?.show_contact_info || false}
                className="w-4! h-4! p-0! text-cyan-600 bg-background border-gray-300 focus:ring-cyan-500 dark:focus:ring-cyan-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <Label htmlFor="show_contact_info" className="font-normal cursor-pointer">Display my mobile number to buyers</Label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-4 pt-2">
            <Button 
                type="submit" 
                className="flex-2 bg-cyan-600 hover:bg-cyan-700 text-white text-lg h-12 font-[TitleFont] font-normal" 
                disabled={loading}
            >
                {loading ? (isEditMode ? "Updating..." : "Listing Item...") : (isEditMode ? "Update Listing" : "List Item")}
            </Button>
            
            <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="flex-1 text-lg h-12 border border-gray-400 hover:bg-gray-200 font-[TitleFont] font-normal"
            >
                Cancel
            </Button>
        </div>
      </form>
      )}
    </div>
  )
}
