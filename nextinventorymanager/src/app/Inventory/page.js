import Navbar from "../components/Navbar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InventoryCardGrid from "../components/InventoryCardGrid";

// Fetch one card from Scryfall using the card_id stored in the inventory table.
// This keeps the inventory table focused on ownership data while the UI still shows card info.
async function getCardById(cardId) {
  try {
    const res = await fetch(`https://api.scryfall.com/cards/${cardId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    // Return null so a single failed card fetch does not crash the whole page.
    return null;
  }
}

export default async function InventoryPage() {
  const supabase = await createClient();

  // Get the current logged-in user.
  // The inventory page should only show rows that belong to this user.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Read only from the inventory table.
  // We filter by user_id so each user only sees their own inventory.
  const { data: inventoryRows, error: inventoryError } = await supabase
    .from("inventory")
    .select("card_id, quantity, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (inventoryError) {
    console.error("Inventory query failed:", inventoryError);
  }

  // Turn inventory rows into displayable cards by fetching card details for each stored card_id.
  const cardsWithInventory =
    inventoryRows?.length
      ? (
          await Promise.all(
            inventoryRows.map(async (row) => {
              const card = await getCardById(row.card_id);

              // Skip rows whose card details could not be loaded.
              if (!card) {
                return null;
              }

              return {
                ...card,
                quantity: row.quantity ?? 1,
                inventory_created_at: row.created_at,
                inventory_updated_at: row.updated_at,
              };
            })
          )
        ).filter(Boolean)
      : [];

  return (
    <div>
      <Navbar />
      <InventoryCardGrid initialCards={cardsWithInventory} />
    </div>
  );
}