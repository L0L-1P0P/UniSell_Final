'use server'

import { createClient } from "@/utils/supabase/server"

interface ReportPayload {
  type: 'listing' | 'user'
  id: string
  reason: string
  details: string
}

export async function submitReport(payload: ReportPayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "You must be logged in to submit a report" }

  // Check for duplicate report
  let existingReport
  if (payload.type === 'listing') {
    const { data } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('item_id', payload.id)
      .maybeSingle()
    
    existingReport = data
  } else {
    const { data } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('target_user_id', payload.id)
      .maybeSingle()
    
    existingReport = data
  }

  if (existingReport) {
    return { 
      error: payload.type === 'listing' 
        ? "You already reported this item. We will review it. Thank you for protecting our platform."
        : "You already reported this user. We will review it. Thank you for protecting our platform."
    }
  }

  // Prepare report data
  const reportData: any = {
    reporter_id: user.id,
    reason: payload.reason,
    details: payload.details,
    status: 'pending'
  }

  if (payload.type === 'listing') {
    reportData.item_id = payload.id
  } else {
    reportData.target_user_id = payload.id
  }

  // Insert report
  const { error } = await supabase
    .from('reports')
    .insert(reportData)

  if (error) {
    console.error("Error submitting report:", error)
    return { error: "Failed to submit report. Please try again." }
  }

  return { success: true }
}
