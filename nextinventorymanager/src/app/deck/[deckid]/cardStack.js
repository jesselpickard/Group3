"use client";

import { useEffect, useState } from "react";
import QuantityControl from "./quantityButtons";
import { scryfallApi } from "@/lib/scryfall/Scryfall";
import "./cardStack.css";

/**
 * This component will allow cards to be visually represented as a stack while in a deck page.
 * When the user hovers their mouse over a card it should gain focus so that they can view the 
 * whole image.
 * 
 * This file should also contain a function that sets up the cards image, overlaying the quantity
 * controls over it. 
 * 
 * CardStack - Type is given to the item to know how to label the stack, while cards will be the contents
 * CardImg - Takes an ID representing a card in order to associate the quantity control and source the image
 *  from scryfall
 */



export default function CardStack({ type, cards, deckId }) {
  return (
    <div>
      <h3>{type}</h3>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {cards.map((card) => {
          const cardId = card.cards.card_id;
          const quantity = card.quantity;

          return (
            <CardImg
              key={cardId}
              cardId={cardId}
              quantity={quantity}
              deckId={deckId}
            />
          );
        })}
      </div>
    </div>
  );
}

function CardImg({ cardId, quantity, deckId }) {
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

  return (
    <div className="cardContainer">
      <img src={imageUrl} alt={card.name} className="cardImage" />

      <div className="cardOverlay">
        <QuantityControl
          deckId={deckId}
          cardId={cardId}
          quantity={quantity}
        />
      </div>
    </div>
  );
}