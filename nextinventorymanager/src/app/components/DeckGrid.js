"use client";
import { useState, useRef } from 'react';
import './DeckGrid.css';
import NewDeckButton from "./NewDeckButton";
import { useEffect } from 'react';
import Link from "next/link";

//New-Deck-Button is being replaced by a component, its relating space in deckgrid.css will become obsolete

// placeholder decks for testing. will be replaced with real data later
const SF = (name) =>
  `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}&format=image&version=normal`;

// creates supabase client safely, same pattern as Navbar.js
function getSupabaseSafely() {
  try {
    const { createClient } = require('@/lib/supabase/client');
    return createClient();
  } catch {
    return null;
  }
}

// fallback placeholder images if deck has fewer than 3 cards
const PLACEHOLDER_FAN = [
  /*'https://via.placeholder.com/150x210/9370DB/white?text=?',
  'https://via.placeholder.com/150x210/7B52AB/white?text=?',
  'https://via.placeholder.com/150x210/6A3D9A/white?text=?',*/
   '#9370DB', 
   '#7B52AB', 
   '#6A3D9A',
];

const DECKS_PER_PAGE = 20;

// pagination bar - reused from CardGrid logic
function PaginationBar({ currentPage, totalPages, onPageChange }) {
  const [jumpValue, setJumpValue] = useState('');

  const handleJump = () => {
    const num = parseInt(jumpValue);
    if (num >= 1 && num <= totalPages) {
      onPageChange(num);
      setJumpValue('');
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      // build the actual page number buttons
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // near the start: show first 5, ellipsis, last
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    // near the end: show first, ellipsis, last 5
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    // middle: show first, ellipsis, current neighbors, ellipsis, last
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  /* no pagination bar at all for single page */
  if (totalPages <= 1) return null;

  /* simple prev/next only for 2 pages */
  if (totalPages === 2) {
    return (
      <div className="pagination-bar">
        <div className="pagination pagination-simple">
          <button className="page-btn" onClick={() => onPageChange(1)} disabled={currentPage === 1}>← Prev</button>
          <span className="page-indicator-inline">{currentPage} of {totalPages}</span>
          <button className="page-btn" onClick={() => onPageChange(2)} disabled={currentPage === 2}>Next →</button>
        </div>
      </div>
    )
  }

  /* full pagination for 3+ pages */
  return (
    <div className="pagination-bar">
      <div className="pagination">
        {/* prev button. disabled on first page */}
        <button
          className="page-btn"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          ← Prev
        </button>

        <div className="page-numbers">
          {/* render each page number, dot, or empty placeholder */}
          {getPageNumbers().map((page, i) =>
            page === null ? (
              // invisible placeholder keeps pagination width consistent
              <span key={`empty-${i}`} className="page-placeholder" />
            ) : page === '...' ? (
              <span key={`dots-${i}`} className="page-dots">...</span>
            ) : (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* next button. disabled on last page */}
        <button
          className="page-btn"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>
      <div className="page-jump">
        <span>Go to page:</span>
        <input type="number" min="1" max={totalPages} value={jumpValue} onChange={e => setJumpValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJump()} />
        <button className="page-btn" onClick={handleJump}>Go</button>
      </div>
    </div>
  )
}

// individual deck tile with fanned cards and hover popup
function DeckTile({ deck }) {
  const [hovered, setHovered] = useState(false);
  const [popupLeft, setPopupLeft] = useState(false);
  const [popupAbove, setPopupAbove] = useState(false);
  const tileRef = useRef(null);
  const isComplete = deck.cardCount === deck.totalCards;
  //const fanColors = ['#9370DB', '#7B52AB', '#6A3D9A'];

  const handleMouseEnter = () => {
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect();
      setPopupLeft(rect.right > window.innerWidth / 2);
      // if tile is in the bottom half of the screen, show popup above instead
      setPopupAbove(rect.bottom > window.innerHeight / 2);
    }
    setHovered(true);
  };

  return (
    <Link href={`/decks/${deck.id}`} className="deck-tile-link">
      <div
        ref={tileRef}
        className={`deck-tile ${hovered ? 'hovered' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
      >
        {/* fanned card visuals */}
        <div className="deck-fan">
          <div className="fan-card fan-left">
            <img src={deck.fanCards[1]} alt={{ backgroundColor: PLACEHOLDER_FAN[0] }} />
          </div>
          <div className="fan-card fan-middle">
            <img src={deck.fanCards[0]} alt={{ backgroundColor: fanColors[1] }} />
          </div>
          <div className="fan-card fan-right">
            <img src={deck.fanCards[2]} alt={{ backgroundColor: fanColors[2] }} />
          </div>
        </div>

        {/* deck info below the fan */}
        <div className="deck-info">
          <span className="deck-name">{deck.name}</span>
          <span className="deck-count">{deck.cardCount}/{deck.totalCards} cards</span>
          <span className={`deck-status ${isComplete ? 'complete' : 'incomplete'}`}>
            {isComplete ? '✅ Complete' : '⚠️ Incomplete'}
          </span>
        </div>

        {/* hover popup - flips left if near right edge */}
        {hovered && (
          <div className={`deck-popup ${popupLeft ? 'popup-left' : ''} ${popupAbove ? 'popup-above' : ''}`}>          <strong>{deck.name}</strong>
            <hr className="popup-divider" />
            {isComplete ? (
              <p className="popup-complete">Deck is complete!</p>
            ) : (
              <>
                <p className="popup-missing-title">Contains:</p>
                {/* shows up to 5 missing cards, then "and X more" */}
                <ul className="popup-missing-list">
                  {deck.missing.slice(0, 5).map((card, i) => (
                    <li key={i}>{card}</li>
                  ))}
                  {deck.missing.length > 5 && (
                    <li className="popup-more">...and {deck.missing.length - 5} more</li>
                  )}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default function DeckGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  // holds fetched decks from supabase
  const [decks, setDecks] = useState([]);
  // tracks loading state
  const [loading, setLoading] = useState(true);
  // tracks fetch errors
  const [error, setError] = useState(null);

  const totalPages = Math.ceil(decks.length / DECKS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * DECKS_PER_PAGE;
  const visibleDecks = decks.slice(startIndex, startIndex + DECKS_PER_PAGE);

  useEffect(() => {
    async function fetchDecks() {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseSafely();
      if (!supabase) {
        setDecks([]);
        setLoading(false);
        return;
      }

      try {
        // get current logged in user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setDecks([]);
          setLoading(false);
          return;
        }

        // fetch all decks for this user
        const { data: deckData, error: deckError } = await supabase
          .from('decks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (deckError) throw deckError;

        // for each deck, fetch card counts and missing cards
        const decksWithCounts = await Promise.all(
          deckData.map(async (deck) => {
            // count total cards in this deck
            const { data: deckCards, error: cardsError } = await supabase
              .from('deck_cards')
              .select('card_id, quantity')
              .eq('deck_id', deck.deck_id);

            if (cardsError) throw cardsError;

            // sum up quantities
            const cardCount = deckCards.reduce((sum, row) => sum + (row.quantity || 0), 0);
            const totalCards = 60;

            // fetch user's inventory
            const { data: inventoryData } = await supabase
              .from('inventory')
              .select('card_id, quantity')
              .eq('user_id', user.id);

            // build owned cards map
            const owned = {};
            (inventoryData || []).forEach(row => {
              owned[row.card_id] = row.quantity;
            });

            // find missing cards
            const missing = [];
            for (const deckCard of deckCards) {
              const ownedQty = owned[deckCard.card_id] || 0;
              const needed = deckCard.quantity - ownedQty;
              if (needed > 0) {
                const { data: cardData } = await supabase
                  .from('cards')
                  .select('name')
                  .eq('card_id', deckCard.card_id)
                  .single();
                if (cardData) missing.push(`${cardData.name} x${needed}`);
              }
            }

            // get fan card images from first 3 cards
            const fanCardIds = deckCards.slice(0, 3).map(c => c.card_id);
            const fanCards = await Promise.all(
              fanCardIds.map(async (cardId) => {
                const { data: cardData } = await supabase
                  .from('cards')
                  .select('name')
                  .eq('card_id', cardId)
                  .single();
                return cardData ? SF(cardData.name) : PLACEHOLDER_FAN[0];
              })
            );

            // pad to 3 if fewer cards
            while (fanCards.length < 3) fanCards.push(PLACEHOLDER_FAN[fanCards.length]);

            return {
              id: deck.deck_id,
              name: deck.name,
              cardCount,
              totalCards,
              missing,
              fanCards,
            };
          })
        );

        setDecks(decksWithCounts);
      } catch (err) {
        console.error('Error fetching decks:', err);
        setError('Failed to load decks. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchDecks();
  }, []);

  // loading state
  if (loading) {
    return (
      <div className="deckgrid-wrapper">
        <div className="deck-empty">
          <p>Loading your decks...</p>
        </div>
      </div>
    );
  }

  // error state
  if (error) {
    return (
      <div className="deckgrid-wrapper">
        <div className="deck-empty">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="deckgrid-wrapper">
      {/* top bar with page indicator and new deck button */}
      <div className="deckgrid-topbar">
        {totalPages > 1 && (
          <div className="page-indicator">Page {currentPage} of {totalPages}</div>
        )}
        <NewDeckButton />
      </div>

      {/* empty state when user has no decks or isn't logged in */}
      {decks.length === 0 ? (
        <div className="deck-empty">
          <p>You don't have any decks yet!</p>
        </div>
      ) : (
        <>
          <PaginationBar currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          <div className="deck-grid">
            {visibleDecks.map(deck => (
              <DeckTile key={deck.id} deck={deck} />
            ))}
          </div>
          <PaginationBar currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  )
}