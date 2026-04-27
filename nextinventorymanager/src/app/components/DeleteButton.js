'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

//Delete button
export default function DeleteButton({ deckId }) {
  const router = useRouter();

  async function deleteDeck() {
    const confirmed = confirm('Are you sure you want to delete this deck?');
    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('deck_id', deckId);

    if (error) {
      console.error(error);
      alert(`Failed to delete deck: ${error.message}`);
      return;
    }

    router.push(`/Decks`);
  }

  return <button onClick={deleteDeck}>Delete Deck</button>;
}