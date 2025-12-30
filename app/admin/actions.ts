"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";

export async function approveUser(userId: string) {
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

  // Update user to verified
  const { error } = await supabase
    .from("profiles")
    .update({
      verification_status: "verified",
      rejection_reason: null,
    })
    .eq("id", userId);

  if (error) {
    console.error("[approveUser] Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true };
}

export async function rejectUser(userId: string, reason: string) {
  console.log("[rejectUser] Starting rejection for userId:", userId);
  console.log("[rejectUser] Rejection reason:", reason);

  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[rejectUser] Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  console.log("[rejectUser] Current user:", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  console.log("[rejectUser] Admin profile:", profile);

  if (profile?.usm_role !== "admin") {
    console.log("[rejectUser] Not authorized - role:", profile?.usm_role);
    return { success: false, error: "Not authorized" };
  }

  // Validate reason
  if (!reason || reason.trim().length < 10) {
    console.log("[rejectUser] Invalid reason length:", reason?.trim().length);
    return {
      success: false,
      error: "Rejection reason must be at least 10 characters",
    };
  }

  console.log("[rejectUser] Updating user profile...");

  // Update user to rejected with reason
  const { error, data } = await supabase
    .from("profiles")
    .update({
      verification_status: "rejected",
      rejection_reason: reason.trim(),
    })
    .eq("id", userId)
    .select();

  console.log("[rejectUser] Update result:", { error, data });

  if (error) {
    console.error("[rejectUser] Error:", error);
    return { success: false, error: error.message };
  }

  console.log("[rejectUser] Revalidating paths...");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  console.log("[rejectUser] Success!");
  return { success: true };
}

export async function banUser(
  userId: string,
  duration: string,
  reason: string
) {
  console.log(
    "[banUser] Starting ban for userId:",
    userId,
    "duration:",
    duration
  );

  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if trying to ban self
  if (user.id === userId) {
    return { success: false, error: "You cannot ban yourself" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  if (profile?.usm_role !== "admin") {
    return { success: false, error: "Not authorized" };
  }

  // Validate reason
  if (!reason || reason.trim().length < 10) {
    return {
      success: false,
      error: "Ban reason must be at least 10 characters",
    };
  }

  // Calculate ban expiry date
  const now = new Date();
  let bannedUntil: Date;

  switch (duration) {
    case "1day":
      bannedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      break;
    case "3days":
      bannedUntil = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      break;
    case "1week":
      bannedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case "1month":
      bannedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      break;
    case "permanent":
      bannedUntil = new Date(now.getTime() + 36500 * 24 * 60 * 60 * 1000); // 100 years
      break;
    default:
      return { success: false, error: "Invalid duration" };
  }

  console.log("[banUser] Ban until:", bannedUntil.toISOString());

  // Update user to banned
  const { error } = await supabase
    .from("profiles")
    .update({
      banned_until: bannedUntil.toISOString(),
      ban_reason: reason.trim(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[banUser] Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  console.log("[banUser] Success!");
  return { success: true };
}



export async function deleteUser(userId: string) {
  console.log("[deleteUser] Starting deletion for userId:", userId);

  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check if trying to delete self
    if (user.id === userId) {
      throw new Error("You cannot delete yourself");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("usm_role")
      .eq("id", user.id)
      .single();

    if (profile?.usm_role !== "admin") {
      throw new Error("Not authorized");
    }

    // Step 1: Storage Cleanup
    // 1a. Delete IC/Verification photo from 'private-documents' (referenced as verifications)
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("ic_document_path")
      .eq("id", userId)
      .single();

    if (targetUser?.ic_document_path) {
      console.log("[deleteUser] Deleting IC:", targetUser.ic_document_path);
      const { error: icDeleteError } = await supabase.storage
        .from("private-documents")
        .remove([targetUser.ic_document_path]);

      if (icDeleteError) {
        console.error("[deleteUser] Failed to delete IC:", icDeleteError);
        // Continue even if storage delete fails
      }
    }

    // 1b. Delete item images from 'public-items' (referenced as items)
    // We list all files in the user's folder since all their item images are stored under their userId prefix
    const { data: userFiles } = await supabase.storage
      .from("public-items")
      .list(userId);

    if (userFiles && userFiles.length > 0) {
      const filePaths = userFiles.map((file) => `${userId}/${file.name}`);
      console.log(`[deleteUser] Deleting ${filePaths.length} item images`);

      const { error: itemImagesError } = await supabase.storage
        .from("public-items")
        .remove(filePaths);

      if (itemImagesError) {
        console.error(
          "[deleteUser] Failed to delete item images:",
          itemImagesError
        );
      }
    }

    // Step 2: The Nuclear Delete (Auth User)
    // This will cascade to Profile, Items, Messages, etc.
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);
    
    if (authDeleteError) {
      throw authDeleteError;
    }

    // Step 3: Response
    revalidatePath("/admin/users");
    console.log("[deleteUser] Success!");
    return { success: true };

  } catch (error: any) {
    console.error("[deleteUser] Error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function approveListing(listingId: string) {
  console.log("[approveListing] Starting approval for listingId:", listingId);

  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[approveListing] Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  console.log("[approveListing] Admin profile:", profile);

  if (profile?.usm_role !== "admin") {
    console.log("[approveListing] Not authorized - role:", profile?.usm_role);
    return { success: false, error: "Not authorized" };
  }

  console.log("[approveListing] Updating listing status...");

  // Update listing to available and clear rejection reason
  const { error, data } = await supabase
    .from("items")
    .update({
      status: "available",
      rejection_reason: null,
    })
    .eq("id", listingId)
    .select();

  console.log("[approveListing] Update result:", { error, data });

  if (error) {
    console.error("[approveListing] Error:", error);
    return { success: false, error: error.message };
  }

  console.log("[approveListing] Revalidating paths...");
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${listingId}`);

  console.log("[approveListing] Success!");
  return { success: true };
}

export async function rejectListing(listingId: string, reason: string) {
  console.log("[rejectListing] Starting rejection for listingId:", listingId);
  console.log("[rejectListing] Rejection reason:", reason);

  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[rejectListing] Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  console.log("[rejectListing] Current user:", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  console.log("[rejectListing] Admin profile:", profile);

  if (profile?.usm_role !== "admin") {
    console.log("[rejectListing] Not authorized - role:", profile?.usm_role);
    return { success: false, error: "Not authorized" };
  }

  // Validate reason
  if (!reason || reason.trim().length < 10) {
    console.log(
      "[rejectListing] Invalid reason length:",
      reason?.trim().length
    );
    return {
      success: false,
      error: "Rejection reason must be at least 10 characters",
    };
  }

  console.log("[rejectListing] Updating listing status...");

  // Update listing to rejected with reason
  const { error, data } = await supabase
    .from("items")
    .update({
      status: "rejected",
      rejection_reason: reason.trim(),
    })
    .eq("id", listingId)
    .select();

  console.log("[rejectListing] Update result:", { error, data });

  if (error) {
    console.error("[rejectListing] Error:", error);
    return { success: false, error: error.message };
  }

  console.log("[rejectListing] Revalidating paths...");
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${listingId}`);

  console.log("[rejectListing] Success!");
  return { success: true };
}

export async function hideListing(listingId: string, reason: string) {
  console.log("[hideListing] Starting hide for listingId:", listingId);

  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[hideListing] Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  console.log("[hideListing] Current user:", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  console.log("[hideListing] Admin profile:", profile);

  if (profile?.usm_role !== "admin") {
    console.log("[hideListing] Not authorized - role:", profile?.usm_role);
    return { success: false, error: "Not authorized" };
  }

  // Validate reason
  if (!reason || reason.trim().length < 10) {
    return { success: false, error: "Please provide a reason (minimum 10 characters)" };
  }

  console.log("[hideListing] Updating listing status to hidden with reason...");

  // Update listing to hidden with reason
  const { error, data } = await supabase
    .from("items")
    .update({
      status: "hidden",
      hidden_reason: reason.trim(),
    })
    .eq("id", listingId)
    .select();

  console.log("[hideListing] Update result:", { error, data });

  if (error) {
    console.error("[hideListing] Error:", error);
    return { success: false, error: error.message };
  }

  console.log("[hideListing] Revalidating paths...");
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${listingId}`);

  console.log("[hideListing] Success!");
  return { success: true };
}

export async function deleteListingAdmin(listingId: string) {
  console.log("[deleteListingAdmin] Starting delete for listingId:", listingId);

  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[deleteListingAdmin] Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  console.log("[deleteListingAdmin] Current user:", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  console.log("[deleteListingAdmin] Admin profile:", profile);

  if (profile?.usm_role !== "admin") {
    console.log("[deleteListingAdmin] Not authorized - role:", profile?.usm_role);
    return { success: false, error: "Not authorized" };
  }

  console.log("[deleteListingAdmin] Updating listing status to deleted...");

  // Update listing to deleted
  const { error, data } = await supabase
    .from("items")
    .update({
      status: "deleted",
    })
    .eq("id", listingId)
    .select();

  console.log("[deleteListingAdmin] Update result:", { error, data });

  if (error) {
    console.error("[deleteListingAdmin] Error:", error);
    return { success: false, error: error.message };
  }

  console.log("[deleteListingAdmin] Revalidating paths...");
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${listingId}`);

  console.log("[deleteListingAdmin] Success!");
  return { success: true };
}

export async function unhideListing(listingId: string) {
  console.log("[unhideListing] Starting unhide for listingId:", listingId);

  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[unhideListing] Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  console.log("[unhideListing] Current user:", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  console.log("[unhideListing] Admin profile:", profile);

  if (profile?.usm_role !== "admin") {
    console.log("[unhideListing] Not authorized - role:", profile?.usm_role);
    return { success: false, error: "Not authorized" };
  }

  console.log("[unhideListing] Updating listing status to available...");

  // Update listing to available (unhide)
  const { error, data } = await supabase
    .from("items")
    .update({
      status: "available",
    })
    .eq("id", listingId)
    .select();

  console.log("[unhideListing] Update result:", { error, data });

  if (error) {
    console.error("[unhideListing] Error:", error);
    return { success: false, error: error.message };
  }

  console.log("[unhideListing] Revalidating paths...");
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${listingId}`);

  console.log("[unhideListing] Success!");
  return { success: true };
}

export async function permanentlyDeleteListing(listingId: string) {
  console.log("[permanentlyDeleteListing] Starting permanent delete for listingId:", listingId);

  const supabase = await createClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("[permanentlyDeleteListing] Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  console.log("[permanentlyDeleteListing] Current user:", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("usm_role")
    .eq("id", user.id)
    .single();

  console.log("[permanentlyDeleteListing] Admin profile:", profile);

  if (profile?.usm_role !== "admin") {
    console.log("[permanentlyDeleteListing] Not authorized - role:", profile?.usm_role);
    return { success: false, error: "Not authorized" };
  }

  // Check for active conversations
  console.log("[permanentlyDeleteListing] Checking for conversations...");
  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select("id")
    .eq("item_id", listingId)
    .eq("buyer_deleted", false)
    .or("seller_deleted.eq.false");

  if (convError) {
    console.error("[permanentlyDeleteListing] Error checking conversations:", convError);
    return { success: false, error: "Failed to check conversations" };
  }

  if (conversations && conversations.length > 0) {
    console.log("[permanentlyDeleteListing] Listing has active conversations, cannot delete");
    return { success: false, error: "Cannot delete listing with active conversations" };
  }

  console.log("[permanentlyDeleteListing] No active conversations, proceeding with delete...");

  // Permanently delete the listing
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", listingId);

  if (error) {
    console.error("[permanentlyDeleteListing] Error:", error);
    return { success: false, error: error.message };
  }

  console.log("[permanentlyDeleteListing] Revalidating paths...");
  revalidatePath("/admin/listings");

  console.log("[permanentlyDeleteListing] Success!");
  return { success: true };
}

// ============================================
// REPORTS MANAGEMENT
// ============================================

export async function getReports(filters?: {
  status?: string;
  type?: 'item' | 'user';
}) {
  const supabase = await createClient();

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
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

  // Build query
  let query = supabase
    .from("reports")
    .select(`
      *,
      reporter:profiles!reporter_id(id, full_name, email),
      item:items(id, title, images, status),
      target_user:profiles!target_user_id(id, full_name, email)
    `)
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.type === 'item') {
    query = query.not("item_id", "is", null);
  } else if (filters?.type === 'user') {
    query = query.not("target_user_id", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getReports] Error:", error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

export async function getReportById(reportId: string) {
  const supabase = await createClient();

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
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

  const { data, error } = await supabase
    .from("reports")
    .select(`
      *,
      reporter:profiles!reporter_id(id, full_name, email, campus),
      item:items(id, title, images, price, status, description, seller_id),
      target_user:profiles!target_user_id(id, full_name, email, campus, verification_status)
    `)
    .eq("id", reportId)
    .single();

  if (error) {
    console.error("[getReportById] Error:", error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

export async function updateReportStatus(
  reportId: string,
  status: string
) {
  const supabase = await createClient();

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
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

  const { error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId);

  if (error) {
    console.error("[updateReportStatus] Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/reports");
  return { success: true };
}

export async function dismissReport(reportId: string) {
  const supabase = await createClient();

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
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

  const { error } = await supabase
    .from("reports")
    .update({ status: "dismissed" })
    .eq("id", reportId);

  if (error) {
    console.error("[dismissReport] Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/reports");
  return { success: true };
}
