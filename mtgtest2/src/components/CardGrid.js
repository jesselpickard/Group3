import { useState } from 'react';
import './CardGrid.css';

const colors = [
  '#FF4444', '#FF8C00', '#FFD700', '#4CAF50',
  '#2196F3', '#4B0082', '#8F00FF', '#FF69B4',
  '#00CED1', '#FF6347', '#32CD32', '#9370DB',
  '#FF1493', '#00BFFF', '#FF8C69', '#98FB98',
  '#DDA0DD', '#F0E68C', '#87CEEB', '#FFA07A',
];

const TOTAL_PAGES = 20;

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
    const pages = [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    pages.push(1);
    if (currentPage > 4) pages.push('...');
    for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 3) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="pagination-bar">
      <div className="pagination">
        <button
          className="page-btn"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          ← Prev
        </button>

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
  const [currentPage, setCurrentPage] = useState(1);
  const currentColor = colors[(currentPage - 1) % colors.length];

  return (
    <div className="cardgrid-wrapper">
      <div className="cardgrid-topbar">
        <div className="page-indicator">Page {currentPage} of {TOTAL_PAGES}</div>
        <PaginationBar currentPage={currentPage} totalPages={TOTAL_PAGES} onPageChange={setCurrentPage} />
      </div>

      <div className="card-grid">
        {Array.from({ length: 81 }).map((_, i) => (
          <div
            key={i}
            className="card-placeholder"
            style={{ backgroundColor: currentColor }}
          />
        ))}
      </div>

      <PaginationBar currentPage={currentPage} totalPages={TOTAL_PAGES} onPageChange={setCurrentPage} />
    </div>
  )
}