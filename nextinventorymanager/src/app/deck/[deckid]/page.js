import Navbar from "@/app/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import QuickAdd from "./quickAdd.js";
import { getDeckCards, summary } from "./deckSummary.js"; 
import DeckFormatDisplay from "./formatDisplay.js";
import FormatSelector from "./formatSelection.js";
import CardStack from "./cardStack.js";
import "./main.css";
import Display from "./summaryDisplay.js";

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

// CATEGORY RULES FUNCTION
function groupCardsByType(cards) {
  const groups = {
    creature: [],
    artifact: [],
    battle: [],
    enchantment: [],
    instant: [],
    kindred: [],
    land: [],
    planeswalker: [],
    sorcery: [],
  };

  for (const card of cards) {
    const typeLine = (card?.cards?.type || "").toLowerCase();

    // Creature override rule
    if (typeLine.includes("creature")) {
      groups.creature.push(card);
      continue;
    }

    if (typeLine.includes("artifact")) groups.artifact.push(card);
    else if (typeLine.includes("battle")) groups.battle.push(card);
    else if (typeLine.includes("enchantment")) groups.enchantment.push(card);
    else if (typeLine.includes("instant")) groups.instant.push(card);
    else if (typeLine.includes("kindred")) groups.kindred.push(card);
    else if (typeLine.includes("land")) groups.land.push(card);
    else if (typeLine.includes("planeswalker")) groups.planeswalker.push(card);
    else if (typeLine.includes("sorcery")) groups.sorcery.push(card);
  }

  return groups;
}

export default async function DeckPage({ params }) {
  const deckId = params?.deckid;

  let deckMeta = null;
  let summaryData = null;

  if (deckId) {
    deckMeta = await getDeckMeta(deckId);
    summaryData = await summary(deckId);
  }

  const groupedCards = groupCardsByType(summaryData?.cards || []);

  return (
    <div>
      <Navbar />

      <h1>Deck: {deckMeta?.name ?? "No deck selected"}</h1>

      <DeckFormatDisplay deckId={deckId} />
      <FormatSelector deckId={deckId} currentFormatId={deckMeta?.format} />
      <QuickAdd deckId={deckId} />

      <Display data={summaryData} deckId={deckId} />

      <div className="cardStackContainer">
        {Object.entries(groupedCards).map(([type, group]) =>
          group.length > 0 ? (
            <CardStack
              key={type}
              type={type.charAt(0).toUpperCase() + type.slice(1)}
              cards={group}
              deckId={deckId}
            />
          ) : null
        )}
      </div>
    </div>
  );
}