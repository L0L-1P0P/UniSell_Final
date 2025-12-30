import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `request` object contains the query parameters (e.g., ?code=...&next=...)
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If no error, redirect to the 'next' URL (e.g., /reset-password)
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }
  }

  // If there's no code or an error occurred, redirect to an error page or login
  // For now, redirecting to login with an error query param is a safe fallback
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=auth_code_error`
  );
}
