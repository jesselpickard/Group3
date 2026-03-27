import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseEnv } from "./env";

export async function updateSession(request) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");

  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({ request });
        response.headers.set("Cache-Control", "private, no-store");

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh/validate session cookies for SSR.
  await supabase.auth.getUser();

  return response;
}