import Navbar from '../components/Navbar';
import DeckGrid from '../components/DeckGrid';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Decks() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?next=/Inventory');
  }
  return (
    <div>
      <Navbar />
      <DeckGrid />
    </div>
  )
}