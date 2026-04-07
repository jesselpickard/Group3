"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { scryfallApi } from "@/lib/scryfall/Scryfall";

export default function QuickAdd({ deckId }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  let debounceTimeout;

  function debounce(fn, delay = 250) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(fn, delay);
  }

  function handleChange(q) {
    setQuery(q);

    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    debounce(async () => {
      setLoading(true);
      try {
        const { data } = await scryfallApi.autocomplete(q);
        setSuggestions(data.slice(0, 10));
      } catch (err) {
        console.error(err);
        setSuggestions([]);
      }
      setLoading(false);
    }, 250);
  }

  async function handleSelect(name) {
    setAdding(true);

    try {
      const { data: cards } = await scryfallApi.search(`!"${name}"`);
      const card = cards[0];
      if (!card) return;

      console.log("quickAdd deckId is:", deckId);
      console.log("card id is:", card.id);

      const res = await fetch(`/deck/${deckId}/api/addCard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId: card.id }),
      });

      const result = await res.json();
      console.log("addCard result:", result);

      if (!res.ok) {
        throw new Error(result.error || "Failed to add card");
      }

      setQuery("");
      setSuggestions([]);
      router.refresh();
    } catch (err) {
      console.error(err);
    }

    setAdding(false);
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Search cards..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        style={{ width: "100%", padding: "0.5rem" }}
      />

      {loading && <p>Searching...</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {suggestions.map((name) => (
          <li key={name} style={{ margin: "0.25rem 0" }}>
            <button
              type="button"
              onClick={() => handleSelect(name)}
              disabled={adding}
              style={{
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                padding: "0.25rem 0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: "#f9f9f9",
              }}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}