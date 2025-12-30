import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  variant?: 'default' | 'warning' | 'critical'
  href?: string
}

export function StatCard({ title, value, icon: Icon, variant = 'default', href }: StatCardProps) {
  const variantStyles = {
    default: "border-border bg-white dark:bg-[#1e1e1e]",
    warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30",
    critical: "border-red-500 bg-red-50 dark:bg-red-900/30"
  }

  const textStyles = {
    default: "text-foreground",
    warning: "text-yellow-700 dark:text-yellow-400",
    critical: "text-red-700 dark:text-red-400"
  }

  const content = (
    <div className={cn(
      "p-6 rounded-xl border-2 transition-all hover:shadow-lg",
      variantStyles[variant],
      href && "cursor-pointer hover:scale-105"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {title}
          </p>
          <p className={cn(
            "text-4xl font-bold font-[TitleFont]",
            textStyles[variant]
          )}>
            {value.toLocaleString()}
          </p>
        </div>
        <div className={cn(
          "p-3 rounded-lg",
          variant === 'warning' && "bg-yellow-100 dark:bg-yellow-900/30",
          variant === 'critical' && "bg-red-100 dark:bg-red-900/30",
          variant === 'default' && "bg-muted"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            textStyles[variant]
          )} />
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
