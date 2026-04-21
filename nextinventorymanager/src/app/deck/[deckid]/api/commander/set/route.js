import { createClient } from "@/lib/supabase/server";

export async function POST(req) {
  try {
    const { deckId, cardId } = await req.json();

    if (!deckId) {
      return Response.json(
        { error: "Missing deckId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("decks")
      .update({ commander: cardId ?? null })
      .eq("deck_id", deckId)
      .select();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ success: true, data });
  } catch (err) {
    return Response.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}