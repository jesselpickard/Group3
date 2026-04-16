"use client";

import { useState, useTransition } from "react";
import { addCardToDeck, removeCardFromDeck } from "./actions";

export default function QuantityControl({ deckId, cardId, initialQuantity }) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    setQuantity(q => q + 1);//assumes success on action

    startTransition(async () => {
      try {
        await addCardToDeck(deckId, cardId);
      } catch (err) {//catches failures to correct quantity
        setQuantity(q => q - 1);
      }
    });
  };

  const handleRemove = () => {
    setQuantity(q => q - 1);//assumes success on action

    startTransition(async () => {
      try {
        await removeCardFromDeck(deckId, cardId);
      } catch (err) {
        setQuantity(q => q + 1);//catches failures to correct quantity
      }
    });
  };

  if (quantity <= 0) return null;

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <button onClick={handleRemove} disabled={isPending}>−</button>
      <span>{quantity}</span>
      <button onClick={handleAdd} disabled={isPending}>+</button>
    </div>
  );
}
