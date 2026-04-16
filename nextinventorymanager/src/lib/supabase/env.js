// export function getSupabaseEnv() {
//   const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   const key =
//     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

//   if (!url || !key) {
//     throw new Error(
//       "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
//     );
//   }

//   return { url, key };
// }

////I am testing something, you can gladly delete and revert if you want!
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("Supabase env vars missing - feature disabled");
    return { url: "", key: "" };
  }

  return { url, key };
}