"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { scryfallApi } from "@/lib/scryfall/Scryfall";
import "./quickAdd.css";

export default function QuickAdd({ deckId }) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const ignoreResultsRef = useRef(false);

  // 🔥 click-off detection
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function debounce(fn, delay = 250) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, delay);
  }

  function handleChange(q) {
    setQuery(q);
    setOpen(true);
    ignoreResultsRef.current = false;

    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    debounce(async () => {
      setLoading(true);

      try {
        const { data } = await scryfallApi.autocomplete(q);

        if (ignoreResultsRef.current) return;

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
    ignoreResultsRef.current = true;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    setSuggestions([]);
    setQuery("");
    setOpen(false);

    try {
      const res = await fetch(`/deck/${deckId}/api/addCard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardName: name }),
      });

      if (!res.ok) throw new Error("Failed to add card");

      router.refresh();
    } catch (err) {
      console.error(err);
    }

    setAdding(false);
  }

  return (
    <div className="quickadd-select" ref={wrapperRef}>
      <h3 className="quickadd-label">Quick Add to Deck</h3>

      <div className="quickadd-selected">
        <input
          value={query}
          placeholder="Search cards..."
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          disabled={adding}
        />
      </div>

      {open && (
        <div className="quickadd-dropdown">
          {loading && <div className="quickadd-option">Searching...</div>}

          {suggestions.map((name) => (
            <div
              key={name}
              className="quickadd-option"
              onClick={() => handleSelect(name)}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}