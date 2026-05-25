import { useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { useExperiences } from "../../hooks/useExperiences";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function duration(start, end, isCurrent) {
  const from = new Date(start);
  const to = isCurrent ? new Date() : new Date(end);
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (months < 12) return `${months}mo`;
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  return mo ? `${yrs}y ${mo}mo` : `${yrs}y`;
}

export default function Experience() {
  const { data: experiences = [], isLoading } = useExperiences();
  const scrollRef = useRef(null);

  const scroll = dir => {
    scrollRef.current?.scrollBy({ left: dir * 380, behavior: "smooth" });
  };

  if (isLoading)
    return (
      <section className="flex items-center justify-center py-20 bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </section>
    );

  return (
    <section
      id="experience"
      className="relative overflow-hidden border-y border-border bg-background py-20"
    >
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />

      {/* Grid lines */}
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

      <div className="relative z-10">
        {/* Header + nav buttons — aligned to global max-width */}
        <div className="mx-auto mb-12 flex max-w-[1280px] items-end justify-between px-6 md:px-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow */}
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-6 bg-border inline-block" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
                Where I've Been
              </span>
            </div>

            {/* Split headline — matches global pattern */}
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
                WORK
              </span>
              <span className="text-foreground">EXPERIENCE</span>
              <span className="text-blue-600 dark:text-blue-500">.</span>
            </div>
          </motion.div>

          {/* Scroll nav buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex shrink-0 items-center gap-2 pb-2"
          >
            <button
              onClick={() => scroll(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:border-blue-500/30 hover:text-foreground"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:border-blue-500/30 hover:text-foreground"
            >
              <ArrowRight size={15} />
            </button>
          </motion.div>
        </div>

        {/* Horizontal scroll track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingLeft: "max(24px, calc((100vw - 1280px) / 2 + 56px))",
            paddingRight: "max(24px, calc((100vw - 1280px) / 2 + 56px))",
          }}
        >
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative flex w-[340px] shrink-0 flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-blue-500/25 hover:bg-blue-600/[0.02]"
            >
              {/* Top accent line on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-blue-600 to-violet-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </div>

              {/* Index number */}
              <span
                className="mb-4 block font-black tracking-[-0.04em] text-transparent select-none"
                style={{
                  fontSize: "48px",
                  lineHeight: 1,
                  WebkitTextStroke:
                    "1.5px color-mix(in srgb, var(--foreground) 10%, transparent)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Role */}
              <div className="mb-1 flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-bold tracking-tight text-foreground">
                  {exp.role}
                </h3>
                {exp.isCurrent && (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/8 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-green-600 dark:text-green-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    Now
                  </span>
                )}
              </div>

              {/* Company */}
              <p className="mb-4 text-[13px] font-semibold text-blue-600 dark:text-blue-500">
                {exp.company}
              </p>

              {/* Date + duration */}
              <div className="mb-4 flex items-center gap-2 text-[11px] text-muted-foreground/60">
                <Calendar size={11} />
                <span>
                  {formatDate(exp.startDate)} —{" "}
                  {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                </span>
                <span className="ml-auto rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-medium">
                  {duration(exp.startDate, exp.endDate, exp.isCurrent)}
                </span>
              </div>

              {/* Divider */}
              <div className="mb-4 h-px w-full bg-border" />

              {/* Description */}
              <p className="flex-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-4">
                {exp.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-20" />

        {/* Count */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-5 max-w-[1280px] px-6 md:px-14 text-right text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/25"
        >
          {experiences.length} position{experiences.length !== 1 ? "s" : ""}
        </motion.p>
      </div>
    </section>
  );
}
