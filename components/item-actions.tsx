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
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
          <Trash className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
