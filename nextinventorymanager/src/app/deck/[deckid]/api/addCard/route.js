import { ensureCardExists } from "@/lib/cards/checkCards";
import { createClient } from "@/lib/supabase/server";

export async function POST(req, { params }) {
  const { deckid: deckId } = await params;
  const { cardId } = await req.json();

  console.log("route deckId is:", deckId);
  console.log("card id is:", cardId);

  if (!deckId) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing deckId in route params" }),
      { status: 400 }
    );
  }

  try {
    await ensureCardExists(cardId);
    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("deck_cards")
      .select("quantity")
      .eq("deck_id", deckId)
      .eq("card_id", cardId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500 }
      );
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("deck_cards")
        .update({ quantity: existing.quantity + 1 })
        .eq("deck_id", deckId)
        .eq("card_id", cardId);

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("deck_cards")
        .insert({ deck_id: deckId, card_id: cardId, quantity: 1 });

      if (insertError) {
        return new Response(
          JSON.stringify({ success: false, error: insertError.message }),
          { status: 500 }
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}