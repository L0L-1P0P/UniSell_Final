import { MessageCircle } from "lucide-react"

export default function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#181818]">
      <div className="bg-muted/50 rounded-full p-8 mb-6">
        <MessageCircle className="h-16 w-16 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-[TitleFont] tracking-wide font-normal mb-2">Select a conversation</h2>
      <p className="text-gray-400 text-sm font-[TitleFont] tracking-wide font-normal">
        Choose a conversation from the sidebar to start messaging
      </p>
    </div>
  )
}
