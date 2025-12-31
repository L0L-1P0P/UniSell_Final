import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { NavbarHider } from "@/components/navbar-hider";
import { AutoLogout } from "@/components/auth/auto-logout";
import { createClient } from "@/utils/supabase/server";
import { OnlineUsersProvider } from "@/components/providers/online-users-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniSell",
  description: "USM Marketplace",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('usm_role')
      .eq('id', user.id)
      .single()
    
    isAdmin = profile?.usm_role === 'admin'
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <OnlineUsersProvider>
            <NavbarHider />
            {user && <AutoLogout timeoutMs={1800000} />}
            <Navbar user={user} isAdmin={isAdmin} />
            {children}
          </OnlineUsersProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
