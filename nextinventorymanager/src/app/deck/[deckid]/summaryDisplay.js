"use client";

import { useEffect, useState } from "react";
import { scryfallApi } from "@/lib/scryfall/Scryfall";

export default function Display({ data, deckId, initialCommanderId }) {
  return (
    <div>
      <CommanderSection
        deckId={deckId}
        cards={data?.cards || []}
        initialCommanderId={initialCommanderId}
      />
    </div>
  );
}

function CommanderSection({ deckId, cards, initialCommanderId }) {
  const [commander, setCommanderState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Only allow legendary cards as commanders (basic rule filter)
  const validCommanders = cards.filter((card) =>
    card.type?.toLowerCase().includes("legendary")
  );

  // Load commander from Scryfall using server-provided ID
  useEffect(() => {
    async function loadCommander() {
      try {
        if (!initialCommanderId) {
          setCommanderState(null);
          return;
        }

        const card = await scryfallApi.getCardById(initialCommanderId);
        setCommanderState(card);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCommander();
  }, [initialCommanderId]);

  // NOTE:
  // You currently cannot safely use setCommander() from server here.
  // You should replace this with an API route or Supabase browser client later.
  async function handleSetCommander(cardId) {
    try {
      // temporary assumption: backend endpoint exists OR you will replace this later
      await fetch("/api/commander/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deckId,
          cardId,
        }),
      });

      const card = await scryfallApi.getCardById(cardId);
      setCommanderState(card);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClearCommander() {
    try {
      await fetch("/api/commander/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deckId,
          cardId: null,
        }),
      });

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