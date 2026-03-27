"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function signInWithGoogle() {
    setBusy(true);
    setStatus("");

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;

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