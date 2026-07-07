import { useEffect, useRef, useState } from "react";

const CONTEXTS = {
  default: { size: 8, label: null },
  link: { size: 8, label: null, ring: true },
  button: { size: 8, label: null, ring: true },
  text: { size: 2, label: null, tall: true }, // thin caret over readable text
  image: { size: 44, label: "View" },
  drag: { size: 44, label: "Drag" },
};

function detectContext(el) {
  if (!el) return "default";
  if (el.closest("[data-cursor='drag']")) return "drag";
  if (el.closest("img, [data-cursor='image']")) return "image";
  if (el.closest("a, button, [role='button'], input, textarea, select")) return "link";
  if (el.closest("p, h1, h2, h3, span, li")) return "text";
  return "default";
}

export default function CustomCursor() {
  const dotRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const eased = useRef({ x: -100, y: -100 });
  const raf = useRef(null);
  const [context, setContext] = useState("default");
  const [clicked, setClicked] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Skip entirely on touch devices — a custom cursor there is pure noise
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch) return;

    document.documentElement.style.cursor = "none";
    const dot = dotRef.current;

    const lerp = (a, b, t) => a + (b - a) * t;
    const loop = () => {
      const t = reduceMotion ? 1 : 0.22;
      eased.current.x = lerp(eased.current.x, pos.current.x, t);
      eased.current.y = lerp(eased.current.y, pos.current.y, t);
      if (dot) dot.style.transform = `translate(${eased.current.x}px, ${eased.current.y}px)`;
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    const onMove = e => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
      setContext(detectContext(e.target));
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      cancelAnimationFrame(raf.current);
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [visible]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches)
    return null;

  const cfg = CONTEXTS[context] || CONTEXTS.default;
  const scale = clicked ? 0.82 : 1;

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0, willChange: "transform" }}
      aria-hidden="true"
    >
      <div
        className="flex items-center justify-center rounded-full transition-[width,height,background,border] duration-200 ease-out"
        style={{
          width: cfg.tall ? 2 : cfg.size,
          height: cfg.tall ? 20 : cfg.size,
          borderRadius: cfg.tall ? "2px" : "9999px",
          background: cfg.label ? "var(--background)" : "var(--signal)",
          border: cfg.ring || cfg.label ? `1px solid var(--signal)` : "none",
          transform: `scale(${scale})`,
        }}
      >
        {cfg.label && (
          <span
            className="mono-label text-[9px] uppercase tracking-wider"
            style={{ color: "var(--signal)" }}
          >
            {cfg.label}
          </span>
        )}
      </div>
    </div>
  );
}
