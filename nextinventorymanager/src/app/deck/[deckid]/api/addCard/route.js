import { ensureCardExists } from "@/lib/cards/checkCards";
import { createClient } from "@/lib/supabase/server";

export async function POST(req, { params }) {
  const awaitedParams = await params;
  let deckId = awaitedParams?.deckid;

  if (!deckId) {
    const pathname = new URL(req.url).pathname;
    const match = pathname.match(/\/deck\/([^/]+)\/api\/addCard$/);
    deckId = match?.[1];
  }

  const { cardId } = await req.json();

  console.log("req.url:", req.url);
  console.log("awaited params:", awaitedParams);
  console.log("resolved deckId:", deckId);
  console.log("cardId:", cardId);

  if (!deckId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing deckId in route params and URL"
      }),
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
      .maybeSingle();

    console.log("existing:", existing);
    console.log("fetchError:", fetchError);

    if (fetchError) {
      return new Response(
        JSON.stringify({
          success: false,
          step: "fetch existing deck_cards row",
          error: fetchError.message,
          details: fetchError
        }),
        { status: 500 }
      );
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("deck_cards")
        .update({ quantity: existing.quantity + 1 })
        .eq("deck_id", deckId)
        .eq("card_id", cardId);

      console.log("updateError:", updateError);

      if (updateError) {
        return new Response(
          JSON.stringify({
            success: false,
            step: "update deck_cards",
            error: updateError.message,
            details: updateError
          }),
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("deck_cards")
        .insert({
          deck_id: deckId,
          card_id: cardId,
          quantity: 1,
        });

      console.log("insertError:", insertError);

      if (insertError) {
        return new Response(
          JSON.stringify({
            success: false,
            step: "insert deck_cards",
            error: insertError.message,
            details: insertError
          }),
          { status: 500 }
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.log("caught error:", err);

    return new Response(
      JSON.stringify({
        success: false,
        step: "catch block",
        error: err.message
      }),
      { status: 500 }
    );
  }
}