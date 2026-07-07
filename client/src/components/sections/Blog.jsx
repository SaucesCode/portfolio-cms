import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useBlogPosts } from "../../hooks/useBlog";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(excerpt) {
  if (!excerpt) return "1 min read";
  const words = excerpt.split(" ").length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

/* ── The opening piece — set apart, drop cap, no image ──────── */
function FeaturedEntry({ post, onClick }) {
  const first = post.excerpt?.[0] || "";
  const rest = post.excerpt?.slice(1) || "";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="pb-16 mb-16 border-b cursor-pointer"
      style={{ borderColor: "var(--rule)" }}
      onClick={() => onClick(post.slug)}
    >
      <p className="mono-label text-[11px] mb-5" style={{ color: "var(--signal-warm)" }}>
        the latest piece
      </p>

      <h3
        className="tracking-tight leading-[1.08] mb-6 transition-opacity hover:opacity-75"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(30px, 4.6vw, 52px)",
          color: "var(--foreground)",
        }}
      >
        {post.title}
      </h3>

      <p
        className="max-w-[620px] text-[15.5px] leading-[1.9]"
        style={{ color: "var(--muted-foreground)" }}
      >
        <span
          aria-hidden="true"
          className="float-left mr-2 leading-[0.8]"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "3.6em",
            color: "var(--signal)",
          }}
        >
          {first}
        </span>
        {rest}
      </p>

      <div
        className="flex flex-wrap items-center gap-3 mt-7 mono-label text-[11px]"
        style={{ color: "var(--muted-foreground)" }}
      >
        <span>{formatDate(post.publishedAt)}</span>
        <span>·</span>
        <span>{estimateReadTime(post.excerpt)}</span>
        {post.tags?.length > 0 && (
          <>
            <span>·</span>
            <span>{post.tags.slice(0, 2).join(" · ")}</span>
          </>
        )}
      </div>

      <span
        className="inline-block mt-7 text-[12px] font-bold uppercase tracking-wider border-b-2 pb-0.5"
        style={{ borderColor: "var(--signal)" }}
      >
        Read the full piece
      </span>
    </motion.article>
  );
}

/* ── A single entry in the flowing archive list ─────────────── */
function ArchiveEntry({ post, isLast, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onClick(post.slug)}
        className="w-full text-left py-8"
      >
        <div className="flex items-start justify-between gap-6">
          <h3
            className="font-black tracking-[-0.015em] leading-[1.2] transition-colors"
            style={{
              fontSize: "clamp(20px, 2.6vw, 27px)",
              color: hovered ? "var(--signal)" : "var(--foreground)",
            }}
          >
            {post.title}
          </h3>
          <span
            className="mono-label text-[11px] shrink-0 mt-2 transition-all duration-200"
            style={{
              color: "var(--muted-foreground)",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateX(0)" : "translateX(-6px)",
            }}
          >
            read →
          </span>
        </div>

        <p
          className="mono-label text-[11px] mt-2.5"
          style={{ color: "var(--muted-foreground)" }}
        >
          {formatDate(post.publishedAt)} · {estimateReadTime(post.excerpt)}
          {post.tags?.[0] && ` · ${post.tags[0]}`}
        </p>

        <p
          className="mt-3 max-w-[640px] text-[14px] leading-[1.8]"
          style={{ color: "var(--muted-foreground)" }}
        >
          {post.excerpt}
        </p>
      </motion.button>

      {!isLast && (
        <div className="flex justify-center py-1" aria-hidden="true">
          <span
            className="mono-label text-[11px] tracking-[0.3em]"
            style={{ color: "var(--rule)" }}
          >
            · · ·
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function Blog() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const navigate = useNavigate();

  if (isLoading || posts.length === 0) return null;

  const [featured, ...rest] = posts;
  const handleClick = slug => navigate(`/blog/${slug}`);

  return (
    <section
      id="blog"
      className="border-t"
      style={{ background: "var(--background)", borderColor: "var(--rule)" }}
    >
      <div className="mx-auto max-w-[1280px] px-6 py-20 md:py-28">
        <div className="mb-16">
          <p
            className="mono-label text-[11px] mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            005 — writing
          </p>
          <h2
            className="font-black tracking-[-0.03em] leading-[0.95] mb-4"
            style={{ fontSize: "clamp(34px, 5vw, 58px)" }}
          >
            Notes from the <span className="accent-word">bench</span>.
          </h2>
          <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>
            {posts.length} piece{posts.length !== 1 ? "s" : ""}, mostly about the parts of the
            job nobody photographs for a portfolio.
          </p>
        </div>

        <FeaturedEntry post={featured} onClick={handleClick} />

        {rest.length > 0 && (
          <div>
            {rest.map((post, i) => (
              <ArchiveEntry
                key={post.id}
                post={post}
                isLast={i === rest.length - 1}
                onClick={handleClick}
              />
            ))}
          </div>
        )}

        <p
          className="mt-4 text-center mono-label text-[10px] tracking-[0.2em]"
          style={{ color: "var(--muted-foreground)" }}
        >
          — end of archive —
        </p>
      </div>
    </section>
  );
}
