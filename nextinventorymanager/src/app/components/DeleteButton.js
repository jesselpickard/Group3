'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // client-side import

export default function DeleteButton({ deckId }) {
  const router = useRouter();

  async function deleteDeck() {
    const confirmed = confirm('Are you sure you want to delete this deck?');
    if (!confirmed) return;

    const supabase = createClient(); // no await needed on client side

    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('deck_id', deckId);

    if (error) {
      console.error(error);
      alert(`Failed to delete deck: ${error.message}`);
      return;
    }

    router.push('/decks');
  }

  return <button onClick={deleteDeck}>Delete Deck</button>;
}