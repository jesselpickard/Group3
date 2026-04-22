import { createClient } from "@/lib/supabase/server";

async function getCommander(deckId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("decks")
    .select(`commander`)
    .eq("deck_id", deckId)
    .single();

  if (error) throw new Error(error.message);

  return data?.formats || null;
}

export default async function DeckCommanderDisplay({ deckId }) {
  if (!deckId) return <p>No deck selected.</p>;

  let commander;

  try {
    commander = await getCommander(deckId);
  } catch (err) {
    return <p>Error loading format: {err.message}</p>;
  }

  if (!commander) return <p>No commander assigned.</p>;

  return (
    <div>
      <h2>Commander</h2>
      <p>{format.minCards}</p>
    </div>
  );
}