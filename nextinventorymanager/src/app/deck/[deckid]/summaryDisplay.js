"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Display({deckId}){
    return(
        <div>
            <CommanderPanel deckId={deckId}/>
        </div>
    )
}

function CommanderPanel({ deckId }) {
  const supabase = createClient();

  const [commander, setCommander] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deckId) return;

    async function load() {
      setLoading(true);

      const [{ data: deck }, { data: cards }] = await Promise.all([
        supabase
          .from("decks")
          .select("commander")
          .eq("deck_id", deckId)
          .single(),

        supabase
          .from("deck_cards")
          .select("cards(card_id, name, image_url)")
          .eq("deck_id", deckId),
      ]);

      setCommander(deck?.commander ?? null);
      setDeckCards(cards?.map(c => c.cards) ?? []);
      setLoading(false);
    }

    load();
  }, [deckId]);

  async function handleChange(e) {
    const newCommanderId = e.target.value;

    const { error } = await supabase
      .from("decks")
      .update({ commander: newCommanderId })
      .eq("deck_id", deckId);

    if (!error) {
      setCommander(newCommanderId);
    }
  }

  const selectedCard =
    deckCards.find(c => c.card_id === commander) || null;

  if (loading) return <div>Loading commander...</div>;

  return (
    <div>
      <h2>Commander</h2>

      {/* DISPLAY */}
      <div>
        {selectedCard ? (
          <img
            src={selectedCard.image_url}
            alt={selectedCard.name}
          />
        ) : (
          <div>No commander selected</div>
        )}
      </div>

      {/* DROPDOWN */}
      <div>
        <label>Select Commander: </label>
        <select value={commander || ""} onChange={handleChange}>
          <option value="">-- None --</option>

          {deckCards.map(card => (
            <option key={card.card_id} value={card.card_id}>
              {card.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}