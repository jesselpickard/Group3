"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QuantityControl from "./quantityButtons";
import { scryfallApi } from "@/lib/scryfall/Scryfall";
import "./cardStack.css";

export default function CardStack({ type, cards, deckId }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [activeId, setActiveId] = useState(null);

  // click outside clears focus
  useEffect(() => {
    if (activeId === null) return;

    function handleOutsideClick() {
      setActiveId(null);
    }

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [activeId]);

  return (
    <div className="stackWrapper">
      <div className="stackTitleBox">
        <span className="stackTitleText">{type}</span>
      </div>

      {/* NEW: proper layout canvas */}
      <div className="stack">
        <div className="stackCanvas">
          {cards.map((card, index) => (
            <CardImg
              key={card.cards.card_id}
              cardId={card.cards.card_id}
              quantity={card.quantity}
              deckId={deckId}
              index={index}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
              activeId={activeId}
              setActiveId={setActiveId}
            />
          ))}
        </div>
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
    e.stopPropagation();

    if (activeId !== cardId) {
      e.preventDefault();
      setActiveId(cardId);
      return;
    }
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
          top: `${index * 40}px`,
          transform: isActive
            ? "translateX(-50%) scale(1.05)"
            : "translateX(-50%)",
          zIndex: isActive ? 1000 : isHovered ? 999 : index,
        }}
      >
        <img src={imageUrl} alt={card.name} className="cardImage" />

        <div
          className="cardOverlay"
          onClick={(e) => e.stopPropagation()}
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