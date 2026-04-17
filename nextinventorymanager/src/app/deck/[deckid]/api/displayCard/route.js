import { createClient } from "@/lib/supabase/server";

export async function POST(req, { params }) {
  const deckId = params.deckid;
  const body = await req.json();
  const cardId = body?.cardId;

  if (!cardId) {
    return Response.json(
      { error: "cardId is required" },
      { status: 400 }
    );
  }
  
  const supabase = await createClient();

  const { error } = await supabase
    .from("decks")
    .update({
      commander: cardId,
    })
    .eq("deck_id", deckId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}