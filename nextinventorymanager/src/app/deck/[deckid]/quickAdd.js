"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { scryfallApi } from "@/lib/scryfall/Scryfall";

export default function QuickAdd({ deckId }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // refs for debounce + preventing stale updates
  const debounceRef = useRef(null);
  const ignoreResultsRef = useRef(false);

  // debounce helper
  function debounce(fn, delay = 250) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(fn, delay);
  }

  // handle typing
  function handleChange(q) {
    setQuery(q);
    ignoreResultsRef.current = false; // allow new results

    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    debounce(async () => {
      setLoading(true);
      try {
        const { data } = await scryfallApi.autocomplete(q);

        // ignore stale results if user already selected something
        if (ignoreResultsRef.current) return;

        setSuggestions(data.slice(0, 10));
      } catch (err) {
        console.error("autocomplete error:", err);
        setSuggestions([]);
      }
      setLoading(false);
    }, 250);
  }

  // handle selecting a suggestion
  async function handleSelect(name) {
    setAdding(true);

    // stop any pending autocomplete + future updates
    ignoreResultsRef.current = true;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // clear UI immediately
    setSuggestions([]);
    setQuery("");

    try {
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
        disabled={adding}
      />

      {loading && <p>Searching...</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {suggestions.map((name) => (
          <li key={name} style={{ margin: "0.25rem 0" }}>
            <button
              type="button"
              onClick={() => handleSelect(name)}
              disabled={adding}
              className='popul'
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