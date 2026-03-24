"use client";

import Navbar from "../../components/Navbar.js";
import "./cardStyle.css";
import { scryfallApi } from "../../API/Scryfall.js";
import { useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
//import { useSearchParams } from "next/navigation";

export default function CardInfoPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <CardInfo />
    </Suspense>
  );
}

function CardInfo() {
  //const searchParams = useSearchParams();
  //const id = searchParams.get("id");

  const { id } = useParams();

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
  const [symbols, setSymbols] = useState([]);

  useEffect(() => {
    scryfallApi.getSymbols().then((data) => {
      setSymbols(data.data);
    });
  }, []);

  function renderTextWithSymbols(text, symbols) {
    if (!text) return null;
    const parts = text.split(/(\{.*?\})/g);
    return parts.map((part, i) => {
      const symbol = symbols.find((s) => s.symbol === part);
      if (symbol) {
        return <img key={i} src={symbol.svg_uri} style={{ width: "18px" }} />;
      }
      return part;
    });
  }

  function renderText(text, symbols) {
    if (!text) return null;

    return text
      .split("\n")
      .map((line, i) => (
        <div key={i}>{renderTextWithSymbols(line, symbols)}</div>
      ));
  }
  const [prints, setPrints] = useState([]);

  useEffect(() => {
    if (!card) return;

    scryfallApi.getPrints(card.prints_search_uri).then((data) => {
      setPrints(data.data);
    });
  }, [card]);

  if (!card) return <Loading />;

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
            {card.name} {renderTextWithSymbols(card.mana_cost, symbols)}
          </div>
          <hr></hr>
          <div className="card-type">{card.type_line}</div>
          <hr></hr>
          <div className="card-text">
            {renderText(card.oracle_text, symbols)}
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
      <div className="print-body">
        <div className="print-name">PRINTS</div>
        <hr></hr>
        <div className="prints-area">
          {prints.map((p) => (
            <a key={p.id} href={`/CardInfo/${p.id}`}>{/*replaced ?id= with /*/}
              <img
                src={p.image_uris?.small}
                className="print-img"
                alt={p.name}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
