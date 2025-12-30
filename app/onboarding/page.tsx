import { OnboardingForm } from "@/components/onboarding-form"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // No profile found, treat as new user
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center p-4">
        <OnboardingForm />
      </div>
    )
  }

  if (profile.verification_status === 'verified') {
    redirect('/')
  }

  // Handle rejected status - show form with rejection alert
  if (profile.verification_status === 'rejected') {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Rejection Alert */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Rejected</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p><strong>Reason:</strong> {profile.rejection_reason || 'No reason provided'}</p>
              <p className="text-sm">Please correct your details below and submit again.</p>
            </AlertDescription>
          </Alert>

          {/* Unlocked form for resubmission */}
          <OnboardingForm />
        </div>
      </div>
    )
  }

  if (profile.ic_document_path) {
    // User has already submitted and is pending
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center p-4">
        <div className="w-full max-w-md glass-card flex flex-col gap-6 py-6">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-cyan-500">Verification in Progress</CardTitle>
            <CardDescription className="text-center">
              Your documents have been submitted and are under review.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-center text-muted-foreground">
              Please wait for Admin approval. You will be notified once your account is verified.
            </p>
            <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <OnboardingForm />
    </div>
  )
}
