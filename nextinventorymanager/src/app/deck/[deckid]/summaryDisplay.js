"use client"

import { useEffect, useState } from "react";
import { getCommander, setCommander } from "./deckSummary";
import { scryfallApi } from "@/lib/scryfall/Scryfall";
/**
 * This file takes the deck's summary data and creates a visual representation of it.
 * The purpose of this is to clean up the page.js file to reduce clutter. I have yet to decide
 * whether I want the summary above or below the card stacks so this component will make it easy
 * to maneuver.
 */

export default function Display({data}){
    return(
        <div>
            <CommanderSection deckId={deckId} cards={data.cards} />
        </div>
    );
}

export default function CommanderSection({ deckId, cards }) {
  const [commander, setCommanderState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Only allow legendary cards as commanders (basic rule filter)
  const validCommanders = cards.filter((card) =>
    card.type?.toLowerCase().includes("legendary")
  );

  // Load commander on mount
  useEffect(() => {
    async function loadCommander() {
      try {
        const commanderId = await getCommander(deckId);

        if (commanderId) {
          const card = await scryfallApi.getCardById(commanderId);
          setCommanderState(card);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCommander();
  }, [deckId]);

  async function handleSetCommander(cardId) {
    try {
      await setCommander(deckId, cardId);

      const card = await scryfallApi.getCardById(cardId);
      setCommanderState(card);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClearCommander() {
    try {
      await setCommander(deckId, null);
      setCommanderState(null);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p>Loading commander...</p>;

  return (
    <div>
      <h2>Commander</h2>

      {commander ? (
        <div>
          <img
            src={commander.image_uris?.normal}
            alt={commander.name}
            style={{ width: "200px" }}
          />
          <p>{commander.name}</p>

          <button onClick={handleClearCommander}>
            Change Commander
          </button>
        </div>
      ) : (
        <div>
          <p>Select a commander:</p>

          <select
            defaultValue=""
            onChange={(e) => handleSetCommander(e.target.value)}
          >
            <option value="" disabled>
              Select a commander
            </option>

            {validCommanders.map((card) => (
              <option key={card.card_id} value={card.card_id}>
                {card.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}