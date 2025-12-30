"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ==================== ANNOUNCEMENT MANAGEMENT ====================

export async function getAnnouncements() {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated", data: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  if (profile?.usm_role !== "admin") {
    return { success: false, error: "Not authorized", data: null };
  }

  // Fetch 'carousel_image' type announcements ordered by display_order
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("type", "carousel_image") // Only fetch carousel images
    .order("display_order", { ascending: true });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data };
}

export async function getActiveAnnouncements() {
  const supabase = await createClient();

  // Fetch active 'carousel_image' announcements ordered by display_order (public access)
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .eq("type", "carousel_image") // Only fetch carousel images
    .order("display_order", { ascending: true });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data };
}

export async function getAnnouncementBar() {
  const supabase = await createClient();

  // Fetch the active text banner (type='text_banner')
  const { data, error } = await supabase
    .from("announcements")
    .select("content, is_active")
    .eq("type", "text_banner")
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "Row not found" error
    console.error("Error fetching announcement bar:", error);
    return { content: null, is_active: false };
  }

  // If found but inactive, treat as no content
  if (data && !data.is_active) {
    return { content: null, is_active: false };
  }

  return { content: data?.content || null, is_active: !!data?.is_active };
}

export async function updateAnnouncementBar(text: string) {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  if (profile?.usm_role !== "admin") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Check if a text_banner record exists
    const { data: existing } = await supabase
      .from("announcements")
      .select("id")
      .eq("type", "text_banner")
      .single();

    const isActive = text.trim().length > 0;

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from("announcements")
        .update({
          content: text,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // Create new record
      const { error } = await supabase
        .from("announcements")
        .insert({
          type: "text_banner",
          content: text,
          is_active: isActive,
          image_url: null,     // Explicitly null
          image_path: null,    // Explicitly null
          created_by: user.id
        });

      if (error) throw error;
    }

    revalidatePath("/");
    revalidatePath("/admin/announcements");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating announcement bar:", error);
    return { success: false, error: error.message };
  }
}

export async function createAnnouncement(formData: FormData) {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  if (profile?.usm_role !== "admin") {
    return { success: false, error: "Not authorized" };
  }

  const file = formData.get("image") as File;
  const title = formData.get("title") as string;

  if (!file) {
    return { success: false, error: "No image file provided" };
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File size must be less than 5MB" };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Only JPEG, PNG, and WebP images are allowed" };
  }

  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("announcements")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("announcements")
      .getPublicUrl(filePath);

    // Get next display order
    const { data: existingAnnouncements } = await supabase
      .from("announcements")
      .select("display_order")
      .eq("type", "carousel_image") // Only count carousel images
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = existingAnnouncements && existingAnnouncements.length > 0
      ? existingAnnouncements[0].display_order + 1
      : 0;

    // Create announcement record
    const { error: dbError } = await supabase
      .from("announcements")
      .insert({
        title: title || null,
        image_url: publicUrl,
        image_path: filePath,
        display_order: nextOrder,
        is_active: true,
        created_by: user.id,
        type: "carousel_image" // Explicitly set type
      });

    if (dbError) {
      // Rollback: delete uploaded file
      await supabase.storage.from("announcements").remove([filePath]);
      return { success: false, error: `Database error: ${dbError.message}` };
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateAnnouncementOrder(updates: { id: string; order: number }[]) {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  if (profile?.usm_role !== "admin") {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Update each announcement's display_order
    for (const update of updates) {
      const { error } = await supabase
        .from("announcements")
        .update({ display_order: update.order })
        .eq("id", update.id);

      if (error) {
        return { success: false, error: `Failed to update order: ${error.message}` };
      }
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleAnnouncementStatus(id: string) {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  if (profile?.usm_role !== "admin") {
    return { success: false, error: "Not authorized" };
  }

  // Get current status
  const { data: announcement } = await supabase
    .from("announcements")
    .select("is_active")
    .eq("id", id)
    .single();

  if (!announcement) {
    return { success: false, error: "Announcement not found" };
  }

  // Toggle status
  const { error } = await supabase
    .from("announcements")
    .update({ is_active: !announcement.is_active })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");

  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  if (profile?.usm_role !== "admin") {
    return { success: false, error: "Not authorized" };
  }

  // Get announcement to delete file from storage
  const { data: announcement } = await supabase
    .from("announcements")
    .select("image_path")
    .eq("id", id)
    .single();

  if (!announcement) {
    return { success: false, error: "Announcement not found" };
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("announcements")
    .remove([announcement.image_path]);

  if (storageError) {
    console.error("Storage deletion error:", storageError);
    // Don't fail the operation if storage deletion fails
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");

  return { success: true };
}
