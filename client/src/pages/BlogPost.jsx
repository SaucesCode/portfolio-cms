import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock, Hash } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useBlogPost, useBlogPosts } from "../hooks/useBlog";
import { useHero } from "../hooks/useHero";
import SEO from "@/components/SEO";

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function extractHeadings(markdown) {
  if (!markdown) return [];
  const matches = [...markdown.matchAll(/^(#{2,3})\s+(.+)$/gm)];
  return matches.map(m => ({
    level: m[1].length,
    text: m[2].trim(),
    id: slugify(m[2].trim()),
  }));
}

/* ── Reading progress — thin, fixed, unmissable but quiet ───── */
function ProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      setPct(scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[70]" style={{ background: "var(--rule)" }}>
      <div className="h-full transition-[width]" style={{ width: `${pct}%`, background: "var(--signal)" }} />
    </div>
  );
}

/* ── Floating table of contents — desktop only ──────────────── */
function TableOfContents({ headings, activeId }) {
  if (headings.length < 2) return null;
  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block sticky top-32 self-start ml-12 w-56 shrink-0"
    >
      <p className="mono-label text-[10px] uppercase tracking-wider mb-4" style={{ color: "var(--muted-foreground)" }}>
        In this piece
      </p>
      <ul className="flex flex-col gap-2.5 border-l" style={{ borderColor: "var(--rule)" }}>
        {headings.map(h => {
          const isActive = activeId === h.id;
          return (
            <li key={h.id} style={{ paddingLeft: h.level === 3 ? "28px" : "16px" }}>
              <a
                href={`#${h.id}`}
                className="block text-[12.5px] leading-snug transition-colors -ml-px pl-3 border-l-2"
                style={{
                  borderColor: isActive ? "var(--signal)" : "transparent",
                  color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ── Prev / next spread ──────────────────────────────────────── */
function AdjacentNav({ prev, next, onNavigate }) {
  if (!prev && !next) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 border-t" style={{ borderColor: "var(--rule)" }}>
      <button
        onClick={() => prev && onNavigate(prev.slug)}
        disabled={!prev}
        className="group flex flex-col items-start gap-2 py-8 pr-6 text-left border-b sm:border-b-0 sm:border-r disabled:opacity-30"
        style={{ borderColor: "var(--rule)" }}
      >
        <span className="flex items-center gap-1.5 mono-label text-[11px]" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
          Older
        </span>
        {prev && (
          <span className="font-bold text-[16px] leading-snug transition-colors group-hover:opacity-70">{prev.title}</span>
        )}
      </button>

      <button
        onClick={() => next && onNavigate(next.slug)}
        disabled={!next}
        className="group flex flex-col items-end gap-2 py-8 pl-6 text-right disabled:opacity-30"
      >
        <span className="flex items-center gap-1.5 mono-label text-[11px]" style={{ color: "var(--muted-foreground)" }}>
          Newer
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
        </span>
        {next && (
          <span className="font-bold text-[16px] leading-snug transition-colors group-hover:opacity-70">{next.title}</span>
        )}
      </button>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = useBlogPost(slug);
  const { data: allPosts = [] } = useBlogPosts();
  const { data: hero } = useHero();

  const [activeHeadingId, setActiveHeadingId] = useState(null);
  const articleRef = useRef(null);

  const headings = useMemo(() => extractHeadings(post?.content), [post?.content]);

  const { prev, next } = useMemo(() => {
    const idx = allPosts.findIndex(p => p.slug === slug);
    if (idx === -1) return { prev: null, next: null };
    return { prev: allPosts[idx + 1] || null, next: allPosts[idx - 1] || null };
  }, [allPosts, slug]);

  // Track which heading is currently in view for the TOC highlight
  useEffect(() => {
    if (headings.length < 2) return;
    const els = headings.map(h => document.getElementById(h.id)).filter(Boolean);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActiveHeadingId(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -70% 0px" },
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [headings, post?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--rule)", borderTopColor: "var(--signal)" }} />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Piece not found.</p>
        <button onClick={() => navigate("/")} className="text-[12px] font-bold uppercase tracking-wider border-b-2 pb-0.5" style={{ borderColor: "var(--signal)" }}>
          ← Back home
        </button>
      </div>
    );
  }

  const readTime = Math.max(1, Math.ceil(post.content.split(" ").length / 200));

  const markdownComponents = {
    h2: ({ children }) => {
      const id = slugify(String(children));
      return (
        <h2 id={id} className="scroll-mt-28 group flex items-baseline gap-2 font-black tracking-[-0.02em] mt-14 mb-5" style={{ fontSize: "clamp(22px,3vw,30px)" }}>
          {children}
          <a href={`#${id}`} aria-label="Link to this section" className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--muted-foreground)" }}>
            <Hash size={16} />
          </a>
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = slugify(String(children));
      return (
        <h3 id={id} className="scroll-mt-28 group flex items-baseline gap-2 font-bold tracking-[-0.015em] mt-10 mb-4" style={{ fontSize: "clamp(18px,2.4vw,22px)" }}>
          {children}
          <a href={`#${id}`} aria-label="Link to this section" className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--muted-foreground)" }}>
            <Hash size={14} />
          </a>
        </h3>
      );
    },
    img: ({ src, alt }) => (
      <span className="block my-10">
        <img src={src} alt={alt} className="w-full border" style={{ borderColor: "var(--rule)" }} />
        {alt && (
          <span className="mono-label block mt-2.5 text-center text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            {alt}
          </span>
        )}
      </span>
    ),
  };

  return (
    <>
      <SEO
        title={`${post.title} — Writing`}
        description={post.excerpt || post.content.slice(0, 160)}
        url={`/blog/${post.slug}`}
        image={post.coverImageUrl || "/og-image.png"}
      />
      <ProgressBar />

      <div className="min-h-screen pt-24 pb-24" style={{ background: "var(--background)" }}>
        <div className="mx-auto max-w-[1280px] px-6 md:px-14">
          <div className="flex justify-center">
            <div className="w-full max-w-[1280px]">
              {/* Back link */}
              <motion.button
                onClick={() => navigate("/#blog")}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="mono-label text-[11px] uppercase tracking-wider mb-12 transition-colors"
                style={{ color: "var(--muted-foreground)" }}
              >
                ← Back to writing
              </motion.button>

              {/* Masthead header */}
              <motion.header
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mb-14 pb-10 border-b"
                style={{ borderColor: "var(--rule)" }}
              >
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mb-5 mono-label text-[11px] uppercase tracking-wider" style={{ color: "var(--signal-warm)" }}>
                    {post.tags.map((tag, i) => (
                      <span key={tag}>
                        {tag}
                        {i < post.tags.length - 1 && <span style={{ color: "var(--rule)" }}> /</span>}
                      </span>
                    ))}
                  </div>
                )}

                <h1
                  className="font-black tracking-[-0.03em] leading-[1.02] mb-6"
                  style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
                >
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mono-label text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} /> {formatDate(post.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} /> {readTime} min read
                  </span>
                  <span>By {hero?.name || "James Patrick"}</span>
                </div>
              </motion.header>

              {/* Article body — custom markdown styling, no default prose plugin */}
              <motion.div
                ref={articleRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="article-body"
              >
                <ReactMarkdown rehypePlugins={[rehypeHighlight]} components={markdownComponents}>
                  {post.content}
                </ReactMarkdown>
              </motion.div>

              <div className="mt-20">
                <AdjacentNav prev={prev} next={next} onNavigate={s => navigate(`/blog/${s}`)} />
              </div>
            </div>

            <TableOfContents headings={headings} activeId={activeHeadingId} />
          </div>
        </div>
      </div>

      {/* Custom markdown element styling — replaces default prose plugin entirely */}
      <style>{`
        .article-body { font-size: 16.5px; line-height: 1.9; color: var(--foreground); }
        .article-body p { margin-bottom: 1.6em; }
        .article-body strong { font-weight: 700; }
        .article-body a { color: var(--signal); text-underline-offset: 3px; }
        .article-body a:hover { text-decoration: none; }

        .article-body blockquote {
          margin: 2.2em 0;
          padding-left: 1.4em;
          border-left: 2px solid var(--signal);
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1.15em;
          color: var(--muted-foreground);
        }

        .article-body ul, .article-body ol {
          margin: 1.4em 0;
          padding-left: 0;
          list-style: none;
        }
        .article-body ul li, .article-body ol li {
          position: relative;
          padding-left: 1.6em;
          margin-bottom: 0.7em;
        }
        .article-body ul li::before {
          content: "—";
          position: absolute;
          left: 0;
          color: var(--signal);
        }
        .article-body ol { counter-reset: item; }
        .article-body ol li::before {
          counter-increment: item;
          content: counter(item) ".";
          position: absolute;
          left: 0;
          font-family: var(--font-mono);
          font-size: 0.85em;
          color: var(--signal);
        }

        .article-body pre {
          margin: 2em 0;
          padding: 1.4em;
          overflow-x: auto;
          border: 1px solid var(--rule);
          background: var(--muted);
          border-radius: 0;
        }
        .article-body code {
          font-family: var(--font-mono);
          font-size: 0.85em;
        }
        .article-body :not(pre) > code {
          padding: 0.15em 0.45em;
          background: var(--muted);
          border: 1px solid var(--rule);
        }

        .article-body hr {
          border: none;
          border-top: 1px solid var(--rule);
          margin: 3em 0;
        }
      `}</style>
    </>
  );
}