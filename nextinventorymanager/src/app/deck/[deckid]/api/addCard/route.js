import { createClient } from "@/lib/supabase/server";
import { scryfallApi } from "@/lib/scryfall/Scryfall";

export async function POST(req, { params }) {
  // gets the dynamic deck id from the route
  const awaitedParams = await params;
  let deckId = awaitedParams?.deckid;

  // fallback: if params does not resolve correctly, pull deckId from the URL
  if (!deckId) {
    const pathname = new URL(req.url).pathname;
    const match = pathname.match(/\/deck\/([^/]+)\/api\/addCard$/);
    deckId = match?.[1];
  }

  // get the card name from the request body
  const { cardName } = await req.json();

  console.log("ADDCARD ROUTE NAME-FIRST VERSION");
  console.log("req.url:", req.url);
  console.log("awaited params:", awaitedParams);
  console.log("resolved deckId:", deckId);
  console.log("cardName:", cardName);

  // guard against bad route param
  if (!deckId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing deckId in route params and URL",
      }),
      { status: 400 }
    );
  }

  // guard against bad request body
  if (!cardName) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing cardName in request body",
      }),
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // ALWAYS resolve the card from Scryfall first (this becomes canonical)
    const card = await scryfallApi.namedExact(cardName);

    console.log("scryfall exact card:", card);

    if (!card?.id) {
      return new Response(
        JSON.stringify({
          success: false,
          step: "fetch exact card from scryfall",
          error: "Card not found on Scryfall",
        }),
        { status: 404 }
      );
    }

    let resolvedCardId = card.id;

    const cardData = {
      card_id: card.id,
      name: card.name || "Unknown",
      colors: card.colors || [],
      cost: card.mana_cost || null,
      type: card.type_line || null,
      cmc: card.cmc || null,
      extra: card,
    };

    // insert or update card in cards table
    // (fix: prevents duplicate key violations on card_id)
    const { data: insertedCard, error: insertCardError } = await supabase
      .from("cards")
      .upsert(cardData, { onConflict: "card_id" })
      .select("card_id, name")
      .single();

    console.log("insertedCard:", insertedCard);
    console.log("insertCardError:", insertCardError);

    if (insertCardError) {
      return new Response(
        JSON.stringify({
          success: false,
          step: "insert/upsert card into cards table",
          error: insertCardError.message,
          details: insertCardError,
        }),
        { status: 500 }
      );
    }

    resolvedCardId = insertedCard.card_id;

    console.log("resolvedCardId:", resolvedCardId);

    // check whether the card is already in this deck
    const { data: existingDeckCard, error: fetchDeckCardError } =
      await supabase
        .from("deck_cards")
        .select("quantity")
        .eq("deck_id", deckId)
        .eq("card_id", resolvedCardId)
        .maybeSingle();

    console.log("existingDeckCard:", existingDeckCard);
    console.log("fetchDeckCardError:", fetchDeckCardError);

    if (fetchDeckCardError) {
      return new Response(
        JSON.stringify({
          success: false,
          step: "fetch existing deck_cards row",
          error: fetchDeckCardError.message,
          details: fetchDeckCardError,
        }),
        { status: 500 }
      );
    }

    // if the card is already in the deck, increase quantity
    if (existingDeckCard) {
      const { error: updateError } = await supabase
        .from("deck_cards")
        .update({ quantity: existingDeckCard.quantity + 1 })
        .eq("deck_id", deckId)
        .eq("card_id", resolvedCardId);

      console.log("updateError:", updateError);

      if (updateError) {
        return new Response(
          JSON.stringify({
            success: false,
            step: "update deck_cards quantity",
            error: updateError.message,
            details: updateError,
          }),
          { status: 500 }
        );
      }
    } else {
      // otherwise insert the card into deck_cards
      const { error: insertDeckCardError } = await supabase
        .from("deck_cards")
        .insert({
          deck_id: deckId,
          card_id: resolvedCardId,
          quantity: 1,
        });

      console.log("insertDeckCardError:", insertDeckCardError);

      if (insertDeckCardError) {
        return new Response(
          JSON.stringify({
            success: false,
            step: "insert deck_cards row",
            error: insertDeckCardError.message,
            details: insertDeckCardError,
          }),
          { status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deckId,
        cardName,
        resolvedCardId,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.log("caught error:", err);

    return new Response(
      JSON.stringify({
        success: false,
        step: "catch block",
        error: err.message,
      }),
      { status: 500 }
    );
  }
}