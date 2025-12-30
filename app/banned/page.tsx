import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Clock, LogOut } from "lucide-react"
import Link from "next/link"
import { signout } from "@/app/auth/actions"

export const metadata = {
  title: "Account Suspended - UniSell",
}

export default async function BannedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch ban details
  const { data: profile } = await supabase
    .from('profiles')
    .select('banned_until, ban_reason, full_name')
    .eq('id', user.id)
    .single()

  // If not banned or ban expired, redirect to home
  if (!profile?.banned_until || new Date(profile.banned_until) <= new Date()) {
    redirect('/')
  }

  const bannedUntil = new Date(profile.banned_until)
  const isPermanent = bannedUntil.getFullYear() > new Date().getFullYear() + 50

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-red-50 dark:bg-red-950/20">
      <div className="w-full max-w-2xl space-y-6">
        {/* Ban Alert */}
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-xl font-bold">Account Suspended</AlertTitle>
          <AlertDescription className="mt-4 space-y-4">
            <div>
              <p className="font-semibold">Your account has been temporarily suspended.</p>
              <p className="text-sm mt-2">
                You cannot access UniSell marketplace until your ban is lifted.
              </p>
            </div>

            {/* Ban Reason */}
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">Reason for Suspension:</p>
              <p className="text-sm">{profile.ban_reason || 'No reason provided'}</p>
            </div>

            {/* Ban Duration */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <div>
                <span className="font-semibold">
                  {isPermanent ? 'Permanent Ban' : 'Ban Expires:'}
                </span>
                {!isPermanent && (
                  <span className="ml-2">
                    {bannedUntil.toLocaleString('en-MY', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <form action={signout} className="pt-2">
              <Button variant="outline" type="submit" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
          </AlertDescription>
        </Alert>

        {/* Support Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>If you believe this is a mistake, please contact support.</p>
        </div>
      </div>
    </div>
  )
}
