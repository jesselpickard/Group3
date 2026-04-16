"use client"; // Required for Next.js client-side rendering

// Import components, styles, API helper, and React tools
import Navbar from "../../components/Navbar.js";
import "./cardStyle.css";
import { scryfallApi } from "../../../lib/scryfall/Scryfall.js";
import { useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

// Wrapper component that enables loading fallback with Suspense
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
  const [quantity, setQuantity] = useState(0);
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;

    // safe supabase logic here
  }, [supabase]);

  useEffect(() => {
    if (!id) return;
    scryfallApi.getCardById(id).then(setCard);
  }, [id]);
  // Fetch the quantity of this card in the user's inventory
  useEffect(() => {
    const fetchQuantity = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !card) return;

      const { data } = await supabase
        .from("inventory")
        .select("quantity")
        .eq("user_id", user.id)
        .eq("card_id", card.id)
        .single();

      if (data) setQuantity(data.quantity);
    };

    fetchQuantity();
  }, [card]);
  //User authentication check (to link inventory to specific users)
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, []);

  // =======================
  // LOADING ANIMATION
  // =======================
  function Loading() {
    // Controls the animated dots (....)
    const [dots, setDots] = useState("");

    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 5 ? prev + "." : ""));
      }, 500);

      // Cleanup interval when component unmounts
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

  // =======================
  // SYMBOL DATA (mana icons)
  // =======================
  const [symbols, setSymbols] = useState([]);

  // Fetch mana symbols from API
  useEffect(() => {
    scryfallApi.getSymbols().then((data) => {
      setSymbols(data.data);
    });
  }, []);

  // Replace {G}, {R}, etc. with actual images
  function renderTextWithSymbols(text, symbols) {
    if (!text) return null;

    // Split text into parts like "{G}" and normal text
    const parts = text.split(/(\{.*?\})/g);

    return parts.map((part, i) => {
      const symbol = symbols.find((s) => s.symbol === part);

      // If it's a symbol, render image
      if (symbol) {
        return <img key={i} src={symbol.svg_uri} style={{ width: "18px" }} />;
      }

      // Otherwise return plain text
      return part;
    });
  }

  // Handles multi-line card text (splits by line breaks)
  function renderText(text, symbols) {
    if (!text) return null;

    return text
      .split("\n")
      .map((line, i) => (
        <div key={i}>{renderTextWithSymbols(line, symbols)}</div>
      ));
  }

  // =======================
  // PRINTS (other versions of the card)
  // =======================
  const [prints, setPrints] = useState([]);

  useEffect(() => {
    if (!card) return;

    // Fetch all print versions of this card
    scryfallApi.getPrints(card.prints_search_uri).then((data) => {
      setPrints(data.data);
    });
  }, [card]);

  // =======================
  // DOUBLE-FACED CARD HANDLING
  // =======================
  const [face, setFace] = useState(0); // 0 = front, 1 = back

  // Get correct image depending on card type
  function getImage(card, face = 0) {
    if (!card) return "";

    // Normal cards
    if (card.image_uris?.large) {
      return card.image_uris.large;
    }

    // Double-faced cards
    if (card.card_faces?.[face]?.image_uris?.large) {
      return card.card_faces[face].image_uris.large;
    }

    return "";
  }

  // =======================
  // SET DATA (icon, etc.)
  // =======================
  const [setData, setSetData] = useState(null);

  useEffect(() => {
    if (!card) return;

    // Fetch set info (icon, metadata)
    scryfallApi.getSet(card.set_uri).then(setSetData);
  }, [card]);

  // Show loading screen if card hasn't loaded yet
  if (!card) return <Loading />;

  // =======================
  // FORMATTING HELPERS
  // =======================

  // Converts API legality values into readable text
  function formatLegality(value) {
    if (value === "legal") return "Legal";
    if (value === "not_legal") return "Not Legal";
    if (value === "banned") return "Banned";
    if (value === "restricted") return "Restricted";
    return value;
  }

  // (Unused function - looks like a work in progress)
  function doubleFaceCheck() {
    if (card.object == "card_face" || card.layout == "modal_dfc") {
      <img src={card?.image_uris?.large} />;
    }
  }

  // Use correct face if it's a double-faced card
  const currCard = card.card_faces?.[face] || card;

  //Add or remove this card from the user's inventory (linked to their account)
  async function addToInventory() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !card) return;

    const { data } = await supabase
      .from("inventory")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("card_id", card.id)
      .single();

    if (!data) {
      await supabase.from("inventory").upsert({
        user_id: user.id,
        card_id: card.id,
        quantity: 1,
      });

      setQuantity(1);
    } else {
      // update row
      const newQty = data.quantity + 1;

      await supabase
        .from("inventory")
        .update({ quantity: newQty })
        .eq("user_id", user.id)
        .eq("card_id", card.id);

      setQuantity(newQty);
    }
  }
  async function removeFromInventory() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !card) return;

    const { data } = await supabase
      .from("inventory")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("card_id", card.id)
      .single();

    if (!data) return;

    const newQty = Math.max(0, data.quantity - 1);

    await supabase
      .from("inventory")
      .update({ quantity: newQty })
      .eq("user_id", user.id)
      .eq("card_id", card.id);

    setQuantity(newQty);
  }

  // =======================
  // RENDER UI
  // =======================
  return (
    <div>
      <Navbar />

      <div className="info-area">
        {/* CARD IMAGE */}
        <div className="box image-box">
          <img src={getImage(card, face)} className="card-img" />

          {/* Flip button only shows for double-faced cards */}
          {card.card_faces && (
            <button
              className="flip-btn"
              onClick={() => setFace(face === 0 ? 1 : 0)}
            >
              Flip
            </button>
          )}
        </div>

        {/* CARD DETAILS */}
        <div className="box card-info">
          {/* Name + mana cost */}
          <div className="card-name">
            {currCard.name}
            {renderTextWithSymbols(currCard.mana_cost, symbols)}
          </div>

          <hr />

          <div className="card-type">{currCard.type_line}</div>

          <hr />

          {/* Rules text + flavor text */}
          <div className="card-text">
            {renderText(currCard.oracle_text, symbols)}
            <p>{currCard.flavor_text}</p>
          </div>

          <hr />

          {/* Power / Toughness (only for creatures) */}
          {currCard && currCard.type_line.includes("Creature") && (
            <div>
              <div className="card-PT">
                {currCard.power}/{currCard.toughness}
              </div>
              <hr />
            </div>
          )}

          {/* SET INFO */}
          <div className="card-set">
            <div className="set-row">
              {/* Set icon */}
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

          <hr />

          {/* Artist */}
          <div className="card-artist">
            <p>Illustrated by {currCard.artist}</p>
          </div>

          <hr />

          {/* LEGALITY INFO */}
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

          {/*ADDING CARD TO INVENTORY */}
          {user && (
            <div className="addInventory">
              <hr />
              <div className="cardAmount">Amount Owned: {quantity}</div>
              <div className="inventoryInput">
                <div className="addButtons">
                  <button onClick={addToInventory}>
                    Add to Inventory <p>+</p>
                  </button>
                </div>
                <div className="removeButtons">
                  <button onClick={removeFromInventory}>
                    Remove from Inventory <p>-</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRINTS SECTION */}
      <div className="print-body">
        <div className="print-name">PRINTS</div>
        <hr />

        <div className="prints-area">
          {/* Loop through all prints and show clickable images */}
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
