'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signup } from "@/app/auth/actions"
import { useState } from "react"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      setPassword("")
      setConfirmPassword("")
      return
    }

    if (!email.endsWith("@student.usm.my") && !email.endsWith("@usm.my")) {
      setError("Only USM emails are allowed (@student.usm.my or @usm.my)")
      setLoading(false)
      return
    }

    const result = await signup(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      setPassword("")
      setConfirmPassword("")
    } else if (result?.success) {
      setIsSuccess(true)
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md glass-card flex flex-col gap-6 py-6">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <div className="rounded-full bg-cyan-500/10 p-4">
            <Mail className="h-12 w-12 text-cyan-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-cyan-500">Check your email</CardTitle>
          <CardDescription className="text-center text-base">
            We have sent a verification link to <span className="font-semibold text-foreground">{email}</span>. Please verify your account before logging in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
            <Link href="/login">Proceed to Login</Link>
          </Button>
        </CardContent>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md glass-card flex flex-col gap-6 py-6">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-cyan-500">Sign Up</CardTitle>
        <CardDescription className="text-center">
          Create an account with your USM email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="m@student.usm.my" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-500 hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </div>
  )
}
