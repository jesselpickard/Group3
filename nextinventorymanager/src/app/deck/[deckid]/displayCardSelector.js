"use client";

import { useState } from "react";
import { scryfallApi } from "@/lib/scryfall";

export default function CommanderSelector({
  deckId,
  format,
  cards,
  currentCard,
  label,
}) {
  const [selected, setSelected] = useState(currentCard || null);
  const [selectedCardData, setSelectedCardData] = useState(null);
  const [error, setError] = useState(null);

  const pool = cards.map(c => c.cards);

  const imageUrl =
    selectedCardData?.image_uris?.normal ||
    selectedCardData?.image_uris?.large ||
    selectedCardData?.image_uris?.png;



  async function handleSelect(card) {
    setError(null);

    if (!pool.length) {
      setError("Deck must have at least one card.");
      return;
    }

    const data = await scryfallApi.namedExact(card.name);
    setSelectedCardData(data);

    //NON-commander format
    if (format !== "Commander") {
      await save(card.card_id);
      setSelected(card.card_id);
      return;
    }

    //Commander format
    const ok =
      data.type_line?.toLowerCase().includes("legendary") &&
      !data.type_line?.toLowerCase().includes("planeswalker");

    if (!ok) {
      setError("This card is not a legal commander.");
      return;
    }

    await save(card.card_id);
    setSelected(card.card_id);
  }

  async function save(cardId) {
    await fetch(`/api/decks/${deckId}/displayCard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cardId }),
    });
  }

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* LEFT: selector */}
      <div>
        <h3>{label}</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!pool.length ? (
          <p>Deck must contain at least one card.</p>
        ) : (
          <ul>
            {pool.map(card => (
              <li key={card.card_id}>
                <button onClick={() => handleSelect(card)}>
                  {card.name}
                </button>

                {selected === card.card_id && " ✅"}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* RIGHT: IMAGE PREVIEW */}
      <div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Selected card"
            style={{
              width: "320px",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}
          />
        ) : (
          <p>Select a card to preview</p>
        )}
      </div>
    </div>
  );
}