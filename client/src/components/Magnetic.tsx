import { cloneElement, isValidElement, ReactElement, useRef } from "react";

const MAX_SHIFT = 10;

interface MagneticChildProps {
  onMouseMove?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
}

/**
 * Wraps a single interactive child (button/link) and nudges it toward the
 * cursor on hover, within a small cap. Disabled on touch/coarse pointers
 * and when the user prefers reduced motion.
 */
export function Magnetic({ children }: { children: ReactElement<MagneticChildProps> }) {
  const ref = useRef<HTMLElement>(null);
  const enabled =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!enabled || !isValidElement(children)) return children;

  function handleMove(e: React.MouseEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    el.style.setProperty("--btn-shift-x", `${x * MAX_SHIFT}px`);
    el.style.setProperty("--btn-shift-y", `${y * MAX_SHIFT}px`);
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--btn-shift-x", "0px");
    el.style.setProperty("--btn-shift-y", "0px");
  }

  return cloneElement(children, {
    ref,
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
      handleMove(e);
      children.props.onMouseMove?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      handleLeave();
      children.props.onMouseLeave?.(e);
    },
  } as Partial<MagneticChildProps> & { ref: typeof ref });
}
