import Navbar from "@/app/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import QuickAdd from "./quickAdd.js";
import { getDeckCards } from "./deckSummary.js"; 
import SummaryDisplay  from "./deckSummary.js";
import QuantityControl from "./quantityButtons.js";
import DeckFormatDisplay from "./formatDisplay.js";
import FormatSelector from "./formatSelection.js";
import CardStack from "./cardStack.js";

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

async function getDeckMeta(deckId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("decks")
    .select("name, format")
    .eq("deck_id", deckId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export default async function DeckPage({ params }){
  const awaitParams = await params;
  const deckId = awaitParams?.deckid;


  let cards = []
  console.log("deckId is:", deckId);
  let deckMeta = null;

  if (deckId) {
    cards = await getDeckCards(deckId);
    deckMeta = await getDeckMeta(deckId);
  }

  return (
    <div>
      <Navbar />
      <h1>Deck: {deckMeta?.name ?? "No deck selected"}</h1> {/* protects the page from an invalid id*/}
      <DeckFormatDisplay deckId={deckId} />
      <FormatSelector deckId={deckId} currentFormatId={deckMeta?.format}/>

      <QuickAdd deckId={deckId} />
      <SummaryDisplay deckId={deckId}/>
      <CardStack
        type="Main Deck"
        cards={cards}
        deckId={deckId}
      />
    </div>
  )
}