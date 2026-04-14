"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Menu from "./CollapsibleMenu";
import "./CardGrid.css";

const colors = [
  "#FF4444",
  "#FF8C00",
  "#FFD700",
  "#4CAF50",
  "#2196F3",
  "#4B0082",
  "#8F00FF",
  "#FF69B4",
  "#00CED1",
  "#FF6347",
  "#32CD32",
  "#9370DB",
  "#FF1493",
  "#00BFFF",
  "#FF8C69",
  "#98FB98",
  "#DDA0DD",
  "#F0E68C",
  "#87CEEB",
  "#FFA07A",
];

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
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
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
            )
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
  // The inventory page always starts with the cards already loaded from the user's inventory table.
  const [currentPage, setCurrentPage] = useState(1);

  const CARDS_PER_PAGE = 81;
  const currentColor = colors[(currentPage - 1) % colors.length];

  // Paginate the inventory cards while keeping the same grid behavior as the search page.
  const visibleCards = useMemo(() => {
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    return initialCards.slice(startIndex, startIndex + CARDS_PER_PAGE);
  }, [initialCards, currentPage]);

  const TOTAL_PAGES = Math.max(1, Math.ceil(initialCards.length / CARDS_PER_PAGE));

  return (
    <div
      className="cardgrid-wrapper"
      style={{
        backgroundColor: "var(--inventory-page-bg, transparent)",
        color: "var(--inventory-text, inherit)",
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
          {/* Keep the same collapsible sidebar area and component as the search page. */}
          <Menu setCards={() => {}} setCurrentPage={setCurrentPage} />
        </div>

        <div className="content-area">
          <div className="card-grid">
            {initialCards.length > 0 ? (
              visibleCards.map((card, index) => {
                // Support both standard cards and double-faced cards.
                const smallImage =
                  card.image_uris?.small ||
                  card.card_faces?.[0]?.image_uris?.small ||
                  "";
                const normalImage =
                  card.image_uris?.normal ||
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
                        backgroundColor: "var(--inventory-card-bg, rgba(255, 255, 255, 0.04))",
                        color: "var(--inventory-text, inherit)",
                        borderRadius: "12px",
                      }}
                    >
                      <picture>
                        <source media="(max-width: 800px)" srcSet={normalImage} />
                        <img src={smallImage} alt={card.name ?? "Card"} />
                      </picture>

                      <div
                        style={{
                          padding: "8px 6px 0 6px",
                          color: "var(--inventory-text, inherit)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            marginBottom: "4px",
                          }}
                        >
                          {card.name}
                        </div>

                        <div
                          style={{
                            fontSize: "0.9rem",
                            opacity: 0.9,
                          }}
                        >
                          Quantity: {card.quantity}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              Array.from({ length: CARDS_PER_PAGE }).map((_, i) => (
                <div
                  key={i}
                  className="card-placeholder"
                  style={{ backgroundColor: currentColor }}
                />
              ))
            )}
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