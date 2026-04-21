"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QuantityControl from "./quantityButtons";
import { scryfallApi } from "@/lib/scryfall/Scryfall";
import "./cardStack.css";



export default function CardStack({ type, cards, deckId }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [activeId, setActiveId] = useState(null);

  return (
    <div>
      <h3 className="stackTitle">{type}</h3>

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
              activeId={activeId}
              setActiveId={setActiveId}
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
  activeId,
  setActiveId,
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
  const isActive = activeId === cardId;

  function handleClick(e) {
    // First interaction = focus card (no navigation)
    if (activeId !== cardId) {
      e.preventDefault();
      setActiveId(cardId);
      return;
    }

    // Second click = allow navigation normally
  }

  return (
    <Link
      href={`/CardInfo/${cardId}`}
      className="cardLink"
      onClick={handleClick}
    >
      <div
        className="cardContainer"
        onMouseEnter={() => setHoveredId(cardId)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          position: "absolute",
          top: `${index * 40}px`,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: isActive ? 9999 : isHovered ? 9998 : index,
        }}
      >
        <img src={imageUrl} alt={card.name} className="cardImage" />

        <div
          className="cardOverlay"
          onClick={(e) => {
            // prevents QuantityControl from triggering Link navigation
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