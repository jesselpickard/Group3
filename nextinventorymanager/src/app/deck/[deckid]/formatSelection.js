"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function FormatSelector({ deckId, currentFormatId }) {
  const supabase = createClient();
  const router = useRouter();

  const [formats, setFormats] = useState([]);
  const [selected, setSelected] = useState(currentFormatId || "");

  useEffect(() => {
    async function fetchFormats() {
      const { data, error } = await supabase
        .from("formats")
        .select("format_id, name, minCards, maxCards");

      if (!error) setFormats(data);
    }

    fetchFormats();
  }, []);

  async function handleChange(e) {
    const newFormatId = e.target.value;
    setSelected(newFormatId);

    const { error } = await supabase
      .from("decks")
      .update({ format_id: newFormatId })
      .eq("deck_id", deckId);

    if (error) {
      console.error("Error updating format:", error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <h3>Change Format</h3>

      <select value={selected} onChange={handleChange}>
        <option value="">Select a format</option>

        {formats.map(format => (
          <option key={format.format_id} value={format.format_id}>
            {format.name} (
            {format.minCards} - {format.maxCards ?? "∞"})
          </option>
        ))}
      </select>
    </div>
  );
}