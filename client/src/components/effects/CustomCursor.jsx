import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const trailRef = useRef(null);
  const posRef = useRef({ x: -100, y: -100 });
  const trailPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);
  const [clicked, setClicked] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;

    // Smooth trail via lerp in rAF loop
    const lerp = (a, b, t) => a + (b - a) * t;

    const loop = () => {
      trailPos.current.x = lerp(trailPos.current.x, posRef.current.x, 0.1);
      trailPos.current.y = lerp(trailPos.current.y, posRef.current.y, 0.1);

      cursor.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      trail.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px)`;

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onMove = e => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = e => {
      if (e.target.closest('a, button, [role="button"], input, textarea, select, label')) {
        setHovering(true);
      }
    };

    const onOut = e => {
      if (e.target.closest('a, button, [role="button"], input, textarea, select, label')) {
        setHovering(false);
      }
    };

    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    // Hide default cursor globally
    document.documentElement.style.cursor = "none";

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.style.cursor = "";
    };
  }, []);

  return (
    <>
      {/* ── Main cursor dot ─────────────────────────────────── */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: "transform" }}
      >
        {/* Outer ring — expands on hover */}
        <span
          className="absolute rounded-full border border-blue-500/60 transition-all duration-200"
          style={{
            inset: hovering ? "-14px" : "-8px",
            opacity: hovering ? 0.6 : 0,
          }}
        />

        {/* Core dot — morphs on hover/click */}
        <span
          className="block rounded-full bg-blue-500 transition-all duration-150"
          style={{
            width: clicked ? 6 : hovering ? 10 : 8,
            height: clicked ? 6 : hovering ? 10 : 8,
            opacity: 1,
            transform: `translate(-50%, -50%) scale(${clicked ? 0.7 : 1})`,
            boxShadow: hovering
              ? "0 0 12px 4px rgba(59,130,246,0.45)"
              : "0 0 6px 2px rgba(59,130,246,0.35)",
          }}
        />
      </div>

      {/* ── Trailing blob ───────────────────────────────────── */}
      <div
        ref={trailRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: "transform" }}
      >
        <span
          className="block rounded-full transition-all duration-200"
          style={{
            width: hovering ? 44 : 28,
            height: hovering ? 44 : 28,
            transform: `translate(-50%, -50%)`,
            background: hovering
              ? "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
            border: `1px solid rgba(59,130,246,${hovering ? 0.25 : 0.15})`,
          }}
        />
      </div>
    </>
  );
}
