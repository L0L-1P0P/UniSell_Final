'use client'

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, CheckCircle2, MoreVertical, Flag, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { completeDeal } from "@/app/items/actions"
import { ReviewForm } from "@/components/review-form"
import { markMessagesAsRead, deleteConversation } from "@/app/chat/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReportModal } from "@/components/report-modal"

type Message = {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_read: boolean
}

type Conversation = {
  id: string
  item: {
    id: string
    title: string
    images: string[]
    price: number
    status: string
    seller_id: string
    buyer_id: string | null
  }
  buyer_id: string
  seller_id: string
  other_user: {
    id: string
    full_name: string
  }
}

export default function ChatPage() {
  const { id } = useParams()
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [hasReview, setHasReview] = useState(false)
  const [isMarkingSold, setIsMarkingSold] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const fetchConversation = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return null
      }
      setUserId(user.id)

      // Fetch conversation details
      const { data: conv, error } = await supabase
        .from('conversations')
        .select(`
          *,
          item:items(id, title, images, price, seller_id, status, buyer_id),
          buyer:profiles!buyer_id(id, full_name),
          seller:profiles!seller_id(id, full_name)
        `)
        .eq('id', id)
        .single()

      if (error || !conv) {
        console.log("Conversation not found (may have been deleted):", id)
        // Conversation doesn't exist (deleted or never existed)
        // Redirect to chat list after a brief delay
        setTimeout(() => {
          router.push('/chat')
        }, 2000)
        return null
      }

      // Determine "other user"
      const isBuyer = conv.buyer_id === user.id
      const otherUser = isBuyer ? conv.seller : conv.buyer

      setConversation({
        id: conv.id,
        item: conv.item,
        buyer_id: conv.buyer_id,
        seller_id: conv.seller_id,
        other_user: otherUser
      })

      // Check if buyer has already reviewed
      if (conv.item.status === 'sold' && conv.item.buyer_id === user.id) {
        const { data: review } = await supabase
          .from('reviews')
          .select('id')
          .eq('item_id', conv.item.id)
          .eq('buyer_id', user.id)
          .single()
        
        setHasReview(!!review)
      }

      // Fetch existing messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      if (msgs) {
        setMessages(msgs)
      }
      
      return user
    }







    const init = async () => {
      await fetchConversation().then((user) => {
        if (user) {
          // Clean up existing if any (Safety check)
          if (channelRef.current) {
            supabase.removeChannel(channelRef.current)
          }

          // Real-time subscription
          const channel = supabase
            .channel(`chat_${id}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${id}`
              },
              async (payload) => {
                const newMessage = payload.new as Message
                // Deduplication: Ignore if it's from me (optimistically added)
                if (newMessage.sender_id === user.id) return
                
                setMessages((current) => [...current, newMessage])
                
                // Auto-mark as read if we're actively in this conversation
                // and the message is from the other user
                if (newMessage.sender_id !== user.id && !newMessage.is_read) {
                  await supabase
                    .from('messages')
                    .update({ is_read: true })
                    .eq('id', newMessage.id)
                }
              }
            )
            .subscribe((status) => {

            })
            
          channelRef.current = channel
        }
      })
    }

    init()

    return () => {
      // Cleanup on unmount
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [id, supabase, router])

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (!id || !userId) return

    const markAsRead = async () => {
      await markMessagesAsRead(id as string)
    }

    markAsRead()
  }, [id, userId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    const content = newMessage.trim()
    
    // Optimistic Update
    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      content,
      sender_id: userId,
      created_at: new Date().toISOString(),
      is_read: false
    }
    
    setMessages((prev) => [...prev, tempMessage])
    setNewMessage("")

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_id: userId,
        content: content,
        is_read: false
      })

    if (error) {
      console.error('Error sending message:', error)
      // Remove optimistic message on error
      setMessages((prev) => prev.filter(msg => msg.id !== tempId))
      setNewMessage(content) // Restore the message text
    } else {
      // Reset the deleted flag for the recipient when a new message is sent
      // This makes the conversation reappear for them
      const isBuyer = conversation?.buyer_id === userId
      const resetField = isBuyer ? 'seller_deleted' : 'buyer_deleted'
      
      await supabase
        .from('conversations')
        .update({ [resetField]: false })
        .eq('id', id)
    }
  }

  const handleMarkAsSold = async () => {
    if (!conversation) return
    
    setIsMarkingSold(true)
    const result = await completeDeal(conversation.item.id, conversation.buyer_id)
    
    if (result.error) {
      alert(result.error)
      setIsMarkingSold(false)
    } else {
      // Refresh the page to show updated state
      window.location.reload()
    }
  }

  const handleDeleteChat = async () => {
    if (!confirm('Delete this conversation? Messages will be hidden from your view.')) return

    const result = await deleteConversation(id as string)
    if (result.success) {
      router.push('/chat')
    } else {
      alert(result.error || 'Failed to delete conversation')
    }
  }

  if (!conversation || !userId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] dark:bg-[#181818] bg-white flex flex-col items-center justify-center font-[TitleFont] tracking-wide font-normal">
        <p className="text-lg mb-2">{conversation === null ? 'Chat Deleted' : 'Loading chat...'}</p>
        {conversation === null && (
          <p className="text-sm text-muted-foreground">Redirecting to Messages...</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-full dark:bg-[#181818] bg-[#f0f8ff] overflow-hidden">
      {/* Header */}
      <header className="font-[TitleFont] tracking-wide font-normal border-b border-gray-300 dark:border-none bg-background/95 backdrop-blur p-4 flex items-center gap-4 z-10 shrink-0 shadow-md dark:shadow-[0px_2px_6px_0px_rgba(255,255,255,0.1)]">
        <Button asChild variant="ghost" size="icon" className="md:hidden">
          <Link href="/chat">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        
        <div className="flex items-center gap-3">
           <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
              {/* Placeholder Avatar */}
              <div className="flex items-center justify-center h-full w-full bg-cyan-500/20 text-cyan-600 font-normal">
                 {conversation.other_user.full_name?.[0]?.toUpperCase() || '?'}
              </div>
           </div>
           <div>
              <h2 className="font-normal leading-none">{conversation.other_user.full_name}</h2>
              <p className="text-xs text-muted-foreground mt-1 font-normal">
                 {conversation.item.title} • RM {conversation.item.price}
              </p>
           </div>
        </div>

        {/* Mark as Sold Button - Only for seller when item is available and buyer has messaged */}
        {conversation.item.seller_id === userId && 
         conversation.item.status === 'available' && 
         messages.some(msg => msg.sender_id === conversation.buyer_id) && (
          <Button
            onClick={handleMarkAsSold}
            disabled={isMarkingSold}
            className="ml-auto bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isMarkingSold ? "Marking..." : "Mark as Sold"}
          </Button>
        )}

        {/* Report User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={
                conversation.item.seller_id === userId && 
                conversation.item.status === 'available' && 
                messages.some(msg => msg.sender_id === conversation.buyer_id)
                  ? '' 
                  : 'ml-auto'
              }
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-[#1e1e1e]">
            <ReportModal
              type="user"
              id={conversation.other_user.id}
              name={conversation.other_user.full_name}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Flag className="mr-2 h-4 w-4 text-red-600" />
                  <span className="text-red-600">Report User</span>
                </DropdownMenuItem>
              }
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeleteChat}
              className="text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Chat Content Wrapper */}
      {conversation && (
        <>

      {/* Status Banners - Appear under header */}
      {conversation.item.status === 'deleted' && (
        <div className="font-[TitleFont] tracking-wide bg-destructive/10 text-destructive px-4 py-3 text-center font-normal border-b border-destructive/20 shrink-0">
          <p className="font-semibold">This item has been deleted by the seller.</p>
        </div>
      )}
      
      {/* Sold to another buyer */}
      {conversation.item.status === 'sold' && conversation.item.buyer_id !== userId && (
        <div className="p-4 border-b border-border/40 bg-yellow-50 dark:bg-yellow-900/20 text-center shrink-0">
          <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
            This item has been sold to another buyer.
          </p>
        </div>
      )}
      
      {/* Review Form - For buyers after purchase */}
      {conversation.item.status === 'sold' && conversation.item.buyer_id === userId && !hasReview && (
        <div className="shrink-0">
          <ReviewForm
            itemId={conversation.item.id}
            sellerId={conversation.seller_id}
            sellerName={conversation.other_user.full_name}
            onSuccess={() => setHasReview(true)}
          />
        </div>
      )}
      
      {/* Review submitted confirmation */}
      {conversation.item.status === 'sold' && hasReview && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 text-center shrink-0">
          <p className="text-green-700 dark:text-green-300 font-semibold">
            ✓ Thank you for your review!
          </p>
        </div>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender_id === userId
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] md:max-w-[60%] px-4 py-2 rounded-2xl ${
                    isMe 
                      ? 'bg-[#45f6ff] dark:bg-[#005a5f] text-black dark:text-white rounded-tr-none shadow-lg' 
                      : 'dark:bg-[#222222] bg-white text-foreground rounded-tl-none shadow-lg'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-gray-800 dark:text-gray-200' : 'text-muted-foreground'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>


      {/* Input Area - Only show if item is available or sold to current user (without review shown above) */}
      {(conversation.item.status === 'available' || 
        (conversation.item.status === 'sold' && conversation.item.buyer_id === userId && hasReview) ||
        conversation.item.status === 'deleted') ? (
        <div className="p-4 z-5 border-t border-gray-300 dark:border-none bg-background shrink-0 shadow-[-2px_0px_6px_0px_rgba(0,0,0,0.1),-2px_0px_6px_0px_rgba(255,255,255,0.1)]">
          {conversation.item.status === 'available' ? (
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-cyan-600 hover:bg-cyan-700 text-white shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="text-center text-muted-foreground py-2">
              <p className="text-sm">Chat is closed</p>
            </div>
          )}
        </div>
      ) : null}
      </>
      )}
    </div>
  )
}
