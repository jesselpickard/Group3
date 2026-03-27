"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function getSafeNextFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/";
    return next.startsWith("/") ? next : "/";
  } catch {
    return "/";
  }
}

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function signInWithGoogle() {
    setBusy(true);
    setStatus("");

    try {
      const safeNext = getSafeNextFromUrl();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        safeNext
      )}`;

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;
    } catch (err) {
      setStatus(err?.message || "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Sign in</h1>

      <button disabled={busy} onClick={signInWithGoogle}>
        {busy ? "Redirecting..." : "Continue with Google"}
      </button>

      {status ? <p style={{ marginTop: 12 }}>{status}</p> : null}
    </main>
  );
}