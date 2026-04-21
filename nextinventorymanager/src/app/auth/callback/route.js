import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/redirectAfterLogin=([^;]+)/);
  const next = match ? decodeURIComponent(match[1]) : '/';
  const safeNext = next.startsWith('/') ? next : '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=code_exchange_failed`);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";

  const destination = isLocal
    ? `${origin}${safeNext}`
    : forwardedHost
    ? `https://${forwardedHost}${safeNext}`
    : `${origin}${safeNext}`;

  const response = NextResponse.redirect(destination);
  response.cookies.delete('redirectAfterLogin');
  return response;
}