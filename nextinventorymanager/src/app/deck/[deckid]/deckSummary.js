import { createClient } from "@/lib/supabase/server";

/**
 * This file takes all the items within the deck in order to summarize its data. 
 * This includes the quantity of cards, format legality, as well as insights into the mana spread
 * of the deck.
 */

export async function getDeckCards(deckId){//attempts to access the contents of the deck and return 
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deck_cards')
    .select('quantity, cards(card_id,name)')
    .eq('deck_id', deckId)
  if (error) throw new Error(error.message)
  return data
}