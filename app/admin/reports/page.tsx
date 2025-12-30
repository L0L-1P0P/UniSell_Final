"use client"

import { use } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ReportCard } from "@/components/admin/report-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flag, Package, User, CheckCircle, X, Clock } from "lucide-react"
import { getReports } from "@/app/admin/actions"
import { useEffect, useState } from "react"

export default function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = use(searchParams)
  
  const [reports, setReports] = useState<any[]>([])
  const [allReports, setAllReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Default filters
  const statusFilter = params.status || "all"
  const typeFilter = params.type as "item" | "user" | undefined

  useEffect(() => {
    async function fetchReports() {
      setIsLoading(true)
      
      // Fetch filtered reports
      const filters: { status?: string; type?: "item" | "user" } = {}
      if (statusFilter !== "all") {
        filters.status = statusFilter
      }
      if (typeFilter) {
        filters.type = typeFilter
      }

      const result = await getReports(filters)
      setReports(result.data || [])

      // Fetch all reports for counts
      const allReportsResult = await getReports()
      setAllReports(allReportsResult.data || [])
      
      setIsLoading(false)
    }

    fetchReports()
  }, [statusFilter, typeFilter])

  const pendingCount = allReports.filter((r) => r.status === "pending").length
  const reviewedCount = allReports.filter((r) => r.status === "reviewed").length
  const dismissedCount = allReports.filter((r) => r.status === "dismissed").length
  const actionedCount = allReports.filter((r) => r.status === "actioned").length

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams()
    params.set("status", value)
    if (typeFilter) {
      params.set("type", typeFilter)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleTypeFilter = (type?: "item" | "user") => {
    const params = new URLSearchParams()
    params.set("status", statusFilter)
    if (type) {
      params.set("type", type)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-[TitleFont] tracking-wide font-normal">
            Reports Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and take action on user and item reports
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All ({allReports.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedCount})
          </TabsTrigger>
          <TabsTrigger value="actioned">
            Actioned ({actionedCount})
          </TabsTrigger>
          <TabsTrigger value="dismissed">
            Dismissed ({dismissedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {/* Type Filter Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              size="sm"
              onClick={() => handleTypeFilter()}
              className={!typeFilter ? "bg-[#00dee8] text-black hover:bg-[#00c5d0]" : "bg-[#1e1e1e] text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground"}
            >
              <Flag className="h-4 w-4 mr-2" />
              All Types
            </Button>
            <Button
              size="sm"
              onClick={() => handleTypeFilter("item")}
              className={typeFilter === "item" ? "bg-[#00dee8] text-black hover:bg-[#00c5d0]" : "bg-[#1e1e1e] text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground"}
            >
              <Package className="h-4 w-4 mr-2" />
              Item Reports
            </Button>
            <Button
              size="sm"
              onClick={() => handleTypeFilter("user")}
              className={typeFilter === "user" ? "bg-[#00dee8] text-black hover:bg-[#00c5d0]" : "bg-[#1e1e1e] text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground"}
            >
              <User className="h-4 w-4 mr-2" />
              User Reports
            </Button>
          </div>

          {/* Reports Grid */}
          {isLoading ? (
            <div className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-xl p-12 text-center">
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-xl p-12 text-center">
              <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? "There are no reports in the system."
                  : `There are no ${statusFilter} reports.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {reports.map((report: any) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
