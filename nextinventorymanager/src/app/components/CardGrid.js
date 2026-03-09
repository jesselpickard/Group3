import { useState } from 'react';
import './CardGrid.css';

// placeholder colors, one per page. cycles if there are more pages than colors
const colors = [
  '#FF4444', '#FF8C00', '#FFD700', '#4CAF50',
  '#2196F3', '#4B0082', '#8F00FF', '#FF69B4',
  '#00CED1', '#FF6347', '#32CD32', '#9370DB',
  '#FF1493', '#00BFFF', '#FF8C69', '#98FB98',
  '#DDA0DD', '#F0E68C', '#87CEEB', '#FFA07A',
];

// total number of pages
const TOTAL_PAGES = 20;

// pagination bar component. at the top and bottom of the grid
function PaginationBar({ currentPage, totalPages, onPageChange }) {
  // tracks the value typed into the "go to page" input
  const [jumpValue, setJumpValue] = useState('');

  // jumps to the typed page number if it is valid, then clears the input
  const handleJump = () => {
    const num = parseInt(jumpValue);
    if (num >= 1 && num <= totalPages) {
      onPageChange(num);
      setJumpValue('');
    }
  };

  // always returns exactly 7 slots, using null for empty placeholders
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: 7 }, (_, i) => i < totalPages ? i + 1 : null);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  {getPageNumbers().map((page, i) =>
    page === null ? (
      /* invisible placeholder keeps width consistent */
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

        {/* render each page number or dots */}
        {getPageNumbers().map((page, i) =>
          page === '...' ? (
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

        {/* next button. disabled on last page */}
        <button
          className="page-btn"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>

      {/* manual page jump input. also triggers on Enter key */}
      <div className="page-jump">
        <span>Go to page:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={jumpValue}
          onChange={e => setJumpValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleJump()}
        />
        <button className="page-btn" onClick={handleJump}>Go</button>
      </div>
    </div>
  )
}

export default function CardGrid() {
  // tracks which page the user is currently on
  const [currentPage, setCurrentPage] = useState(1);
  // picks a color based on the current page, cycling through the colors array
  const currentColor = colors[(currentPage - 1) % colors.length];

  return (
    <div className="cardgrid-wrapper">
      {/* top bar with page indicator on the left and pagination on the right */}
      <div className="cardgrid-topbar">
        <div className="page-indicator">Page {currentPage} of {TOTAL_PAGES}</div>
        <PaginationBar currentPage={currentPage} totalPages={TOTAL_PAGES} onPageChange={setCurrentPage} />
      </div>

      <div className="main-layout">
        {/* LEFT SIDEBAR */}
        <div className="sidebar-area">
          <Menu />
        </div>
        {/* MAIN CONTENT */}          
        <div className="content-area">
          {/* 81 placeholder card rectangles in the current page color */}
          <div className="card-grid">
            {Array.from({ length: 81 }).map((_, i) => (
              <div
                key={i}
                className="card-placeholder"
                style={{ backgroundColor: currentColor }}
              />
            ))}
          </div>
        </div>
      </div>


      {/* duplicate pagination bar at the bottom for convenience */}
      <PaginationBar currentPage={currentPage} totalPages={TOTAL_PAGES} onPageChange={setCurrentPage} />
    </div>
  )
}