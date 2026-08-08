import { useEffect, useRef } from "react";

const HOVER_SELECTOR = 'a, button, .btn, [role="button"], input, textarea, select, label';

/**
 * Premium custom cursor for desktop pointer devices. No-ops on touch/coarse
 * pointers and when the user prefers reduced motion — the OS cursor is used
 * as-is in those cases.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canRun =
      window.matchMedia("(pointer: fine)").matches &&
      window.matchMedia("(min-width: 1024px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canRun) return;

    document.documentElement.classList.add("has-custom-cursor");
    const el = dotRef.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      el!.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(${
        el!.classList.contains("is-hovering") ? 1.9 : 1
      })`;
    }

    function onOver(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest(HOVER_SELECTOR)) {
        el!.classList.add("is-hovering");
      }
      const onDark = target?.closest(".final-cta, .editorial-panel, .site-footer");
      el!.classList.toggle("on-dark", !!onDark);
    }

    function onOut(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest(HOVER_SELECTOR)) {
        el!.classList.remove("is-hovering");
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout", onOut, { passive: true });

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
    };
  }, []);

  return <div ref={dotRef} className="custom-cursor" aria-hidden="true" />;
}
