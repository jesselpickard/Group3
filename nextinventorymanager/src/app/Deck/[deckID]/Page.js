"use client";

//import { useState, useEffect } from "react";
//import { scryfallApi } from "../../API/Scryfall";
import Navbar from "@/app/components/Navbar";
import { createClient } from "@/lib/supabase/server";

/**
 *  This page is meant to lay out the contents of a deck to its viewer. It will allow
 *  for the quick addition and removal of cards to its list as well as the ability to
 *  modify the quantities.
 * 
 *  To-do list: (non-exhaustive)
 *      Deck display. -> implemented as text for now
 *      Deck info display/modification.
 *      Quick add search.
 *      Card categories
 *      Deck summary.
 * 
 */

async function getDeckCards(deckId) {//attempts to access the contents of the deck and return 
  const supabase = createClient();
  const { data, error } = await supabase
    .from('deck_cards')
    .select('quantity, cards(card_id,name)')
    .eq('deck_id', deckId)

  if (error) throw new Error(error.message)

  return data
}

export default async function DeckPage({ params }) {//rudimentary form; should just display the list of cards for now
  const deckId = params.deckId

  const cards = await getDeckCards(deckId)

  return (
    <div>
      <Navbar />
      <h1>Deck: {deckId}</h1>

      <ul>
        {cards.map((card) => (
          <li key={card.cards.card_id}>
            Card: {card.cards ? card.cards.name : 'Missing card'} — Qty: {card.quantity}
          </li>
        ))}
      </ul>
    </div>
  )
}