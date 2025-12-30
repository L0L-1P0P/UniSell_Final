"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Flag, User, Package, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Reporter {
  id: string
  full_name: string
  email: string
}

interface ReportedItem {
  id: string
  title: string
  images: string[]
  status: string
}

interface ReportedUser {
  id: string
  full_name: string
  email: string
}

interface Report {
  id: string
  reason: string
  details: string | null
  status: string
  created_at: string
  reporter: Reporter
  item: ReportedItem | null
  target_user: ReportedUser | null
}

interface ReportCardProps {
  report: Report
}

export function ReportCard({ report }: ReportCardProps) {
  const isItemReport = report.item !== null
  const reportType = isItemReport ? "Item Report" : "User Report"
  
  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-300 border">Pending</Badge>
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-300 border">Reviewed</Badge>
      case 'dismissed':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-300 border">Dismissed</Badge>
      case 'actioned':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-300 border">Actioned</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Truncate details text
  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "No additional details provided"
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <Link href={`/admin/reports/${report.id}`}>
      <div className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-xl p-4 hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isItemReport ? 'bg-cyan-100 dark:bg-cyan-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
              {isItemReport ? (
                <Package className={`h-5 w-5 ${isItemReport ? 'text-cyan-600' : 'text-purple-600'}`} />
              ) : (
                <User className="h-5 w-5 text-purple-600" />
              )}
            </div>
            <div>
              <Badge variant="outline" className={isItemReport ? "border-cyan-500 text-cyan-700" : "border-purple-500 text-purple-700"}>
                {reportType}
              </Badge>
            </div>
          </div>
          {getStatusBadge(report.status)}
        </div>

        {/* Report Reason */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Flag className="h-4 w-4 text-red-500" />
            <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Reason</span>
          </div>
          <p className="font-medium text-base">{report.reason}</p>
        </div>

        {/* Report Details */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {truncateText(report.details, 120)}
          </p>
        </div>

        {/* Reported Content Preview */}
        <div className="bg-muted/30 rounded-lg p-2.5 mb-3">
          {isItemReport && report.item ? (
            <div className="flex items-center gap-3">
              {report.item.images && report.item.images.length > 0 && (
                <img 
                  src={report.item.images[0]} 
                  alt={report.item.title}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{report.item.title}</p>
                <p className="text-xs text-muted-foreground">Item ID: {report.item.id.substring(0, 8)}...</p>
              </div>
            </div>
          ) : report.target_user ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{report.target_user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{report.target_user.email}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2.5 border-t">
          <div className="flex items-center gap-1.5">
            <span>Reported by:</span>
            <span className="font-medium">{report.reporter.full_name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
