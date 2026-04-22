import { createClient } from "@/lib/supabase/server";

async function getDeckFormat(deckId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("decks")
    .select(`
      formats (
        name,
        minCards,
        maxCards
      )
    `)
    .eq("deck_id", deckId)
    .single();

  if (error) throw new Error(error.message);

  return data?.formats || null;
}

export default async function DeckFormatDisplay({ deckId }) {
  if (!deckId) return <p>No deck selected.</p>;

  let format;

  try {
    format = await getDeckFormat(deckId);
  } catch (err) {
    return <p>Error loading format: {err.message}</p>;
  }

  if (!format) return <p>No format assigned.</p>;

  return (
    <div>
      <h2>Format</h2>
      <p><strong>Name:</strong> {format.name}</p>
      <p><strong>Min Cards:</strong> {format.minCards}</p>
      <p>
        <strong>Max Cards:</strong>{" "}
        {format.maxCards ?? "No maximum"}
      </p>
    </div>
  );
}