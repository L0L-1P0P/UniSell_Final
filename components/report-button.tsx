"use client"

import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import Link from "next/link"

interface ReportButtonProps {
  itemId: string
}

export function ReportButton({ itemId }: ReportButtonProps) {
  // Placeholder logic
  return (
    <Button variant="ghost" size="sm" className="w-full text-muted-foreground" asChild>
      <Link href={`/report?item=${itemId}`}>
        <Flag className="mr-2 h-4 w-4" />
        Report Listing
      </Link>
    </Button>
  )
}
