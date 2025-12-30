"use client"

import Link from "next/link"
import { MessageCircle, MoreVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConversationUnreadBadge } from "./conversation-unread-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteConversation } from "@/app/chat/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ChatSidebarProps {
  conversations: any[]
  currentChatId?: string
}

export function ChatSidebar({ conversations, currentChatId }: ChatSidebarProps) {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + "y"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + "mo"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + "d"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + "h"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + "m"
    return "now"
  }

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Delete this conversation? Messages will be hidden from your view.')) return
    
    setDeletingId(conversationId)
    const result = await deleteConversation(conversationId)
    
    if (result.success) {
      // If we deleted the currently open conversation, redirect to chat list
      if (currentChatId === conversationId) {
        router.push('/chat')
      } else {
        router.refresh()
      }
    } else {
      alert(result.error || 'Failed to delete conversation')
    }
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col h-full bg-[#fafafa] dark:bg-[#2c2c2c] border-r border-gray-200 dark:border-none z-10 shadow-md dark:shadow-[2px_0_6px_0px_rgba(255,255,255,0.1),0_0px_4px_-1px_rgba(255,255,255,0.1)]">
      {/* Header */}
      <div className="p-6 border-b border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-[#1e1e1e] shadow-md dark:shadow-[0_2px_6px_0px_rgba(255,255,255,0.1),0_0px_4px_-1px_rgba(255,255,255,0.1)]">
        <h1 className="text-2xl font-[TitleFont] tracking-wide font-normal">Messages</h1>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations && conversations.length > 0 ? (
          <div className="divide-y divide-border/40">
            {conversations.map((conv: any) => {
              const isActive = conv.id === currentChatId
              const otherUser = conv.other_user
              const lastMessage = conv.last_message

              return (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={cn(
                    "group block p-4 font-[TitleFont] tracking-wide font-normal transition-colors hover:bg-muted/50",
                    isActive && "bg-[#00dee8]/10 hover:bg-[#00dee8]/15"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="shrink-0 w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <span className="text-lg font-normal text-cyan-600">
                        {otherUser?.full_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="font-normal text-sm truncate">
                          {otherUser?.full_name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          {lastMessage?.created_at && (
                            <span className="text-xs text-muted-foreground font-normal">
                              {timeAgo(lastMessage.created_at)}
                            </span>
                          )}
                          <ConversationUnreadBadge conversationId={conv.id} />
                        </div>
                      </div>
                      
                      {lastMessage?.content && (
                        <p className="text-sm text-muted-foreground truncate font-normal">
                          {lastMessage.content}
                        </p>
                      )}
                      
                      {conv.item?.title && (
                        <p className="text-xs text-muted-foreground/70 truncate mt-1">
                          {conv.item.title}
                        </p>
                      )}
                    </div>

                    {/* Kebab Menu - Shows on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.preventDefault()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            disabled={deletingId === conv.id}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => handleDelete(e, conv.id)}
                            className="text-red-600 cursor-pointer"
                            disabled={deletingId === conv.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingId === conv.id ? 'Deleting...' : 'Delete Chat'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-muted/50 rounded-full p-6 mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No messages yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Start chatting with sellers!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
