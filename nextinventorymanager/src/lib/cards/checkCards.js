import { createClient } from "@/lib/supabase/server";
import { scryfallApi } from "@/lib/scryfall/Scryfall";

/**
 *  This file is intended to act as a buffer action when attempting to add a card to something other than the cards table. It ensures
 *  that the card actually exists within the database so no issues occur.
 * 
 */

export async function ensureCardExists(cardId) {
  const supabase = await createClient();

  //Check is in our database
  const { data: existingCard, error: fetchError } = await supabase
    .from("cards")
    .select("*")
    .eq("card_id", cardId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw new Error(fetchError.message);
  }

  if (existingCard) {
    return existingCard;
  }

  //Fetch card from Scryfall if it doesn't exist
  const { data: card } = await scryfallApi.id(cardId);

  if (!card) {
    throw new Error("Card not found on Scryfall");
  }

  //Prepares card data
  const cardData = {
    card_id: card.id,
    name: card.name || "Unknown",
    colors: card.colors || [],
    cost: card.mana_cost || null,
    type: card.type_line || null,
    extra: card,
  };

  //Adds into cards table
  const { data: newCard, error: insertError } = await supabase
    .from("cards")
    .insert(cardData)
    .select()
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }
}