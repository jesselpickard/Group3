"use client";

import Navbar from "../components/Navbar.js";
import "./cardStyle.css";
import { scryfallApi } from "../API/Scryfall";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CardInfo() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [card, setCard] = useState(null);

  useEffect(() => {
    if (!id) return;

    scryfallApi.getCardById(id).then(setCard);
  }, [id]);

  function Loading() {
    const [dots, setDots] = useState("");
    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 5 ? prev + "." : ""));
      }, 500);
      return () => clearInterval(interval);
    }, []);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "2rem",
          fontFamily: "Arial, sans-serif",
          color: "#555",
        }}
      >
        Fetching Card Info{dots}
      </div>
    );
  }

  if (!card) return <Loading />;
  //if (!card) return <div>Loading...</div>;

  // const [card] = useState({
  //   id: "test",
  //   name: "Apprentice Wizard",
  //   type_line: "Creature — Debug Wizard",
  //   oracle_text: "This is a fake card used for testing.",
  //   artist: "Dan Frazier",
  //   legal:"legal",
  //   image_uris: {
  //     large: "https://cards.scryfall.io/large/front/f/e/fe75a1c1-e55e-4c49-9419-43bf5962142d.jpg"
  //   }
  // });

  function formatLegality(value) {
    if (value === "legal") return "Legal";
    if (value === "not_legal") return "Not Legal";
    if (value === "banned") return "Banned";
    if (value === "restricted") return "Restricted";
    return value;
  }

  return (
    <div>
      <Navbar />
      <div className="info-area">
        <div className="box image-box">
          <img src={card?.image_uris?.large} />
        </div>
        <div className="box card-info">
          <div className="card-name">
            {card.name} {card.mana_cost}
          </div>
          <hr></hr>
          <div className="card-type">{card.type_line}</div>
          <hr></hr>
          <div className="card-text">
            {card.oracle_text}
            <br></br>
            <br></br>
            <p>{card.flavor_text}</p>
          </div>
          <hr></hr>
          {card && card.type_line.includes("Creature") && (
            <div>
              <div className="card-PT">
                {card.power}/{card.toughness}
              </div>
              <hr />
            </div>
          )}
          <div className="card-artist">
            <p>Illustrated by {card.artist}</p>
          </div>
          <hr></hr>
          <div className="card-legal">
            <div className={`legal ${card.legalities.standard}`}>
              Standard: {formatLegality(card.legalities.standard)}
            </div>

            <div className={`legal ${card.legalities.commander}`}>
              Commander: {formatLegality(card.legalities.commander)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
