"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import "./formatSelect.css";

export default function FormatSelector({ deckId, currentFormat }) {
  const supabase = createClient();
  const router = useRouter();

  const [formats, setFormats] = useState([]);
  const [selected, setSelected] = useState(currentFormat || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchFormats() {
      const { data, error } = await supabase
        .from("formats")
        .select("name, minCards, maxCards");

      if (!error) setFormats(data);
    }

    fetchFormats();
  }, []);

  async function handleSelect(formatName) {
    setSelected(formatName || "");
    setOpen(false);

    const { error } = await supabase
      .from("decks")
      .update({ format: formatName || null })
      .eq("deck_id", deckId);

    if (error) {
      console.error("Error updating format:", error.message);
      return;
    }

    router.refresh();
  }

  const selectedFormat = formats.find((f) => f.name === selected);

  return (
    <div className="format-select">
      <h3 className="format-label">Change Format</h3>

      <button
        className="format-selected"
        onClick={() => setOpen((prev) => !prev)}
      >
        {selectedFormat
          ? `${selectedFormat.name} (${selectedFormat.minCards} - ${selectedFormat.maxCards ?? "∞"})`
          : "Select a format"}
        <span className="arrow">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="format-dropdown">
          <div className="format-option" onClick={() => handleSelect(null)}>
            Unselected
          </div>
          {formats.map((format) => (
            <div
              key={format.name}
              className="format-option"
              onClick={() => handleSelect(format.name)}
            >
              {format.name} ({format.minCards} - {format.maxCards ?? "∞"})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
