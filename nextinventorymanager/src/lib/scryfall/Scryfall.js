import { createClient } from "@/lib/supabase/server";
import { scryfallApi } from "@/lib/scryfall/Scryfall"; 

async function getCommander(deckId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("decks")
    .select("commander")
    .eq("deck_id", deckId)
    .single();

  if (error) throw new Error(error.message);

  return data?.commander || null;
}

export default async function DeckCommanderDisplay({ deckId }) {
  if (!deckId) return <p>No deck selected.</p>;

  let commander;

  try {
    commander = await getCommander(deckId);
  } catch (err) {
    return <p>Error loading commander: {err.message}</p>;
  }

  if (!commander) return <p>No commander assigned.</p>;

  let card;

  try {
    card = await scryfallApi.getCardById(commander);
  } catch (err) {
    return <p>Error loading card image.</p>;
  }

  const image =
    card?.image_uris?.normal ||
    card?.card_faces?.[0]?.image_uris?.normal;

  if (!image) return <p>No image available.</p>;

  return (
    <div>
      <h2>Commander</h2>
      <img
        src={image}
        alt={card?.name}
        style={{ width: 250, borderRadius: 8 }}
      />
      <p>{card?.name}</p>
    </div>
  );
}