'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { completeOnboarding } from "@/app/auth/actions"
import { useState } from "react"

export function OnboardingForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await completeOnboarding(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Redirect handled by server action
    }
  }

  return (
    <Card className="w-full max-w-lg glass-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-cyan-500">Complete Your Profile</CardTitle>
        <CardDescription className="text-center">
          We need a few more details to verify your student status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
            <Input id="fullName" name="fullName" placeholder="John Doe" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="campus" className="text-foreground">Campus</Label>
            <Select name="campus" required>
              <SelectTrigger>
                <SelectValue placeholder="Select your campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Main">Main Campus</SelectItem>
                <SelectItem value="Engineering">Engineering Campus</SelectItem>
                <SelectItem value="Health">Health Campus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricNo" className="text-foreground">Matric Number</Label>
            <Input id="matricNo" name="matricNo" placeholder="123456" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icDocument" className="text-foreground">IC / Passport Verification</Label>
            <Input id="icDocument" name="icDocument" type="file" accept="image/*,.pdf" required />
            <p className="text-xs text-muted-foreground">
              Upload a clear image or PDF of your student ID or IC for verification.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" disabled={loading}>
            {loading ? "Submitting..." : "Complete Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
