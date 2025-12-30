'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/app/profile/actions"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ProfileFormProps {
  user: {
    email: string
    id: string
  }
  profile: {
    full_name: string | null
    mobile_number: string | null
    campus: string | null
    matric_no: string | null
  }
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const result = await updateProfile(formData)
    setLoading(false)

    if (result?.error) {
      alert(result.error) // Simple alert for now
    } else {
      alert("Profile updated successfully!")
      router.refresh()
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={user.email || ''} disabled className="bg-muted/50" />
      </div>
      
      <div className="space-y-2">
        <Label>Campus</Label>
        <Input value={profile.campus || ''} disabled className="bg-muted/50" />
      </div>

      <div className="space-y-2">
        <Label>Matric Number</Label>
        <Input value={profile.matric_no || ''} disabled className="bg-muted/50" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input 
          id="full_name" 
          name="full_name" 
          defaultValue={profile.full_name || ''} 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobile_number">Mobile Number</Label>
        <Input 
          id="mobile_number" 
          name="mobile_number" 
          defaultValue={profile.mobile_number || ''} 
          required 
        />
      </div>

      <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" disabled={loading}>
        {loading ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  )
}
