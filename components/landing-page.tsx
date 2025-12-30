import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between 
      bg-[radial-gradient(circle_at_center,#bbfcfc_10%,#f0fafa_60%,#f7f7f2_100%)]
      dark:bg-[radial-gradient(circle_at_center,rgba(0,124,130,0.2)_10%,rgba(0,173,181,0.1)_20%,#1e1e1e_55%)]
      text-foreground transition-colors duration-500">
      
      {/* Main Section */}
      <main className="grow flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-2xl">
          {/* Logo */}
          <div className="animate-fade-in-up space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="bg-transparent rounded-2xl p-1">
                <Image
                  src="/logo2.png"
                  alt="UniSell Logo"
                  width={86}
                  height={86}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-6xl font-normal font-[TitleFont] text-balance bg-linear-to-r from-cyan-600 to-cyan-400 dark:from-[#3bf2fc] dark:to-[#019097] bg-clip-text text-transparent">
              UniSell
            </h1>
          </div>

          {/* Tagline */}
          <p className="font-[TitleFont] text-lg text-muted-foreground text-balance animate-fade-in-up animate-delay-200 leading-relaxed">
            Buy, Sell & Connect with Verified USM Students.
          </p>

          {/* CTA Buttons */}
          <div className="font-[TitleFont] flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center animate-fade-in-up animate-delay-400">
            <Button asChild size="lg" variant="glowalt" className="font-normal text-lg px-8 py-6 rounded-xl">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="lg" variant="glow" className="font-normal text-lg px-8 py-6 rounded-xl">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-xs text-muted-foreground animate-fade-in-up animate-delay-400">
            Exclusive marketplace for <span className="font-medium text-foreground">@student.usm.my</span> verified students
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-muted-foreground transition-colors duration-500">
        <div className="container mx-auto px-4 text-center text-sm dark:text-gray-300 text-gray-600">
          <p>&copy; {new Date().getFullYear()} <span className="font-semibold text-gray-800 dark:text-gray-200">UniSell</span> - Universiti Sains Malaysia</p>
        </div>
      </footer>
    </div>
  )
}
