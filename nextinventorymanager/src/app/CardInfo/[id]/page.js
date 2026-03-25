"use client";

import Navbar from "../../components/Navbar.js";
import "./cardStyle.css";
import { scryfallApi } from "../../API/Scryfall.js";
import { useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

export default function CardInfoPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <CardInfo />
    </Suspense>
  );
}

function CardInfo() {
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

  const [face, setFace] = useState(0);

  function getImage(card, face = 0) {
    if (!card) return "";

    if (card.image_uris?.large) {
      return card.image_uris.large;
    }

    if (card.card_faces?.[face]?.image_uris?.large) {
      return card.card_faces[face].image_uris.large;
    }

    return "";
  }
  const [setData, setSetData] = useState(null);
  useEffect(() => {
    if (!card) return;

    scryfallApi.getSet(card.set_uri).then(setSetData);
  }, [card]);

  if (!card) return <Loading />;

  function formatLegality(value) {
    if (value === "legal") return "Legal";
    if (value === "not_legal") return "Not Legal";
    if (value === "banned") return "Banned";
    if (value === "restricted") return "Restricted";
    return value;
  }

  function doubleFaceCheck() {
    if (card.object == "card_face" || card.layout == "modal_dfc") {
      <img src={card?.image_uris?.large} />;
    }
  }
  const currCard = card.card_faces?.[face] || card;

  return (
    <div>
      <Navbar />
      <div className="info-area">
        <div className="box image-box">
          <img src={getImage(card, face)} className="card-img" />

          {card.card_faces && (
            <button
              className="flip-btn"
              onClick={() => setFace(face === 0 ? 1 : 0)}
            >
              Flip
            </button>
          )}
        </div>
        <div className="box card-info">
          <div className="card-name">
            {currCard.name} {renderTextWithSymbols(currCard.mana_cost, symbols)}
          </div>
          <hr></hr>
          <div className="card-type">{currCard.type_line}</div>
          <hr></hr>
          <div className="card-text">
            {renderText(currCard.oracle_text, symbols)}
            <p>{currCard.flavor_text}</p>
          </div>
          <hr></hr>
          {currCard && currCard.type_line.includes("Creature") && (
            <div>
              <div className="card-PT">
                {currCard.power}/{currCard.toughness}
              </div>
              <hr />
            </div>
          )}
          <div className="card-set">
            <div className="set-row">
              {setData && (
                <img src={setData.icon_svg_uri} className="set-icon" />
              )}

              <span>
                {card.set_name} ({card.set.toUpperCase()})
              </span>
            </div>

            <div className="card-set-info">
              #{card.collector_number} • {card.rarity} • {card.set_type}
            </div>
          </div>
          <hr></hr>
          <div className="card-artist">
            <p>Illustrated by {currCard.artist}</p>
          </div>
          <hr></hr>
          <div className="card-legal">
            <div className={`legal ${card.legalities.standard}`}>
              Standard: {formatLegality(card.legalities.standard)}
            </div>

            <div className={`legal ${card.legalities.commander}`}>
              Commander: {formatLegality(card.legalities.commander)}
            </div>
            <div className={`legal ${card.legalities.modern}`}>
              Modern: {formatLegality(card.legalities.modern)}
            </div>
            <div className={`legal ${card.legalities.pioneer}`}>
              Pioneer: {formatLegality(card.legalities.pioneer)}
            </div>
          </div>
        </div>
      </div>
      <div className="print-body">
        <div className="print-name">PRINTS</div>
        <hr></hr>
        <div className="prints-area">
          {prints.map((p) => (
            <Link key={p.id} href={`/CardInfo/${p.id}`}>
              <img
                src={
                  p.image_uris?.small ||
                  p.card_faces?.[0]?.image_uris?.small ||
                  ""
                }
                className="print-img"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
