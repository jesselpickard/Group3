import Navbar from "@/app/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import QuickAdd from "./quickAdd.js";

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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deck_cards')
    .select('quantity, cards(card_id,name)')
    .eq('deck_id', deckId)

  if (error) throw new Error(error.message)

  return data
}

export default async function DeckPage({ params }) {
  const awaitParams = await params;
  const deckId = awaitParams?.deckid;


  let cards = []

  if (deckId) {
    cards = await getDeckCards(deckId);
  }

  return (
    <div>
      <Navbar />
      <h1>Deck: {deckId ?? "No deck selected"}</h1> {/* protects the page from an invalid id*/}

      {deckId ? (
        <ul>
          {cards.map((card, i) => (
            <li key={card.cards?.card_id ?? i}>
              Card: {card.cards ? card.cards.name : 'Missing card'} — Qty: {card.quantity}
            </li>
          ))}
        </ul>
      ) : (
        <p>Please select a deck.</p>
      )}
      <QuickAdd deckId={deckId} />
    </div>
  )
}