import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTestimonials } from "../../hooks/useTestimonials";

export default function Testimonials() {
  const { data: testimonials = [], isLoading } = useTestimonials();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const sectionRef = useRef(null);

  const total = testimonials.length;

  const goTo = useCallback(
    next => {
      if (total === 0) return;
      setDirection(next > index || (index === total - 1 && next === 0) ? 1 : -1);
      setIndex(((next % total) + total) % total);
    },
    [index, total],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  // Keyboard navigation — only when the section is in view / focused within
  useEffect(() => {
    const handleKey = e => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView =
        rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
      if (!inView) return;

      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  if (isLoading || total === 0) return null;

  const current = testimonials[index];

  const variants = {
    enter: d => ({ opacity: 0, x: d > 0 ? 24 : -24 }),
    center: { opacity: 1, x: 0 },
    exit: d => ({ opacity: 0, x: d > 0 ? -24 : 24 }),
  };

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="border-t"
      style={{ background: "var(--background)", borderColor: "var(--rule)" }}
      aria-roledescription="carousel"
      aria-label="Testimonials"
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-14 py-24 md:py-36">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mono-label text-[11px] mb-16 md:mb-20 text-center"
          style={{ color: "var(--muted-foreground)" }}
        >
          0001 — kind words
        </motion.p>

        {/* The quote — centered, generous margins, no chrome at all */}
        <div className="relative max-w-[760px] mx-auto min-h-[220px] md:min-h-[260px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
              aria-live="polite"
            >
              <p
                className="leading-[1.4] tracking-[-0.01em]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "clamp(22px, 3.4vw, 34px)",
                  color: "var(--foreground)",
                }}
              >
                {current.quote}
              </p>

              <div className="mt-8 flex items-center justify-center gap-3">
                {current.avatarUrl ? (
                  <img
                    src={current.avatarUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-8 w-8 rounded-full object-cover grayscale"
                  />
                ) : (
                  <span
                    className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                    aria-hidden="true"
                  >
                    {current.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                )}
                <p className="text-[13px]">
                  <span className="font-bold">{current.name}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>
                    {" "}
                    — {current.role}
                    {current.company && `, ${current.company}`}
                  </span>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation — text arrows + progress line, no dots, no arrows-in-circles */}
        {total > 1 && (
          <div className="mt-16 md:mt-20 flex items-center justify-center gap-8">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="mono-label text-[11px] uppercase tracking-wider transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 rounded-sm px-1"
              style={{ color: "var(--muted-foreground)", "--tw-ring-color": "var(--signal)" }}
            >
              ← Prev
            </button>

            <div className="flex items-center gap-3">
              <span
                className="mono-label text-[11px] tabular-nums"
                style={{ color: "var(--muted-foreground)" }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div
                className="relative h-px w-16 overflow-hidden"
                style={{ background: "var(--rule)" }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 h-full"
                  style={{ background: "var(--signal)" }}
                  animate={{ width: `${((index + 1) / total) * 100}%` }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span
                className="mono-label text-[11px] tabular-nums"
                style={{ color: "var(--muted-foreground)" }}
              >
                {String(total).padStart(2, "0")}
              </span>
            </div>

            <button
              onClick={next}
              aria-label="Next testimonial"
              className="mono-label text-[11px] uppercase tracking-wider transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 rounded-sm px-1"
              style={{ color: "var(--muted-foreground)", "--tw-ring-color": "var(--signal)" }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
  