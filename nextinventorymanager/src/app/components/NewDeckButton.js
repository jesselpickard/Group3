'use client'

import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import './NewDeckButton.css'

export default function NewDeckButton() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const supabaseRef = useRef(null); // ✅ must be defined

  // create/reuse supabase client safely
  function getSupabaseSafely() {
    if (supabaseRef.current) return supabaseRef.current;

    try {
      supabaseRef.current = createClient();
      return supabaseRef.current;
    } catch {
      return null;
    }
  }

  // fetch user on mount
  useEffect(() => {
    const supabase = getSupabaseSafely();
    if (!supabase) return;

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      setUser(data.user);
    }

    fetchUser();
  }, [])

  // handle deck creation
  const handleCreateDeck = async () => {
    const supabase = getSupabaseSafely(); // ✅ make sure we get the client every time
    if (!user || !supabase) {
      alert('You must be logged in to create a deck');
      return;
    }

    const deckName = prompt('Enter deck name') || 'New Deck';

    const { data, error } = await supabase
      .from('Decks')
      .insert({ user_id: user.id, name: deckName })
      .select();

    if (error) {
      console.error(error);
      alert('Failed to create deck');
      return;
    }

    const newDeckId = data[0].deck_id;
    router.push(`/decks/${newDeckId}`);
  }

  return (
    <button className="new-deck-btn" onClick={handleCreateDeck}>
      ＋ New Deck
    </button>
  )
}