/* ============================================================
   Group3 / MTG Inventory Manager - Supabase SQL Setup
   Project URL: https://upqoytyujlmnhbpodtuw.supabase.co

   Description:
   This SQL file contains the main database structure used for
   the MTG Inventory Manager project, including users, cards,
   inventory, decks, deck cards, indexes, helper functions,
   and Row Level Security policies.

   Copy this file into GitHub as:
   database.sql
   ============================================================ */


/* ============================================================
   1. Enable UUID Support
   ============================================================ */

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


/* ============================================================
   2. Users Table

   Stores application user profile information.
   This table connects to Supabase Auth through auth.users(id).
   ============================================================ */

CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


/* ============================================================
   3. Cards Table

   Stores card information, usually imported or matched from
   the Scryfall API.
   ============================================================ */

CREATE TABLE IF NOT EXISTS public.cards (
    card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scryfall_id UUID UNIQUE,
    name TEXT NOT NULL,
    set_code TEXT,
    collector_number TEXT,
    rarity TEXT,
    mana_cost TEXT,
    type_line TEXT,
    oracle_text TEXT,
    colors TEXT[],
    image_uri TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


/* ============================================================
   4. Inventory Table

   Stores which cards each user owns and how many copies they
   have in their inventory.
   ============================================================ */

CREATE TABLE IF NOT EXISTS public.inventory (
    inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES public.cards(card_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_user_card_inventory UNIQUE (user_id, card_id)
);


/* ============================================================
   5. Decks Table

   Stores deck information for each user.
   ============================================================ */

CREATE TABLE IF NOT EXISTS public.decks (
    deck_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    deck_name TEXT NOT NULL,
    colors TEXT[],
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


/* ============================================================
   6. Deck Cards Table

   Junction table that connects cards to decks.
   This allows many cards to belong to many decks.
   ============================================================ */

CREATE TABLE IF NOT EXISTS public.deck_cards (
    deck_card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.decks(deck_id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES public.cards(card_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_deck_card UNIQUE (deck_id, card_id)
);


/* ============================================================
   7. Indexes

   Indexes help speed up searches for cards, inventory,
   decks, and set codes.
   ============================================================ */

CREATE INDEX IF NOT EXISTS idx_cards_name
ON public.cards (name);

CREATE INDEX IF NOT EXISTS idx_cards_set_code
ON public.cards (set_code);

CREATE INDEX IF NOT EXISTS idx_inventory_user_id
ON public.inventory (user_id);

CREATE INDEX IF NOT EXISTS idx_inventory_card_id
ON public.inventory (card_id);

CREATE INDEX IF NOT EXISTS idx_decks_user_id
ON public.decks (user_id);

CREATE INDEX IF NOT EXISTS idx_deck_cards_deck_id
ON public.deck_cards (deck_id);

CREATE INDEX IF NOT EXISTS idx_deck_cards_card_id
ON public.deck_cards (card_id);


/* ============================================================
   8. Updated At Trigger Function

   Automatically updates the updated_at column when a row
   changes.
   ============================================================ */

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   9. Updated At Triggers
   ============================================================ */

DROP TRIGGER IF EXISTS set_inventory_updated_at ON public.inventory;

CREATE TRIGGER set_inventory_updated_at
BEFORE UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


DROP TRIGGER IF EXISTS set_decks_updated_at ON public.decks;

CREATE TRIGGER set_decks_updated_at
BEFORE UPDATE ON public.decks
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


/* ============================================================
   10. Helper Function: Add Card to Inventory

   If the user already has the card, increase the quantity.
   If not, insert it as a new inventory item.
   ============================================================ */

CREATE OR REPLACE FUNCTION public.add_card_to_inventory(
    p_user_id UUID,
    p_card_id UUID,
    p_quantity INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.inventory (user_id, card_id, quantity)
    VALUES (p_user_id, p_card_id, p_quantity)
    ON CONFLICT (user_id, card_id)
    DO UPDATE SET
        quantity = public.inventory.quantity + p_quantity,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   11. Helper Function: Remove Card from Inventory

   Lowers the card quantity. If the quantity reaches 0,
   the card is removed from the user's inventory.
   ============================================================ */

CREATE OR REPLACE FUNCTION public.remove_card_from_inventory(
    p_user_id UUID,
    p_card_id UUID,
    p_quantity INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.inventory
    SET
        quantity = quantity - p_quantity,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND card_id = p_card_id;

    DELETE FROM public.inventory
    WHERE user_id = p_user_id
      AND card_id = p_card_id
      AND quantity <= 0;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   12. Example Insert: Add a Card to Inventory

   Example values from the project:
   User ID:
   82d011c7-9cf7-4575-a704-cd466b9dc76a

   Card ID:
   824b2d73-2151-4e5e-9f05-8f63e2bdcaa9
   ============================================================ */

INSERT INTO public.inventory (user_id, card_id, quantity)
VALUES (
    '82d011c7-9cf7-4575-a704-cd466b9dc76a',
    '824b2d73-2151-4e5e-9f05-8f63e2bdcaa9',
    1
)
ON CONFLICT (user_id, card_id)
DO UPDATE SET
    quantity = public.inventory.quantity + 1,
    updated_at = NOW();


/* ============================================================
   13. Query: View All Cards in a User's Inventory
   ============================================================ */

SELECT
    inventory.inventory_id,
    inventory.user_id,
    inventory.card_id,
    cards.name,
    cards.set_code,
    cards.collector_number,
    cards.rarity,
    cards.mana_cost,
    cards.type_line,
    cards.image_uri,
    inventory.quantity
FROM public.inventory
JOIN public.cards
    ON inventory.card_id = cards.card_id
WHERE inventory.user_id = '82d011c7-9cf7-4575-a704-cd466b9dc76a'
ORDER BY cards.name;


/* ============================================================
   14. Query: Search Inventory by Card Name or Set Code
   ============================================================ */

SELECT
    inventory.inventory_id,
    inventory.user_id,
    inventory.card_id,
    cards.name,
    cards.set_code,
    cards.collector_number,
    cards.rarity,
    cards.mana_cost,
    cards.type_line,
    cards.image_uri,
    inventory.quantity
FROM public.inventory
JOIN public.cards
    ON inventory.card_id = cards.card_id
WHERE inventory.user_id = '82d011c7-9cf7-4575-a704-cd466b9dc76a'
  AND (
        cards.name ILIKE '%search_text%'
        OR cards.set_code ILIKE '%search_text%'
      )
ORDER BY cards.name;


/* ============================================================
   15. Query: View All Decks for a User
   ============================================================ */

SELECT
    deck_id,
    user_id,
    deck_name,
    colors,
    description,
    created_at,
    updated_at
FROM public.decks
WHERE user_id = '82d011c7-9cf7-4575-a704-cd466b9dc76a'
ORDER BY created_at DESC;


/* ============================================================
   16. Query: View Cards Inside a Deck
   ============================================================ */

SELECT
    decks.deck_id,
    decks.deck_name,
    cards.card_id,
    cards.name,
    cards.set_code,
    cards.collector_number,
    cards.rarity,
    cards.mana_cost,
    cards.type_line,
    cards.image_uri,
    deck_cards.quantity
FROM public.deck_cards
JOIN public.decks
    ON deck_cards.deck_id = decks.deck_id
JOIN public.cards
    ON deck_cards.card_id = cards.card_id
WHERE decks.deck_id = 'replace-with-deck-id'
ORDER BY cards.name;


/* ============================================================
   17. Row Level Security

   Enables Supabase security rules so users can only access
   their own inventory, decks, and deck cards.
   ============================================================ */

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deck_cards ENABLE ROW LEVEL SECURITY;


/* ============================================================
   18. Users RLS Policies
   ============================================================ */

DROP POLICY IF EXISTS "Users can view their own profile"
ON public.users;

CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = user_id);


DROP POLICY IF EXISTS "Users can insert their own profile"
ON public.users;

CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = user_id);


DROP POLICY IF EXISTS "Users can update their own profile"
ON public.users;

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


/* ============================================================
   19. Cards RLS Policies

   Cards are readable by authenticated users.
   Inserts and updates can be restricted depending on how the
   project imports Scryfall card data.
   ============================================================ */

DROP POLICY IF EXISTS "Authenticated users can view cards"
ON public.cards;

CREATE POLICY "Authenticated users can view cards"
ON public.cards
FOR SELECT
TO authenticated
USING (true);


DROP POLICY IF EXISTS "Authenticated users can insert cards"
ON public.cards;

CREATE POLICY "Authenticated users can insert cards"
ON public.cards
FOR INSERT
TO authenticated
WITH CHECK (true);


/* ============================================================
   20. Inventory RLS Policies
   ============================================================ */

DROP POLICY IF EXISTS "Users can view their own inventory"
ON public.inventory;

CREATE POLICY "Users can view their own inventory"
ON public.inventory
FOR SELECT
USING (auth.uid() = user_id);


DROP POLICY IF EXISTS "Users can insert into their own inventory"
ON public.inventory;

CREATE POLICY "Users can insert into their own inventory"
ON public.inventory
FOR INSERT
WITH CHECK (auth.uid() = user_id);


DROP POLICY IF EXISTS "Users can update their own inventory"
ON public.inventory;

CREATE POLICY "Users can update their own inventory"
ON public.inventory
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


DROP POLICY IF EXISTS "Users can delete from their own inventory"
ON public.inventory;

CREATE POLICY "Users can delete from their own inventory"
ON public.inventory
FOR DELETE
USING (auth.uid() = user_id);


/* ============================================================
   21. Decks RLS Policies
   ============================================================ */

DROP POLICY IF EXISTS "Users can view their own decks"
ON public.decks;

CREATE POLICY "Users can view their own decks"
ON public.decks
FOR SELECT
USING (auth.uid() = user_id);


DROP POLICY IF EXISTS "Users can create their own decks"
ON public.decks;

CREATE POLICY "Users can create their own decks"
ON public.decks
FOR INSERT
WITH CHECK (auth.uid() = user_id);


DROP POLICY IF EXISTS "Users can update their own decks"
ON public.decks;

CREATE POLICY "Users can update their own decks"
ON public.decks
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


DROP POLICY IF EXISTS "Users can delete their own decks"
ON public.decks;

CREATE POLICY "Users can delete their own decks"
ON public.decks
FOR DELETE
USING (auth.uid() = user_id);


/* ============================================================
   22. Deck Cards RLS Policies

   A user can only access deck cards if the deck belongs to them.
   ============================================================ */

DROP POLICY IF EXISTS "Users can view cards in their own decks"
ON public.deck_cards;

CREATE POLICY "Users can view cards in their own decks"
ON public.deck_cards
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.decks
        WHERE decks.deck_id = deck_cards.deck_id
          AND decks.user_id = auth.uid()
    )
);


DROP POLICY IF EXISTS "Users can insert cards into their own decks"
ON public.deck_cards;

CREATE POLICY "Users can insert cards into their own decks"
ON public.deck_cards
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.decks
        WHERE decks.deck_id = deck_cards.deck_id
          AND decks.user_id = auth.uid()
    )
);


DROP POLICY IF EXISTS "Users can update cards in their own decks"
ON public.deck_cards;

CREATE POLICY "Users can update cards in their own decks"
ON public.deck_cards
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM public.decks
        WHERE decks.deck_id = deck_cards.deck_id
          AND decks.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.decks
        WHERE decks.deck_id = deck_cards.deck_id
          AND decks.user_id = auth.uid()
    )
);


DROP POLICY IF EXISTS "Users can delete cards from their own decks"
ON public.deck_cards;

CREATE POLICY "Users can delete cards from their own decks"
ON public.deck_cards
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.decks
        WHERE decks.deck_id = deck_cards.deck_id
          AND decks.user_id = auth.uid()
    )
);


/* ============================================================
   23. Useful Schema Display Query

   This query shows all public tables and columns in the project.
   Helpful for documentation, debugging, and ERD creation.
   ============================================================ */

SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
