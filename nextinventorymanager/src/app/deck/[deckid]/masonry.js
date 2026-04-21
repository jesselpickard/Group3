"use client";
import { useEffect, useRef } from "react";

export default function MasonryItem({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rowHeight = 10; // must match CSS
    const gap = 16;       // must match CSS

    const resizeObserver = new ResizeObserver(() => {
      const height = el.getBoundingClientRect().height;
      const rowSpan = Math.ceil((height + gap) / (rowHeight + gap));
      el.style.gridRowEnd = `span ${rowSpan}`;
    });

    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={ref} className="cardStackItem">
      {children}
    </div>
  );
}