import Navbar from "@/app/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import QuickAdd from "./quickAdd.js";
import { getDeckCards } from "./deckSummary.js"; 
import SummaryDisplay  from "./deckSummary.js";
import QuantityControl from "./quantityButtons.js";
import DeckFormatDisplay from "./formatDisplay.js";
import FormatSelector from "./formatSelection.js";
import CommanderSelector from "./displayCardSelector.js";

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
    .select("name, format, commander")
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

      {/* COMMANDER / DISPLAY CARD */}
      <CommanderSelector
        deckId={deckId}
        format={deckMeta?.format}
        currentCard={deckMeta?.commander}
        cards={cards}
      />

      {deckId ? (
        <ul>
          {cards.map(card => (
            <li
              key={card.cards.card_id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span>
                {card.cards.name}
              </span>

              <QuantityControl
                deckId={deckId}
                cardId={card.cards.card_id}
                quantity={card.quantity}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>Please select a deck.</p>
      )}
      <QuickAdd deckId={deckId} />
      <SummaryDisplay deckId={deckId}/>
    </div>
  )
}