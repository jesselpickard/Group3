"use client";
import { useState, useRef } from 'react';
import './DeckGrid.css';

// placeholder decks for testing. will be replaced with real data later
const placeholderDecks = [
  { id: 1, name: "Red Aggro", cardCount: 58, totalCards: 60, missing: ["Lightning Bolt x2"] },
  { id: 2, name: "Blue Control", cardCount: 60, totalCards: 60, missing: [] },
  { id: 3, name: "Green Ramp", cardCount: 45, totalCards: 60, missing: ["Forest x8", "Llanowar Elves x4", "Cultivate x3"] },
  { id: 4, name: "Black Midrange", cardCount: 60, totalCards: 60, missing: [] },
  { id: 5, name: "Angel Ascent", cardCount: 55, totalCards: 60, missing: ["Plains x3", "Serra Angel x2"] },  { id: 6, name: "Izzet Phoenix", cardCount: 60, totalCards: 60, missing: [] },
  { id: 7, name: "Golgari Midrange", cardCount: 38, totalCards: 60, missing: ["Thoughtseize x4", "Grim Flayer x4", "Liliana x2", "Overgrown Tomb x4" ] },
  { id: 8, name: "Azorius Spirits", cardCount: 60, totalCards: 60, missing: [] },
  { id: 9, name: "Temur Cascade", cardCount: 23, totalCards: 60, missing: ["Shardless Agent x4", "Bloodbraid Elf x4", "Violent Outburst x4", "Crashing Footfalls x4", "Force of Negation x3", "Rhinos Token x4", "Ketria Triome x3", "Spirebluff Canal x2", "Steam Vents x2"] },
];

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
  const fanColors = ['#9370DB', '#7B52AB', '#6A3D9A'];

  const handleMouseEnter = () => {
    // checks if tile is in the right half of the screen
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect();
      setPopupLeft(rect.right > window.innerWidth / 2);
    }
    if (tileRef.current) {
      const rect = tileRef.current.getBoundingClientRect();
      setPopupLeft(rect.right > window.innerWidth / 2);
      // ADD: if tile is in the bottom half of the screen, show popup above instead
      setPopupAbove(rect.bottom > window.innerHeight / 2);
    }
    setHovered(true);
  };

  return (
    <div
      ref={tileRef}
      className={`deck-tile ${hovered ? 'hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      {/* fanned card visuals */}
      <div className="deck-fan">
        <div className="fan-card fan-left" style={{ backgroundColor: fanColors[0] }} />
        <div className="fan-card fan-middle" style={{ backgroundColor: fanColors[1] }} />
        <div className="fan-card fan-right" style={{ backgroundColor: fanColors[2] }} />
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
              <p className="popup-missing-title">Missing cards:</p>
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
  )
}

// main deck grid component
export default function DeckGrid({ totalPages = 1, decks = null }) {
  const [currentPage, setCurrentPage] = useState(1);

  // uses placeholder decks if no real data is passed in
  const displayDecks = decks || placeholderDecks;

  return (
    <div className="deckgrid-wrapper">
      {/* top bar with page indicator and new deck button */}
      <div className="deckgrid-topbar">
        {/* only show page indicator if there are multiple pages */}
        {totalPages > 1 && (
          <div className="page-indicator">Page {currentPage} of {totalPages}</div>
        )}
        <button className="new-deck-btn">＋ New Deck</button>
      </div>

      {/* empty state when no decks exist */}
      {displayDecks.length === 0 ? (
        <div className="deck-empty">
          <p>You don't have any decks yet!</p>
          <button className="new-deck-btn">＋ Create your first deck</button>
        </div>
      ) : (
        <>
          {/* pagination at top */}
          <PaginationBar currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

          {/* responsive deck grid */}
          <div className="deck-grid">
            {displayDecks.map(deck => (
              <DeckTile key={deck.id} deck={deck} />
            ))}
          </div>

          {/* pagination at bottom */}
          <PaginationBar currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
    
  )
}