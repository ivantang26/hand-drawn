"use client";

import { useEffect } from "react";

/**
 * Site-wide motion wiring:
 * - hand-drawn marks ([data-draw]) draw themselves once they scroll into view;
 * - the hero blob's SMIL morph ([data-morph]) is paused when the visitor prefers reduced motion.
 * CSS handles the reduced-motion case for the marks (they render fully drawn).
 */
export function MotionManager() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-drawn");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    const syncMorph = () => {
      document.querySelectorAll<SVGSVGElement>("svg[data-morph]").forEach((svg) => {
        if (reduce.matches) {
          svg.pauseAnimations();
          svg.setCurrentTime(0);
        } else {
          svg.unpauseAnimations();
        }
      });
    };

    const scan = () => {
      document.querySelectorAll("[data-draw]:not(.is-drawn)").forEach((el) => io.observe(el));
      syncMorph();
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    reduce.addEventListener("change", syncMorph);
    return () => {
      io.disconnect();
      mo.disconnect();
      reduce.removeEventListener("change", syncMorph);
    };
  }, []);

  return null;
}
