"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Megaphone, Save } from "lucide-react"
import { updateAnnouncementBar } from "@/app/admin/announcements-actions"
import { useRouter } from "next/navigation"

interface AnnouncementBarEditorProps {
  initialContent: string | null
  isActive: boolean
}

export function AnnouncementBarEditor({ initialContent, isActive }: AnnouncementBarEditorProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent || "")
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    const result = await updateAnnouncementBar(content)

    if (result.success) {
      setMessage({ type: "success", text: "Announcement bar updated successfully" })
      router.refresh()
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update" })
    }

    setIsSaving(false)
  }

  return (
    <div className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="h-5 w-5 text-[#00dee8]" />
        <h2 className="text-xl font-semibold">Announcement Bar</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="content">Banner Text</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Text displayed at the very top of the site. Leave empty to hide the bar.
          </p>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. Welcome to UniSell! The exclusive marketplace for USM students."
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            Status:{" "}
            <span className={content.trim() ? "text-green-500 font-medium" : "text-muted-foreground"}>
              {content.trim() ? "Active" : "Hidden (Empty)"}
            </span>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-[#00dee8] text-black hover:bg-[#00c5d0]"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.type === "success" 
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
