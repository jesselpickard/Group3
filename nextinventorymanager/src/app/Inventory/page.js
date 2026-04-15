// src/app/Inventory/page.js
import Navbar from "../components/Navbar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InventoryCardGrid from "../components/InventoryCardGrid";

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
    return null;
  }
}

export default async function InventoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: inventoryRows, error: inventoryError } = await supabase
    .from("inventory")
    .select("card_id, quantity, created_at, updated_at")
    .eq("user_id", user.id)
    .gt("quantity", 0)
    .order("created_at", { ascending: false });

  if (inventoryError) {
    console.error("Inventory query failed:", inventoryError);
  }

  const cardsWithInventory = inventoryRows?.length
    ? (
        await Promise.all(
          inventoryRows.map(async (row) => {
            const card = await getCardById(row.card_id);

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
    <>
      <Navbar />
      <InventoryCardGrid initialCards={cardsWithInventory} />
    </>
  );
}