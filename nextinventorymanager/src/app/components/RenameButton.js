"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "./renameStyle.css";

export default function RenameButton({ deckId, deckName }) {
  const router = useRouter();

  async function renameDeck() {
    const newName = prompt("Enter new deck name", deckName);
    if (newName === null) return;
    if (newName.trim() === "") return;

    const supabase = createClient();
    const { error } = await supabase
      .from("decks")
      .update({ name: newName.trim() })
      .eq("deck_id", deckId);

    if (error) {
      alert(`Failed to rename deck: ${error.message}`);
      return;
    }

    router.refresh();
  }

  return <button onClick={renameDeck}>Rename Deck</button>;
}
