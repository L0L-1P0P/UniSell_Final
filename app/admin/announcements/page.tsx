import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getAnnouncements, getAnnouncementBar } from "../announcements-actions"
import { AnnouncementsList } from "../../../components/admin/announcements-list"
import { AnnouncementUploadDialog } from "@/components/admin/announcement-upload-dialog"
import { AnnouncementBarEditor } from "@/components/admin/announcement-bar-editor"
import { ImageIcon } from "lucide-react"

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('usm_role')
    .eq('id', user.id)
    .single()
  
  if (currentUserProfile?.usm_role !== 'admin') {
    redirect('/')
  }

  // Fetch data in parallel
  const [announcementsResult, barResult] = await Promise.all([
    getAnnouncements(),
    getAnnouncementBar()
  ])

  const announcements = announcementsResult.data || []
  const barData = barResult

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-[TitleFont] tracking-wide font-normal">
          Announcements Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage site-wide announcements and hero carousel images
        </p>
      </div>

      {/* Announcement Bar Editor */}
      <AnnouncementBarEditor 
        initialContent={barData.content} 
        isActive={barData.is_active} 
      />

      <div className="border-t border-border my-8" />

      {/* Carousel Management Header */}
      <div className="flex items-center justify-between mt-8">
        <div>
          <h2 className="text-xl font-semibold">Hero Carousel</h2>
          <p className="text-sm text-muted-foreground">
            Manage images displayed in the home page hero slider
          </p>
        </div>
        <AnnouncementUploadDialog />
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-xl p-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Carousel Images</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first image to activate the carousel.
          </p>
          <AnnouncementUploadDialog />
        </div>
      ) : (
        <AnnouncementsList announcements={announcements} />
      )}
    </div>
  )
}
