'use client'

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import './NewDeckButton.css';

export default function NewDeckButton({ userId }) {
  const router = useRouter()

  const handleCreateDeck = async () => {
    const deckName = prompt('Enter deck name') || 'New Deck';

    const { data, error } = await supabase
      .from('Decks')
      .insert({
        user_id: userId,
        name: deckName,
      })
      .select(); // this returns the inserted row

    if (error) {
      console.error(error);
      alert('Failed to create deck');
      return;;
    }

    const newDeck = data[0];
    const newDeckId = newDeck.deck_id;

    router.push(`/decks/${newDeckId}`)//redirects to the new deck upon creation
  }

  return (
    <button className="new-deck-btn" onClick={handleCreateDeck}>
      ＋ New Deck
    </button>
  )
}