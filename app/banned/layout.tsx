import { ThemeProvider } from "@/components/theme-provider"

export default function BannedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout wraps the banned page without the navbar from root layout
  // The banned page will render as-is without navigation
  return <>{children}</>
}
