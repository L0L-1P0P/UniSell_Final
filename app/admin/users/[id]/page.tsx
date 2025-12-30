import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, School, User, Calendar, CheckCircle, XCircle, Phone, FileText } from "lucide-react"
import Link from "next/link"
import { AdminBackButton } from "@/components/admin/admin-back-button"
import { UserActions } from "@/components/admin/user-actions"
import { DangerZone } from "@/components/admin/danger-zone"

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // Get current user to check for self-profile
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Fetch user details
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !user) {
    notFound()
  }


  // Get signed URL for IC document if it exists (private bucket)
  let icDocumentUrl = null
  let icDocumentError = null
  if (user.ic_document_path) {
    console.log('[User Detail] IC Path:', user.ic_document_path)
    const { data, error: storageError } = await supabase.storage
      .from('private-documents')
      .createSignedUrl(user.ic_document_path, 3600) // 1 hour expiry
    
    if (storageError) {
      console.error('[User Detail] Storage error:', storageError)
      icDocumentError = storageError.message || 'Failed to load IC document'
    } else {
      console.log('[User Detail] Signed URL generated:', data?.signedUrl)
      icDocumentUrl = data?.signedUrl || null
    }
  } else {
    console.log('[User Detail] No IC document path found')
  }

  // Fetch user statistics
  const { count: totalListings } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', id)

  const { count: totalSold } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', id)
    .eq('status', 'sold')

  const { count: reportsReceived } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('target_user_id', id)

  const { count: activeConversations } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .or(`buyer_id.eq.${id},seller_id.eq.${id}`)
    .eq('buyer_deleted', false)
    .eq('seller_deleted', false)

  return (
    <div className="p-8 space-y-6">
      {/* Back Button */}
      <AdminBackButton />

      {/* User Detail Card */}
      <div className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-xl p-8 space-y-6">
        {/* Compact Header */}
        <div className="flex flex-col gap-2 border-b pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-[TitleFont] tracking-wide font-normal">
              {user.full_name}
            </h1>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={
                  user.verification_status === 'verified' 
                    ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-50 hover:border-green-600" 
                    : user.verification_status === 'rejected'
                    ? "border-red-600 bg-red-50 text-red-700 hover:bg-red-50 hover:border-red-600"
                    : "border-yellow-600 bg-yellow-50 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-600"
                }
              >
                {user.verification_status === 'verified' 
                  ? 'Verified' 
                  : user.verification_status === 'rejected'
                  ? 'Rejected'
                  : 'Pending Verification'}
              </Badge>
              {user.campus && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200 border">
                  {user.campus}
                </Badge>
              )}
              <Badge variant="outline" className="capitalize">{user.usm_role || 'user'}</Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span>{user.email}</span>
            </div>
            {user.mobile_number && (
              <div className="flex items-center gap-1.5">
                <span className="text-border">|</span>
                <Phone className="h-3.5 w-3.5" />
                <span>{user.mobile_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Compact User Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Matric Number */}
          <div className="bg-muted/30 p-3 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <User className="h-3.5 w-3.5" />
              Matric ID
            </div>
            <p className="font-medium truncate">{user.matric_no || 'Not provided'}</p>
          </div>

          {/* Joined Date */}
          <div className="bg-muted/30 p-3 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" />
              Joined
            </div>
            <p className="font-medium truncate">
              {user.joined_at ? new Date(user.joined_at).toLocaleDateString('en-MY', {
                day: '2-digit', month: 'short', year: 'numeric'
              }) : 'Unknown'}
            </p>
          </div>

          {/* IC Document Status */}
          <div className="bg-muted/30 p-3 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {user.ic_document_path ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-red-600" />}
              IC Document
            </div>
            <div className="font-medium">
               {user.ic_document_path ? (
                 <span className="text-green-600 flex items-center gap-1.5">
                   Uploaded
                 </span>
               ) : (
                 <span className="text-red-600 flex items-center gap-1.5">
                   Missing
                 </span>
               )}
            </div>
          </div>
        </div>

        {/* User Statistics - Only show for verified or rejected users */}
        {user.verification_status !== 'pending' && (
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold font-[TitleFont] mb-4">
              User Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-cyan-600">{totalListings || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Listings</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{totalSold || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Items Sold</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">{activeConversations || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Active Chats</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className={`text-3xl font-bold ${(reportsReceived || 0) > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {reportsReceived || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Reports Received</p>
              </div>
            </div>
          </div>
        )}

        {/* Self Profile Notice */}
        {currentUser?.id === user.id && (
           <div className="pt-6 border-t border-yellow-200 dark:border-yellow-900">
             <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
               <span className="font-medium">You are viewing your own profile. Ban and delete actions are disabled.</span>
             </div>
           </div>
        )}

        {/* IC Document Image Preview */}
        {user.ic_document_path && icDocumentUrl && (
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold font-[TitleFont] mb-4">
              IC Document Preview
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 inline-block">
              <img 
                src={icDocumentUrl} 
                alt="IC Document" 
                className="max-w-md max-h-96 object-contain rounded-lg border-2 border-border"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Click link below to open in new tab for closer inspection
              </p>
              <a 
                href={icDocumentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block mt-2 text-center text-sm text-blue-600 hover:underline"
              >
                Open Full Size →
              </a>
            </div>
          </div>
        )}

        {/* No IC Document Notice */}
        {!user.ic_document_path && user.verification_status === 'pending' && (
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Warning: User has not uploaded IC document</span>
            </div>
          </div>
        )}

        {/* IC Document Error Notice */}
        {user.ic_document_path && icDocumentError && (
          <div className="pt-6 border-t">
            <div className="flex flex-col gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Error: Unable to load IC document</span>
              </div>
              <p className="text-sm">{icDocumentError}</p>
              <p className="text-sm text-muted-foreground">
                Path: {user.ic_document_path}
              </p>
              <p className="text-xs text-muted-foreground">
                This may be due to storage permissions. Admins need SELECT policy on storage.objects for private-documents bucket.
              </p>
            </div>
          </div>
        )}

        {/* Actions - Only show if pending */}
        {user.verification_status === 'pending' && (
          <UserActions userId={user.id} userName={user.full_name} />
        )}

        {/* Already Verified Notice */}
        {user.verification_status === 'verified' && (
          <div className="pt-6 border-t">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">This user is already verified</span>
            </div>
          </div>
        )}

        {/* Danger Zone - Only show for verified or rejected users, AND not for self - MOVED TO BOTTOM */}
        {user.verification_status !== 'pending' && currentUser?.id !== user.id && (
          <DangerZone userId={user.id} userName={user.full_name} />
        )}
      </div>
    </div>
  )
}
