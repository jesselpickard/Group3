
'use client'

import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import './NewDeckButton.css'

export default function NewDeckButton() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const supabaseRef = useRef(null);

  function getSupabaseSafely() {
      if (supabaseRef.current) return supabaseRef.current;
  
      try {
        supabaseRef.current = createClient();
        return supabaseRef.current;
      } catch {
        // If env vars aren't present, just behave as logged-out (no crash).
        return null;
      }
    }

  useEffect(() => {//gets the the user

    const supabase = getSupabaseSafely();
    if (!supabase) return;


    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error('Error fetching user:', error);
        return;
      }

      setUser(data.user)
    }

    getUser()
  }, [])

  const handleCreateDeck = async () => {
    if (!user) {
      alert('You must be logged in to create a deck');
      return;
    }

    const deckName = prompt('Enter deck name') || 'New Deck'

    const { data, error } = await supabase
      .from('Decks')
      .insert({
        user_id: user.id,
        name: deckName,
      })
      .select();//this returns the inserted row

    if (error) {
      console.error(error)
      alert('Failed to create deck')
      return
    }

    const newDeckId = data[0].deck_id;

    router.push(`/decks/${newDeckId}`);//redirects to the new deck upon creation
  }

  return (
    <button className="new-deck-btn" onClick={handleCreateDeck}>
      ＋ New Deck
    </button>
  )
}

