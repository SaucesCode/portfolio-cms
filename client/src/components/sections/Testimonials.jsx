import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useTestimonials } from "../../hooks/useTestimonials";

export default function Testimonials() {
  const { data: testimonials = [], isLoading } = useTestimonials();
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const tick = () => {
      if (!isPaused && scrollRef.current) {
        posRef.current += 0.5;
        const half = scrollRef.current.scrollWidth / 2;
        if (posRef.current >= half) posRef.current = 0;
        scrollRef.current.scrollLeft = posRef.current;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPaused, testimonials]);

  if (isLoading || testimonials.length === 0) return null;

  const doubled = [...testimonials, ...testimonials];

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-background border-y border-border"
    >
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />
      {/* Grid dark */}
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            "linear-gradient(to right,rgba(255,255,255,0.03) 1px,transparent 1px)," +
            "linear-gradient(to bottom,rgba(255,255,255,0.03) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,#000 40%,transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%,#000 40%,transparent 100%)",
        }}
      />
      {/* Blue glow */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-0 h-[300px] w-[300px] rounded-full bg-blue-600/6 dark:bg-blue-500/8 blur-[80px]" />

      <div className="relative z-10 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-[1280px] px-6 md:px-14 mb-12"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-6 bg-border inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
              Kind Words
            </span>
          </div>

          <div
            className="flex flex-wrap items-end gap-x-4 leading-[0.9] tracking-[-0.04em] font-black"
            style={{ fontSize: "clamp(40px, 7vw, 80px)" }}
          >
            <span
              className="text-transparent select-none"
              style={{
                WebkitTextStroke:
                  "1.5px color-mix(in srgb, var(--foreground) 22%, transparent)",
              }}
            >
              WHAT
            </span>
            <span className="text-foreground">THEY</span>
            <span className="text-blue-600 dark:text-blue-500">SAY</span>
          </div>
        </motion.div>

        {/* Edge fade masks */}
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-hidden select-none px-6 cursor-default"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {doubled.map((t, i) => (
              <TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
            ))}
          </div>
        </div>

        {/* Pause hint */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/25"
        >
          Hover to pause
        </motion.p>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }) {
  const initials = testimonial.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="group relative flex-shrink-0 w-[320px] flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-blue-500/25 hover:shadow-lg hover:shadow-blue-600/5 hover:-translate-y-0.5">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-blue-600 to-violet-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
      </div>

      {/* Quote icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/15 bg-blue-500/8">
        <Quote size={14} className="text-blue-500 dark:text-blue-400" strokeWidth={2} />
      </div>

      {/* Quote text */}
      <p className="flex-1 text-[13px] leading-[1.75] text-muted-foreground italic">
        "{testimonial.quote}"
      </p>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Author */}
      <div className="flex items-center gap-3">
        {testimonial.avatarUrl ? (
          <img
            src={testimonial.avatarUrl}
            alt={testimonial.name}
            className="h-9 w-9 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/8 text-[11px] font-black text-blue-600 dark:text-blue-400">
            {initials}
          </div>
        )}
        <div>
          <p className="text-[13px] font-bold text-foreground leading-none mb-1">
            {testimonial.name}
          </p>
          <p className="text-[11px] font-medium text-muted-foreground/50">
            {testimonial.role}
            {testimonial.company && (
              <>
                {" "}
                · <span className="text-muted-foreground/40">{testimonial.company}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
