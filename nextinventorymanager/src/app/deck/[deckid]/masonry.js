"use client";
import { useEffect, useRef } from "react";
import "./main.css";

export default function MasonryItem({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rowHeight = 10; // must match CSS grid-auto-rows
    const gap = 16;       // must match CSS gap

    function resize() {
      const contentEl = el.querySelector(".cardStackContent");
      if (!contentEl) return;

      const trigger = () => {
        const height = contentEl.getBoundingClientRect().height;
        const rowSpan = Math.ceil((height + gap) / (rowHeight + gap));
        el.style.gridRowEnd = `span ${rowSpan}`;
      };

      const images = contentEl.querySelectorAll("img");
      let hasAsyncImages = false;

      images.forEach((img) => {
        if (!img.complete) {
          hasAsyncImages = true;
          img.onload = trigger;
        }
      });

      // always run once immediately
      trigger();

      // fallback if no images are pending
      if (!hasAsyncImages) trigger();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(el);

    window.addEventListener("load", resize);

    // initial run
    resize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("load", resize);
    };
  }, []);

  return (
    <div ref={ref} className="cardStackItem">
      <div className="cardStackContent">
        {children}
      </div>
    </div>
  );
}