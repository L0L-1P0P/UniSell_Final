"use client"

import { StatCard } from "@/components/admin/stat-card"
import { UserCheck } from "lucide-react"
import { useOnlineUsers } from "@/components/providers/online-users-provider"

export function OnlineUserCounter() {
  const { onlineCount } = useOnlineUsers()

  return (
    <StatCard
      title="Active Users (Online)"
      value={onlineCount}
      icon={UserCheck}
      variant="default"
    />
  )
}
