'use client'

import { Button } from "@/components/ui/button"
import { MoreVertical, Trash, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteItem } from "@/app/items/actions"
import { useRouter } from "next/navigation"

interface ItemActionsProps {
  itemId: string
}

export function ItemActions({ itemId }: ItemActionsProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return

    const result = await deleteItem(itemId)
    if (result?.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const handleEdit = () => {
    router.push(`/sell?edit=${itemId}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-cyan-100 dark:hover:bg-cyan-900/20 hover:scale-110 transition-all">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-[#1e1e1e]">
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors">
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
          <Trash className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
