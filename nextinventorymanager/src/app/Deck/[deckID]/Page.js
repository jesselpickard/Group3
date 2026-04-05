//import Navbar from "@/app/components/Navbar";
import { createClient } from "@/lib/supabase/server";
//import QuickAdd from "./quickAdd.js";

/**
 *  This page is meant to lay out the contents of a deck to its viewer. It will allow
 *  for the quick addition and removal of cards to its list as well as the ability to
 *  modify the quantities.
 * 
 *  To-do list: (non-exhaustive)
 *      Deck display. -> implemented as text for now
 *      Deck info display/modification.
 *      Quick add search.
 *      Card categories
 *      Deck summary.
 * 
 */

async function getDeckCards(deckId) {//attempts to access the contents of the deck and return 
  const supabase = createClient();
  const { data, error } = await supabase
    .from('deck_cards')
    .select('quantity, cards(card_id,name)')
    .eq('deck_id', deckId)

  if (error) throw new Error(error.message)

  return data
}

export default async function DeckPage({ params }) {
return <h1>Deck ID: {params.deckId}</h1>
}