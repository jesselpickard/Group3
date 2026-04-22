"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import "./commanderSelect.css";

export default function CommanderSelector({ deckId, currentCommander }) {
  const supabase = createClient();
  const router = useRouter();

  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState(currentCommander || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchCards() {
      const { data, error } = await supabase
        .from("deck_cards")
        .select("card_id, cards(name)")
        .eq("deck_id", deckId);

      if (!error) setCards(data);
    }

    fetchCards();
  }, [deckId]);

  async function handleSelect(cardId) {
    setSelected(cardId);
    setOpen(false);

    const { error } = await supabase
      .from("decks")
      .update({ commander: cardId })
      .eq("deck_id", deckId);

    if (error) {
      console.error("Error updating commander:", error.message);
      return;
    }

    router.refresh();
  }

  const selectedCard = cards.find(c => c.card_id === selected);

  return (
    <div className="commander-select">
      <h3 className="commander-label">Commander</h3>

      {/* Selected display */}
      <button
        className="commander-selected"
        onClick={() => setOpen(prev => !prev)}
      >
        {selectedCard?.cards?.name || "Select a card"}
        <span className="arrow">{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="commander-dropdown">
          {cards.map((row) => (
            <div
              key={row.card_id}
              className="commander-option"
              onClick={() => handleSelect(row.card_id)}
            >
              {row.cards?.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}