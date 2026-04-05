import { createClient } from "@/lib/supabase/server"

export async function POST(req) {
  const { deckId, cardId } = await req.json()
  const supabase = await createClient()

  //Checks if the deck contains the card already
  const { data: existing, error: fetchError } = await supabase
    .from("deck_cards")
    .select("quantity") // only need quantity
    .eq("deck_id", deckId)
    .eq("card_id", cardId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") { 
    return Response.json({ success: false, error: fetchError.message }, { status: 500 })
  }

  if (existing) {//incremements the card
    const { error: updateError } = await supabase
      .from("deck_cards")
      .update({ quantity: existing.quantity + 1 })
      .eq("deck_id", deckId)
      .eq("card_id", cardId)

    if (updateError) {
      return Response.json({ success: false, error: updateError.message }, { status: 500 })
    }
  } else {//add the card to the deck 
    const { error: insertError } = await supabase
      .from("deck_cards")
      .insert({ deck_id: deckId, card_id: cardId, quantity: 1 })

    if (insertError) {
      return Response.json({ success: false, error: insertError.message }, { status: 500 })
    }
  }

  return Response.json({ success: true })
}