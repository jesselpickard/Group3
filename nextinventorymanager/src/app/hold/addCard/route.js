import { createClient } from "@/lib/supabase/server"

export async function POST(req) {
  const { deckId, cardId } = await req.json()
  const supabase = await createClient()

  // Prevent duplicates: increment if exists
  const { data: existing } = await supabase
    .from("deck_cards")
    .select()
    .eq("deck_id", deckId)
    .eq("card_id", cardId)
    .single()

  if (existing) {
    await supabase
      .from("deck_cards")
      .update({ quantity: existing.quantity + 1 })
      .eq("deck_id", deckId)
      .eq("card_id", cardId)
  } else {
    await supabase
      .from("deck_cards")
      .insert({ deck_id: deckId, card_id: cardId, quantity: 1 })
  }

  return Response.json({ success: true })
}