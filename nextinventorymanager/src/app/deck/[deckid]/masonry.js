"use client";
import { useEffect, useRef } from "react";

export default function MasonryItem({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      const grid = el.parentElement;

      const rowHeight = parseFloat(
        getComputedStyle(grid).getPropertyValue("grid-auto-rows")
      );

      const gap = parseFloat(
        getComputedStyle(grid).getPropertyValue("row-gap")
      );

      const height = el.getBoundingClientRect().height;

      const rowSpan = Math.ceil((height + gap) / (rowHeight + gap));

      el.style.gridRowEnd = `span ${rowSpan}`;
    });

    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, []);
}