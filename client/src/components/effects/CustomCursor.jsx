// client/src/components/effects/CustomCursor.jsx
import { useEffect, useRef, useState } from "react";

function detectContext(el) {
  if (!el) return "default";
  if (el.closest("[data-cursor='drag']")) return "drag";
  if (el.closest("img, [data-cursor='image']")) return "image";
  if (el.closest("a, button, [role='button'], input, textarea, select")) return "link";
  if (el.closest("p, h1, h2, h3, span, li")) return "text";
  return "default";
}

const LABELS = {
  link: "SELECT",
  image: "VIEW",
  drag: "DRAG",
};

export default function CustomCursor() {
  const wrapRef = useRef(null);
  const labelRef = useRef(null);
  const [context, setContext] = useState("default");
  const [clicked, setClicked] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    document.documentElement.style.cursor = "none";

    // Direct, unthrottled DOM writes on every mousemove — zero easing,
    // zero lag. The cursor's position is never a frame behind the pointer.
    const onMove = e => {
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
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
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [visible]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches)
    return null;

  const isInteractive = context === "link" || context === "drag";
  const isImage = context === "image";
  const isText = context === "text";
  const isFramed = isInteractive || isImage;

  const frameSize = isImage ? 60 : isInteractive ? 46 : 22;
  const bracketLen = isFramed ? 9 : 6;
  const strokeColor = isFramed ? "var(--signal)" : "var(--foreground)";
  const label = LABELS[context];

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] transition-opacity duration-150"
      style={{ opacity: visible ? 1 : 0, willChange: "transform" }}
      aria-hidden="true"
    >
      {isText ? (
        // Thin caret over readable text — matches the site's underline/rule aesthetic
        <div
          className="-translate-x-1/2 -translate-y-1/2"
          style={{
            width: 1.5,
            height: 20,
            background: "var(--signal)",
          }}
        />
      ) : (
        <div
          className="-translate-x-1/2 -translate-y-1/2 relative transition-[width,height] duration-200 ease-out"
          style={{
            width: frameSize,
            height: frameSize,
            transform: `translate(-50%, -50%) scale(${clicked ? 0.88 : 1})`,
          }}
        >
          {/* Four corner brackets — same offset-frame motif as the Hero/Project photo plates */}
          {[
            { top: 0, left: 0, borderWidth: "1.5px 0 0 1.5px" },
            { top: 0, right: 0, borderWidth: "1.5px 1.5px 0 0" },
            { bottom: 0, left: 0, borderWidth: "0 0 1.5px 1.5px" },
            { bottom: 0, right: 0, borderWidth: "0 1.5px 1.5px 0" },
          ].map((pos, i) => (
            <span
              key={i}
              className="absolute transition-[border-color] duration-200"
              style={{
                ...pos,
                width: bracketLen,
                height: bracketLen,
                borderStyle: "solid",
                borderColor: strokeColor,
              }}
            />
          ))}

          {/* Center dot — hidden once the frame takes over on interactive elements */}
          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[opacity,background] duration-150"
            style={{
              width: 3,
              height: 3,
              background: strokeColor,
              opacity: isFramed ? 0 : 1,
            }}
          />

          {/* Mono-label tag, bottom-right — same style as your "fig. 01" caption */}
          {label && (
            <span
              ref={labelRef}
              className="absolute whitespace-nowrap font-mono text-[9px] font-semibold uppercase tracking-[0.15em] transition-opacity duration-150"
              style={{
                top: frameSize + 6,
                left: frameSize / 2,
                transform: "translateX(-50%)",
                color: "var(--signal)",
              }}
            >
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
