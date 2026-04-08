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

  // simple debounce so we do not spam autocomplete requests
  function debounce(fn, delay = 250) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(fn, delay);
  }

  // handles typing in the search box and updates suggestions
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
        setSuggestions(data.slice(0, 10)); // top 10 suggestions
      } catch (err) {
        console.error("autocomplete error:", err);
        setSuggestions([]);
      }
      setLoading(false);
    }, 250);
  }

  // when a user clicks a card suggestion, send the CARD NAME to the route
  // the route will look for the card in Supabase first before using Scryfall
  async function handleSelect(name) {
    setAdding(true);

    try {
      console.log("quickAdd deckId:", deckId);
      console.log("quickAdd cardName:", name);

      const res = await fetch(`/deck/${deckId}/api/addCard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardName: name }),
      });

      const result = await res.json();
      console.log("addCard result:", result);

      if (!res.ok) {
        throw new Error(result.error || "Failed to add card");
      }

      // clear input after successful add
      setQuery("");
      setSuggestions([]);

      // refresh page data so the added card shows up
      router.refresh();
    } catch (err) {
      console.error("handleSelect error:", err);
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