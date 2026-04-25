"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Menu from "./InventoryMenu";
import "./CardGrid.css";


function PaginationBar({ currentPage, totalPages, onPageChange }) {
  const [jumpValue, setJumpValue] = useState("");

  const handleJump = () => {
    const num = parseInt(jumpValue, 10);

    if (num >= 1 && num <= totalPages) {
      onPageChange(num);
      setJumpValue("");
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
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

        <div className="page-numbers">
          {getPageNumbers().map((page, i) =>
            page === "..." ? (
              <span key={`dots-${i}`} className="page-dots">
                ...
              </span>
            ) : (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ),
          )}
        </div>

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
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJump()}
        />
        <button className="page-btn" onClick={handleJump}>
          Go
        </button>
      </div>
    </div>
  );
}

export default function InventoryCardGrid({ initialCards = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCards, setFilteredCards] = useState(initialCards);

  useEffect(() => {
    const handleFocus = () => window.location.reload();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const CARDS_PER_PAGE = 81;
  const themeTextColor = "var(--foreground)";
  const themeBackgroundColor = "var(--background)";

  const visibleCards = useMemo(() => {
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    return filteredCards.slice(startIndex, startIndex + CARDS_PER_PAGE);
  }, [filteredCards, currentPage]);

  const TOTAL_PAGES = Math.max(
    1,
    Math.ceil(filteredCards.length / CARDS_PER_PAGE),
  );

  return (
    <div
      className="cardgrid-wrapper"
      style={{
        backgroundColor: themeBackgroundColor,
        color: themeTextColor,
      }}
    >
      <div className="cardgrid-topbar">
        <div className="page-indicator-top">
          Page {currentPage} of {TOTAL_PAGES}
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={TOTAL_PAGES}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="main-layout">
        <div className="sidebar-area">
          <Menu
            inventoryCards={initialCards}
            setCards={setFilteredCards}
            setCurrentPage={setCurrentPage}
          />
        </div>

        <div className="content-area">
          <div className="card-grid">
            {filteredCards.length > 0
              ? visibleCards.map((card, index) => {
                  const image =
                    card.image_uris?.small ||
                    card.image_uris?.normal ||
                    card.card_faces?.[0]?.image_uris?.small ||
                    card.card_faces?.[0]?.image_uris?.normal ||
                    "";

                  return (
                    <Link
                      key={`${card.id}-${card.quantity}-${index}`}
                      href={`/CardInfo/${card.id}`}
                    >
                      <div
                        className="card"
                        style={{
                          backgroundColor: "var(--background)",
                          color: themeTextColor,
                          borderRadius: "12px",
                        }}
                      >
                        <picture>
                          <source media="(max-width: 800px)" srcSet={image} />
                          <img src={image} alt={card.name ?? "Card"} />
                        </picture>

                        <div
                          style={{
                            padding: "8px 6px 0 6px",
                            color: themeTextColor,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: 600,
                              marginBottom: "4px",
                              color: themeTextColor,
                            }}
                          >
                            {card.name}
                          </div>

                          <div
                            style={{
                              fontSize: "0.9rem",
                              opacity: 0.9,
                              color: themeTextColor,
                            }}
                          >
                            Quantity: {card.quantity}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              : initialCards.length === 0
              ? <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem',
                color: '#71179C',
                fontWeight: 'bold',
                fontSize: '1.2rem',
              }}>
                No cards in inventory!
              </div>
              : null
            }
          </div>
        </div>
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPageChange={setCurrentPage}
      />

      <div className="page-indicator-bottom">
        Page {currentPage} of {TOTAL_PAGES}
      </div>
    </div>
  );
}
