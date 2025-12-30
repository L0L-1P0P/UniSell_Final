import { createClient } from "@/utils/supabase/server"
import { checkBanStatus } from "@/utils/ban-check"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] space-y-8">
      <h1 className="text-3xl font-[TitleFont] font-normal">Settings</h1>
      <div className="glass-card p-12 text-center">
        <p className="text-xl text-muted-foreground">App Settings Coming Soon...</p>
      </div>
    </div>
  )
}
