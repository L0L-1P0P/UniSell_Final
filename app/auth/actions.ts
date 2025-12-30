'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (!email.endsWith('@student.usm.my') && !email.endsWith('@usm.my')) {
    return { error: 'Only USM emails are allowed (@student.usm.my or @usm.my)' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('User already registered') || error.code === 'user_already_exists') {
      return { error: 'User already exists. Please sign in.' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const fullName = formData.get('fullName') as string
  const campus = formData.get('campus') as string
  const matricNo = formData.get('matricNo') as string
  const file = formData.get('icDocument') as File

  if (!file || file.size === 0) {
    return { error: 'IC/Passport document is required' }
  }

  // Check if user has an existing IC document and delete it
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('ic_document_path')
    .eq('id', user.id)
    .single()

  if (existingProfile?.ic_document_path) {
    console.log('[completeOnboarding] Deleting old IC document:', existingProfile.ic_document_path)
    const { error: deleteError } = await supabase.storage
      .from('private-documents')
      .remove([existingProfile.ic_document_path])
    
    if (deleteError) {
      console.error('[completeOnboarding] Failed to delete old document:', deleteError)
      // Continue anyway - not critical
    }
  }

  // Upload file
  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/ic_document.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('private-documents')
    .upload(filePath, file, {
      upsert: true, // Allows resubmission overwrite
    })

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` }
  }

  // Update profile (handles both new submission and resubmission)
  const { error: updateError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      campus: campus as any,
      matric_no: matricNo,
      ic_document_path: filePath,
      verification_status: 'pending', // Reset to pending on resubmission
      rejection_reason: null, // Clear previous rejection reason
    })

  if (updateError) {
    return { error: `Profile update failed: ${updateError.message}` }
  }

  // Update Auth Session Metadata immediately
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: fullName }
  })
  if (authError) console.error("Auth update failed:", authError)

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const callbackUrl = formData.get('callbackUrl') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Password and confirm password are required' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

