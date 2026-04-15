// src/app/components/InventoryCardGrid.js
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
                className={`page-btn ${page === currentPage ? "active" : ""}`}
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

function mergeInventoryData(searchCard, inventoryCard) {
  return {
    ...searchCard,
    quantity: inventoryCard.quantity ?? 1,
    inventory_created_at: inventoryCard.inventory_created_at,
    inventory_updated_at: inventoryCard.inventory_updated_at,
  };
}

export default function InventoryCardGrid({ initialCards = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedCards, setDisplayedCards] = useState(initialCards);
  const [hasSearched, setHasSearched] = useState(false);

  const CARDS_PER_PAGE = 81;
  const currentColor = colors[(currentPage - 1) % colors.length];

  useEffect(() => {
    setDisplayedCards(initialCards);
  }, [initialCards]);

  const inventoryCardMap = useMemo(() => {
    return new Map(initialCards.map((card) => [card.id, card]));
  }, [initialCards]);

  const handleInventorySearchResults = useCallback(
    (searchResults = []) => {
      const inventoryOnlyResults = searchResults
        .filter((card) => inventoryCardMap.has(card.id))
        .map((card) => mergeInventoryData(card, inventoryCardMap.get(card.id)));

      setDisplayedCards(inventoryOnlyResults);
      setHasSearched(true);
      setCurrentPage(1);
    },
    [inventoryCardMap]
  );

  const visibleCards = useMemo(() => {
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    return displayedCards.slice(startIndex, startIndex + CARDS_PER_PAGE);
  }, [displayedCards, currentPage]);

  const totalPages = Math.max(1, Math.ceil(displayedCards.length / CARDS_PER_PAGE));

  return (
    <div className="pageContainer">
      <div className="headerBar">
        <div className="page-indicator-top">
          Page {currentPage} of {totalPages}
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="pageBody">
        <div className="sidebar">
          <Menu setCards={handleInventorySearchResults} setCurrentPage={setCurrentPage} />
        </div>

        <div className="card-grid">
          {displayedCards.length > 0 ? (
            visibleCards.map((card, index) => {
              const smallImage =
                card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small || "";
              const normalImage =
                card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || "";

              return (
                <div key={`${card.id}-${index}`} className="card">
                  <Link href={`/CardInfo/${card.id}`}>
                    {smallImage || normalImage ? (
                      <img src={smallImage || normalImage} alt={card.name} />
                    ) : (
                      <div
                        className="card-placeholder"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                    )}
                  </Link>

                  <p style={{ color: "inherit" }}>{card.name}</p>
                  <p style={{ color: "inherit" }}>Quantity: {card.quantity}</p>
                </div>
              );
            })
          ) : hasSearched || initialCards.length === 0 ? (
            <p style={{ color: "inherit", fontWeight: 700 }}>
              no card found in your inventory
            </p>
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

      <div className="footerBar">
        <div className="page-indicator-bottom">
          Page {currentPage} of {totalPages}
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}