import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
//I am testing something, you can gladly delete and revert if you want!
// import { createBrowserClient } from "@supabase/ssr";
// import { getSupabaseEnv } from "./env";

// export function createClient() {
//   const { url, key } = getSupabaseEnv();

//   if (!url || !key) {
//     return null; // prevent crash
//   }

//   return createBrowserClient(url, key);
// }