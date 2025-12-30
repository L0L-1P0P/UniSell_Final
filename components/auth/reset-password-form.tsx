'use client'

import React, { useState } from 'react'
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
import { resetPassword } from "@/app/auth/actions"
import { useRouter } from 'next/navigation'

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)

    const result = await resetPassword(formData)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
      setLoading(false)
    } else {
      setMessage({ type: 'success', text: 'Password reset successfully. Redirecting to login...' })
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  return (
    <div className="w-full max-w-md glass-card flex flex-col gap-6 py-6">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-cyan-500">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">New Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
            <Input 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              required 
            />
          </div>
          
          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {message.text}
            </p>
          )}

          <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" disabled={loading}>
            {loading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </div>
  )
}
