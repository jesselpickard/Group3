import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import { createClient } from "@/lib/supabase/server";

// Fetch one card's full details from Scryfall using the card_id stored in inventory.
// This lets the inventory table stay small while the UI still shows names and images.
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
    // Return null so one failed card fetch does not break the whole inventory page.
    return null;
  }
}

export default async function InventoryPage() {
  const supabase = await createClient();

  // Get the currently logged-in user from Supabase auth.
  // The inventory page should only show cards that belong to this user.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // If there is no logged-in user, send them to login instead of showing inventory data.
  if (authError || !user) {
    redirect("/login");
  }

  // Read only from the inventory table.
  // We filter by user_id so each user only sees their own inventory rows.
  const { data: inventoryRows, error: inventoryError } = await supabase
    .from("inventory")
    .select("card_id, quantity, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (inventoryError) {
    console.error("Inventory query failed:", inventoryError);
  }

  // For each inventory row, fetch the card details using the stored card_id.
  // Then merge the card data with the quantity from the inventory table.
  const cardsWithInventory =
    inventoryRows?.length
      ? (
          await Promise.all(
            inventoryRows.map(async (row) => {
              const card = await getCardById(row.card_id);

              // Skip rows whose card data could not be loaded.
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

      <main style={{ padding: "24px" }}>
        <h1 style={{ marginBottom: "20px" }}>My Inventory</h1>

        {/* Show a simple empty state when the user has no inventory rows. */}
        {cardsWithInventory.length === 0 ? (
          <p>No cards found in your inventory.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {cardsWithInventory.map((card, index) => {
              // Handle normal cards and double-faced cards.
              const image =
                card.image_uris?.normal ||
                card.image_uris?.small ||
                card.card_faces?.[0]?.image_uris?.normal ||
                card.card_faces?.[0]?.image_uris?.small ||
                "";

              return (
                <Link
                  // Use index as a fallback so rendering still works even if duplicate ids appear.
                  key={`${card.id}-${card.quantity}-${index}`}
                  href={`/CardInfo/${card.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "12px",
                    background: "#fff",
                  }}
                >
                  <div>
                    {image ? (
                      <img
                        src={image}
                        alt={card.name}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "8px",
                          display: "block",
                          marginBottom: "12px",
                        }}
                      />
                    ) : (
                      // Fallback box if the card does not have an image.
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "63 / 88",
                          borderRadius: "8px",
                          background: "#eee",
                          marginBottom: "12px",
                        }}
                      />
                    )}

                    <h2 style={{ fontSize: "16px", margin: "0 0 8px 0" }}>
                      {card.name}
                    </h2>

                    <p style={{ margin: 0 }}>
                      Quantity: <strong>{card.quantity}</strong>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}