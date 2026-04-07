import { ensureCardExists } from "@/lib/cards/checkCards";
import { createClient } from "@/lib/supabase/server";

export async function POST(req, { params }) {
  console.log("Post params", params);
  console.log("post req", req);
  const deckId = params.deckid;
  const { cardId } = await req.json();
  console.log("route deckId is:", deckId);
  try{

    await ensureCardExists(cardId);//makes sure the card is actually in the cards table before adding to deck_cards
    const supabase = await createClient();

    //Check if the card is already in the deck
    const { data: existing, error: fetchError } = await supabase
      .from("deck_cards")
      .select("quantity")
      .eq("deck_id", deckId)
      .eq("card_id", cardId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return new Response(JSON.stringify({ success: false, error: fetchError.message }), { status: 500 });
    }

    if (existing) {//incremements if the card is already there
      const { error: updateError } = await supabase
        .from("deck_cards")
        .update({ quantity: existing.quantity + 1 })
        .eq("deck_id", deckId)
        .eq("card_id", cardId);

      if (updateError) {
        return new Response(JSON.stringify({ success: false, error: updateError.message }), { status: 500 });
      }
    } else {//adds the card to deck
      const { error: insertError } = await supabase
        .from("deck_cards")
        .insert({ deck_id: deckId, card_id: cardId, quantity: 1 });

      if (insertError) {
        return new Response(JSON.stringify({ success: false, error: insertError.message }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }

}