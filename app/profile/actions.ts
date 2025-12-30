'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const full_name = formData.get("full_name") as string
  const mobile_number = formData.get("mobile_number") as string

  const { error } = await supabase
    .from('profiles')
    .update({ full_name, mobile_number })
    .eq('id', user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return { error: "Failed to update profile" }
  }

  // Sync with Supabase Auth Metadata
  await supabase.auth.updateUser({
    data: { full_name }
  })

  revalidatePath('/', 'layout')
  revalidatePath('/profile')
  return { success: "Profile updated successfully" }
}
