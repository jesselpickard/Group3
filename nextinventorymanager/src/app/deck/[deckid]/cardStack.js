"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QuantityControl from "./quantityButtons";
import { scryfallApi } from "@/lib/scryfall/Scryfall";
import "./cardStack.css";

export default function CardStack({ type, cards, deckId }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div>
      <h3>{type}</h3>

      <div className="stack">
        {cards.map((card, index) => {
          const cardId = card.cards.card_id;
          const quantity = card.quantity;

          return (
            <CardImg
              key={cardId}
              cardId={cardId}
              quantity={quantity}
              deckId={deckId}
              index={index}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
            />
          );
        })}
      </div>
    </div>
  );
}

function CardImg({
  cardId,
  quantity,
  deckId,
  index,
  hoveredId,
  setHoveredId,
}) {
  const [card, setCard] = useState(null);

  useEffect(() => {
    async function fetchCard() {
      const data = await scryfallApi.getCardById(cardId);
      setCard(data);
    }
    fetchCard();
  }, [cardId]);

  if (!card) return null;

  const imageUrl =
    card.image_uris?.normal ||
    card.card_faces?.[0]?.image_uris?.normal;

  const isHovered = hoveredId === cardId;

  return (
    <Link href={`/cards/${cardId}`} className="cardLink">
      <div
        className="cardContainer"
        onMouseEnter={() => setHoveredId(cardId)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          position: "absolute",
          top: `${index * 40}px`,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: isHovered ? 9999 : index,
        }}
      >
        <img src={imageUrl} alt={card.name} className="cardImage" />

        <div
          className="cardOverlay"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <QuantityControl
            deckId={deckId}
            cardId={cardId}
            quantity={quantity}
          />
        </div>
      </div>
    </Link>
  );
}