"use client"

import { usePathname } from "next/navigation"
import { ChatSidebar } from "./chat-sidebar"

interface ChatLayoutWrapperProps {
  conversations: any[]
  children: React.ReactNode
}

export function ChatLayoutWrapper({ conversations, children }: ChatLayoutWrapperProps) {
  const pathname = usePathname()
  
  // Determine if we're on a specific chat page
  const isChatOpen = pathname !== "/chat"
  
  // Extract current chat ID from pathname
  const currentChatId = isChatOpen ? pathname.split("/").pop() : undefined

  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-clip justify-center bg-white dark:bg-[#1e1e1e] relative z-10">
      <div className="flex w-full max-w-7xl bg-white dark:bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 ${isChatOpen ? 'hidden md:flex' : 'flex'} flex-col`}>
          <ChatSidebar conversations={conversations} currentChatId={currentChatId} />
        </div>

        {/* Main Content */}
        <div className={`flex-1 ${isChatOpen ? 'flex' : 'hidden md:flex'} flex-col`}>
          {children}
        </div>
      </div>
    </div>
  )
}
