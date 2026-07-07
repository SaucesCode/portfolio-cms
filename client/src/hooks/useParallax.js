import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";

/**
 * Ties an element's vertical position to its own scroll progress through
 * the viewport, creating a parallax drift.
 *
 * Usage: attach both `ref` and `style` to the SAME element that already
 * has its positioning (absolute/relative) — don't wrap it in a new div,
 * since a transformed wrapper becomes a new containing block and can
 * silently break existing `absolute` children.
 *
 *   const glow = useParallax(0.2);
 *   <motion.div ref={glow.ref} style={glow.style} className="absolute ..." />
 *
 * @param {number} speed - 0.1–0.3 is subtle, higher drifts more.
 */
export function useParallax(speed = 0.2) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);

  return { ref, style: { y } };
}
