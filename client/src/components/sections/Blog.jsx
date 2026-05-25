import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowUpRight } from "lucide-react";
import { useBlogPosts } from "../../hooks/useBlog";

function estimateReadTime(excerpt) {
  if (!excerpt) return "1 min read";
  const words = excerpt.split(" ").length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ── Featured card (first post, wide) ───────────────────────── */
function FeaturedCard({ post, onClick }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onClick(post.slug)}
      className="group relative col-span-1 md:col-span-2 flex flex-col md:flex-row overflow-hidden rounded-2xl border border-border bg-card cursor-pointer transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-600/5 hover:-translate-y-0.5"
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl overflow-hidden z-10">
        <div className="h-full w-full bg-gradient-to-r from-blue-600 to-violet-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
      </div>

      {/* Image — left half on md */}
      <div
        className="relative w-full md:w-[45%] shrink-0 overflow-hidden bg-muted"
        style={{ minHeight: 220 }}
      >
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/8 to-violet-600/4">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/20">
              Article
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/30 hidden md:block" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-7">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="rounded-md border border-blue-500/15 bg-blue-500/6 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-blue-600 dark:text-blue-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div>
          <h3
            className="mb-3 font-black tracking-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug"
            style={{ fontSize: "clamp(18px, 2.2vw, 24px)" }}
          >
            {post.title}
          </h3>
          <p className="text-[13px] leading-[1.75] text-muted-foreground/70 line-clamp-3">
            {post.excerpt}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/40">
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {estimateReadTime(post.excerpt)}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/25 group-hover:text-blue-500 transition-colors">
            Read <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ── Regular card ────────────────────────────────────────────── */
function BlogCard({ post, index, onClick }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onClick(post.slug)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card cursor-pointer transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-600/5 hover:-translate-y-0.5"
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl overflow-hidden z-10">
        <div className="h-full w-full bg-gradient-to-r from-blue-600 to-violet-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
      </div>

      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/6 to-violet-600/4">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/20">
              Article
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="rounded-md border border-blue-500/15 bg-blue-500/6 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-blue-600 dark:text-blue-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="mb-2 text-[14px] font-black tracking-tight leading-snug text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="mb-4 flex-1 text-[12.5px] leading-relaxed text-muted-foreground/60 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/40">
            <span className="flex items-center gap-1.5">
              <Calendar size={10} />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={10} />
              {estimateReadTime(post.excerpt)}
            </span>
          </div>
          <ArrowUpRight
            size={13}
            className="text-muted-foreground/25 group-hover:text-blue-500 transition-colors"
          />
        </div>
      </div>
    </motion.article>
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
      <div className="pointer-events-none absolute bottom-0 right-0 z-0 h-[350px] w-[350px] rounded-full bg-blue-600/6 dark:bg-blue-500/8 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-14 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-6 bg-border inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
              My Thoughts
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
              LATEST
            </span>
            <span className="text-foreground">WRITING</span>
            <span className="text-blue-600 dark:text-blue-500">.</span>
          </div>
        </motion.div>

        {/* Grid — featured spans 2 cols, rest fill in */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <FeaturedCard post={featured} onClick={handleClick} />
          {rest.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} onClick={handleClick} />
          ))}
        </div>

        {/* Count */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-right text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/25"
        >
          {posts.length} article{posts.length !== 1 ? "s" : ""} published
        </motion.p>
      </div>
    </section>
  );
}
