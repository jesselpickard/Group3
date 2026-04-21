"use client";

import { useEffect, useState } from "react";
import { summary } from "./deckSummary.js";
import { scryfallApi } from "@/lib/scryfall/Scryfall";
import "./summaryDisplay.css";

export default function SummaryDisplay({ deckId }) {
  const [data, setData] = useState(null);
  const [featuredCard, setFeaturedCard] = useState(null);

  useEffect(() => {
    if (!deckId) return;

    async function load() {
      const result = await summary(deckId);
      setData(result);

      // pick first card as featured (simple default)
      if (result?.cards?.length) {
        const first = result.cards[0];
        const card = await scryfallApi.getCardById(first.card_id);
        setFeaturedCard(card);
      }
    }

    load();
  }, [deckId]);

  if (!deckId) return <p>Invalid DeckId</p>;
  if (!data) return <p>Loading summary...</p>;

  return (
    <div className="summaryContainer">

      {/* LEFT SIDE (featured card) */}
      <div className="summaryLeft">
        {featuredCard && (
          <img
            src={
              featuredCard.image_uris?.normal ||
              featuredCard.card_faces?.[0]?.image_uris?.normal
            }
            className="summaryFeaturedCard"
            alt={featuredCard.name}
          />
        )}
      </div>

      {/* RIGHT SIDE (stats) */}
      <div className="summaryRight">

        <h2 className="summaryTitle">Deck Summary</h2>

        <div className="summaryStat">
          <span>Total Cards</span>
          <strong>{data.totalCards}</strong>
        </div>

        <div className="summaryStat">
          <span>Total Mana</span>
          <strong>{data.totalMana}</strong>
        </div>

        <h3>Color Pips</h3>
        <div className="summaryGrid">
          {Object.entries(data.totalPips).map(([color, count]) => (
            <div key={color} className="summaryPip">
              <span>{color}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>

        <h3>Mana Curve</h3>
        <div className="summaryCurve">
          {Object.entries(data.manaCurve).map(([cmc, count]) => (
            <div key={cmc} className="curveBar">
              <span>{cmc}</span>
              <div className="barFill" style={{ height: `${count * 4}px` }} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}