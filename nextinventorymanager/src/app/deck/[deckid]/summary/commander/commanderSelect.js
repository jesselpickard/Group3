"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CommanderSelector({ deckId, currentCommander }) {
  const supabase = createClient();
  const router = useRouter();

  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState(currentCommander || "");

  useEffect(() => {
    async function fetchCards() {
      const { data, error } = await supabase
        .from(`deck_cards`)
        .select(`card_id, cards(name)`)
        .eq('deck_id', deckId);
      if (!error) setCards(data);
    }

    fetchCards();
  }, []);

  async function handleChange(e) {
    const newCommander = e.target.value;
    setSelected(newCommander);

    const { error } = await supabase
      .from("decks")
      .update({ commander: newCommander }) 
      .eq("deck_id", deckId);

    if (error) {
      console.error("Error updating commander:", error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <h3>Change Commander</h3>

      <select value={selected} onChange={handleChange}>
        <option value="">Select a card</option>

        {cards.map((row) => (
            <option key={row.card_id} value={row.cards?.name}>
                {row.cards?.name}
            </option>
        ))}
      </select>
    </div>
  );
}