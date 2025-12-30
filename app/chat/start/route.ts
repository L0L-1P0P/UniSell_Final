import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 1. Fetch Item to get seller_id
  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("seller_id")
    .eq("id", itemId)
    .single();

  if (itemError || !item) {
    return redirect("/");
  }

  if (item.seller_id === user.id) {
    // Cannot chat with yourself
    return redirect(`/items/${itemId}`);
  }

  // 2. Check if conversation exists
  const { data: existingConv } = await supabase
    .from("conversations")
    .select("id")
    .eq("item_id", itemId)
    .eq("buyer_id", user.id)
    .single();

  if (existingConv) {
    return redirect(`/chat/${existingConv.id}`);
  }

  // 3. Create new conversation
  const { data: newConv, error: createError } = await supabase
    .from("conversations")
    .insert({
      item_id: itemId,
      buyer_id: user.id,
      seller_id: item.seller_id,
    })
    .select("id")
    .single();

  if (createError || !newConv) {
    console.error("Failed to create conversation:", createError);
    return redirect(`/items/${itemId}`);
  }

  return redirect(`/chat/${newConv.id}`);
}
