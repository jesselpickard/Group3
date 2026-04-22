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
    <div style={{display: "flex",flexDirection: "column",alignItems: "center",gap: "4px",}}>
      <button
        onClick={handleAdd}
        disabled={isPending}
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "4px",
          border: "none",
          background: "#71179C",
          color: "white",
          cursor: "pointer",
        }}
      >
        +
      </button>

      <span style={{fontSize: "14px",fontWeight: "bold",color: "white",}}>
        {quantity}
      </span>

      <button
        onClick={handleRemove}
        disabled={isPending}
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "4px",
          border: "none",
          background: "#71179C",
          color: "white",
          cursor: "pointer",
        }}
      >
        -
      </button>
    </div>
  );
}