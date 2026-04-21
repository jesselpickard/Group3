"use client";
import { useEffect, useRef } from "react";

export default function MasonryItem({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rowHeight = 10; // must match CSS
    const gap = 16;       // must match CSS

    function resize() {
      const height = el.getBoundingClientRect().height;
      const rowSpan = Math.ceil((height + gap) / (rowHeight + gap));
      el.style.gridRowEnd = `span ${rowSpan}`;
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });

    resizeObserver.observe(el);

    window.addEventListener("load", resize);

    resize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("load", resize);
    };
  }, []);

  return (
    <div ref={ref} className="cardStackItem">
      {children}
    </div>
  );
}