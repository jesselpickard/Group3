"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCardToDeck, removeCardFromDeck } from "./quantityMod";

export default function QuantityControl({ deckId, cardId, quantity }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAdd = () => {
    startTransition(async () => {
      await addCardToDeck(deckId, cardId);
      router.refresh();
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeCardFromDeck(deckId, cardId);
      router.refresh();
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button onClick={handleRemove} disabled={isPending}>
        −
      </button>

      <span style={{ minWidth: "24px", textAlign: "center" }}>
        {quantity}
      </span>

      <button onClick={handleAdd} disabled={isPending}>
        +
      </button>
    </div>
  );
}