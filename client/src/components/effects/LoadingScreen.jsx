import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHero } from "../../hooks/useHero";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ·—/";
const EASE = [0.22, 1, 0.36, 1];

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

export default function LoadingScreen({ dataReady, minDuration = 2700, onComplete }) {
  const { data: hero } = useHero();
  const name = (hero?.name || "James Patrick De Mesa").toUpperCase();
  const chars = name.split("");

  const [exiting, setExiting] = useState(false);
  const [settled, setSettled] = useState(false); // true once every char has locked in
  const [fontSize, setFontSize] = useState(64);

  const charRefs = useRef([]);
  const lockedRef = useRef([]);
  const lastTickRef = useRef([]);
  const timingRef = useRef([]); // { start, lockAt } per character, computed once
  const measureRef = useRef(null);
  const wrapperRef = useRef(null);
  const startRef = useRef(null);
  const reducedMotion = useRef(false);

  charRefs.current = [];

  // --- Per-character reveal timing, computed once on mount ---
  if (timingRef.current.length !== chars.length) {
    let cursor = 0;
    timingRef.current = chars.map(ch => {
      if (ch === " ") return { start: 0, lockAt: 0, isSpace: true };
      const start = 150 + cursor * 38 + Math.random() * 55;
      const lockAt = start + 380 + Math.random() * 320;
      cursor += 1;
      return { start, lockAt, isSpace: false };
    });
  }
  const allLockedAt = Math.max(...timingRef.current.map(t => t.lockAt));

  // --- Auto-fit font size so the name never wraps, at any length or viewport ---
  useLayoutEffect(() => {
    const REFERENCE_SIZE = 120;

    const measure = () => {
      if (!measureRef.current) return;
      const naturalWidth = measureRef.current.scrollWidth;
      const available = window.innerWidth * 0.86;
      const scale = Math.min(1, available / naturalWidth);
      const next = Math.max(16, Math.min(96, REFERENCE_SIZE * scale));
      setFontSize(next);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [name]);

  // --- Scramble loop ---
  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lockedRef.current = chars.map(() => false);
    lastTickRef.current = chars.map(() => 0);

    if (reducedMotion.current) {
      charRefs.current.forEach((el, i) => {
        if (!el) return;
        el.textContent = chars[i];
        el.style.color = "var(--foreground)";
      });
      setSettled(true);
      return;
    }

    let raf;
    startRef.current = performance.now();

    const tick = now => {
      const elapsed = now - startRef.current;
      let allDone = true;

      timingRef.current.forEach((timing, i) => {
        const el = charRefs.current[i];
        if (!el || timing.isSpace) return;

        if (lockedRef.current[i]) return;

        if (elapsed >= timing.lockAt) {
          el.textContent = chars[i];
          el.style.transition = "none";
          el.style.color = "var(--signal)";
          // Force a reflow so the next transition actually animates
          void el.offsetWidth;
          el.style.transition = "color 480ms cubic-bezier(0.22, 1, 0.36, 1)";
          el.style.color = "var(--foreground)";
          lockedRef.current[i] = true;
        } else {
          allDone = false;
          if (elapsed >= timing.start && now - lastTickRef.current[i] > 55) {
            el.textContent = randomChar();
            lastTickRef.current[i] = now;
          } else if (elapsed < timing.start) {
            allDone = false;
          }
        }
      });

      if (!allDone) {
        raf = requestAnimationFrame(tick);
      } else {
        setSettled(true);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  // --- Exit timing: real minimum duration + everything must be settled ---
  useEffect(() => {
    let raf;
    const start = performance.now();
    const check = () => {
      const elapsed = performance.now() - start;
      const revealFinished = reducedMotion.current || elapsed >= allLockedAt + 400;
      if (elapsed >= minDuration && dataReady && revealFinished) {
        setExiting(true);
      } else {
        raf = requestAnimationFrame(check);
      }
    };
    raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady, minDuration]);

  useEffect(() => {
    document.body.style.overflow = exiting ? "" : "hidden";
    return () => (document.body.style.overflow = "");
  }, [exiting]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!exiting && (
        <motion.div
          key="loading-screen"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: EASE }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "var(--background)" }}
        >
          {/* Hidden measuring node — natural width at a fixed reference size, mono, nowrap */}
          <span
            ref={measureRef}
            aria-hidden="true"
            className="absolute opacity-0 pointer-events-none whitespace-nowrap"
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              fontSize: "120px",
              letterSpacing: "-0.01em",
              top: -9999,
              left: -9999,
            }}
          >
            {name}
          </span>

          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex flex-col items-center px-6"
          >
            <div
              ref={wrapperRef}
              className="whitespace-nowrap"
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 800,
                fontSize: `${fontSize}px`,
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              {chars.map((ch, i) => (
                <span
                  key={i}
                  ref={el => (charRefs.current[i] = el)}
                  style={{
                    display: "inline-block",
                    color: "var(--rule)",
                    whiteSpace: "pre",
                  }}
                >
                  {ch === " " ? "\u00A0" : ""}
                </span>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={settled ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="mono-label text-[11px] uppercase tracking-[0.25em] mt-6"
              style={{ color: "var(--muted-foreground)" }}
            >
              Full-Stack Developer
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={settled ? { scaleX: 1 } : {}}
              transition={{ duration: 0.55, ease: EASE, delay: 0.22 }}
              className="h-px w-16 mt-8 origin-center"
              style={{ background: "var(--signal)" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
