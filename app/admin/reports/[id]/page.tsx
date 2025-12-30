import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Flag, User, Package, Mail, MapPin, Clock, AlertCircle } from "lucide-react"
import { AdminBackButton } from "@/components/admin/admin-back-button"
import Link from "next/link"
import { ReportActions } from "@/components/admin/report-actions"
import { getReportById } from "@/app/admin/actions"
import { formatDistanceToNow } from "date-fns"

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  // Check admin access
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single()

  if (profile?.usm_role !== "admin") {
    redirect("/")
  }

  // Fetch report details
  const result = await getReportById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }

  const report = result.data
  const isItemReport = report.item !== null
  const reportType = isItemReport ? "item" : "user"

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-300 border">
            Pending
          </Badge>
        )
      case "reviewed":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-300 border">
            Reviewed
          </Badge>
        )
      case "dismissed":
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-300 border">
            Dismissed
          </Badge>
        )
      case "actioned":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-300 border">
            Actioned
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Back Button */}
      <AdminBackButton />

      {/* Report Detail Card */}
      <div className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-xl p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${
                  isItemReport
                    ? "bg-cyan-100 dark:bg-cyan-900/30"
                    : "bg-purple-100 dark:bg-purple-900/30"
                }`}
              >
                {isItemReport ? (
                  <Package className="h-6 w-6 text-cyan-600" />
                ) : (
                  <User className="h-6 w-6 text-purple-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-[TitleFont] tracking-wide font-normal">
                  {isItemReport ? "Item Report" : "User Report"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {getStatusBadge(report.status)}
        </div>

        {/* Report Reason */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Report Reason
            </h3>
          </div>
          <p className="text-xl font-semibold">{report.reason}</p>
        </div>

        {/* Report Details */}
        {report.details && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Additional Details
            </h3>
            <p className="text-base leading-relaxed bg-muted/30 p-4 rounded-lg">
              {report.details}
            </p>
          </div>
        )}

        {/* Reporter Information */}
        <div className="bg-muted/30 rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Reported By
            </h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-semibold">{report.reporter.full_name}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{report.reporter.email}</span>
                </div>
                {report.reporter.campus && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{report.reporter.campus}</span>
                  </div>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/users/${report.reporter.id}`}>
                View Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* Reported Content */}
        {isItemReport && report.item ? (
          <div className="bg-cyan-50 dark:bg-cyan-900/10 border-2 border-cyan-200 dark:border-cyan-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Reported Item
              </h3>
            </div>
            
            <div className="flex gap-6">
              {/* Item Image */}
              {report.item.images && report.item.images.length > 0 && (
                <div className="w-32 h-32 shrink-0">
                  <img
                    src={report.item.images[0]}
                    alt={report.item.title}
                    className="w-full h-full object-cover rounded-lg border-2 border-border"
                  />
                </div>
              )}
              
              {/* Item Details */}
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-lg font-semibold mb-1">{report.item.title}</h4>
                  <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                    RM {report.item.price?.toFixed(2)}
                  </p>
                </div>
                
                {report.item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {report.item.description}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {report.item.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ID: {report.item.id.substring(0, 8)}...
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/items/${report.item.id}`} target="_blank">
                      View Listing
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/listings/${report.item.id}`}>
                      Admin View
                    </Link>
                  </Button>
                  {report.item.seller_id && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/users/${report.item.seller_id}`}>
                        View Seller
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          report.target_user && (
            <div className="bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Reported User
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold">{report.target_user.full_name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{report.target_user.email}</span>
                    </div>
                    {report.target_user.campus && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{report.target_user.campus}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="capitalize">
                      {report.target_user.verification_status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ID: {report.target_user.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/users/${report.target_user.id}`}>
                    View Profile
                  </Link>
                </Button>
              </div>
            </div>
          )
        )}

        {/* Action Buttons */}
        <div className="pt-6 border-t">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Actions
          </h3>
          <ReportActions
            reportId={report.id}
            reportStatus={report.status}
            reportType={reportType}
            targetUserId={report.target_user?.id}
            targetUserName={report.target_user?.full_name}
            targetItemId={report.item?.id}
            targetItemTitle={report.item?.title}
          />
        </div>
      </div>
    </div>
  )
}
