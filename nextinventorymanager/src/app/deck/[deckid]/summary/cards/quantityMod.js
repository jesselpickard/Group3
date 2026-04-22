"use server";

import { createClient } from "@/lib/supabase/server";

export async function removeCardFromDeck(deckId, cardId) {
  const supabase = await createClient();

  //Gets current quantity
  const { data, error: fetchError } = await supabase
    .from("deck_cards")
    .select("quantity")
    .eq("deck_id", deckId)
    .eq("card_id", cardId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const currentQty = data.quantity;

  //decrements if quantity is more than 1, otherwise removes the card
  if (currentQty > 1) {
    const { error: updateError } = await supabase
      .from("deck_cards")
      .update({ quantity: currentQty - 1 })
      .eq("deck_id", deckId)
      .eq("card_id", cardId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  } else {
    const { error: deleteError } = await supabase
      .from("deck_cards")
      .delete()
      .eq("deck_id", deckId)
      .eq("card_id", cardId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }
}

export async function addCardToDeck(deckId, cardId) {
  const supabase = await createClient();

  //gets current quantity
  const { data, error: fetchError } = await supabase
    .from("deck_cards")
    .select("quantity")
    .eq("deck_id", deckId)
    .eq("card_id", cardId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  //increments it
  const { error: updateError } = await supabase
    .from("deck_cards")
    .update({ quantity: data.quantity + 1 })
    .eq("deck_id", deckId)
    .eq("card_id", cardId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}