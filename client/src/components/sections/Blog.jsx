import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Tag } from "lucide-react";
import { useBlogPosts } from "../../hooks/useBlog";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Estimates read time based on word count
// Average reading speed is ~200 words per minute
function estimateReadTime(excerpt) {
  if (!excerpt) return "1 min read";
  const words = excerpt.split(" ").length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Blog() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const navigate = useNavigate();

  if (isLoading || posts.length === 0) return null;

  return (
    <section id="blog" className="py-24 bg-gray-950">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <p className="text-blue-400 text-sm font-mono tracking-widest uppercase mb-3">
            My Thoughts
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Blog & Articles</h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            Things I've learned and want to share.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {posts.map(post => (
            <motion.article
              key={post.id}
              variants={cardVariants}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="group flex flex-col bg-gray-900 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
            >
              {/* Cover image */}
              <div className="aspect-video bg-gray-800 overflow-hidden">
                {post.coverImageUrl ? (
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  // Placeholder gradient when no cover image
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 p-5">
                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors mb-2 leading-snug">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                  {post.excerpt}
                </p>

                {/* Footer — date + read time */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={11} />
                    {formatDate(post.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={11} />
                    {estimateReadTime(post.excerpt)}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
