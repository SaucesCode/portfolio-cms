import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // syntax highlight theme
import { useBlogPost } from "../hooks/useBlog";
import SEO from "@/components/SEO";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = useBlogPost(slug);

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );

  if (isError || !post)
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Post not found.</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          ← Back to home
        </button>
      </div>
    );

  return (
    <>
      <SEO
        title={`${post.title} — Blog`}
        description={post.excerpt || post.content.slice(0, 160)}
        url={`/blog/${post.slug}`}
        image={post.coverImageUrl || "/og-image.png"}
      />
      <div className="min-h-screen bg-gray-950 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Back button */}
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-10 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>

          {/* Post header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-white/5">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {Math.max(1, Math.ceil(post.content.split(" ").length / 200))} min read
              </span>
            </div>

            {/* Cover image */}
            {post.coverImageUrl && (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full rounded-2xl mb-10 border border-white/5"
              />
            )}
          </motion.div>

          {/* Markdown content */}
          <motion.div
            className="prose prose-invert prose-blue max-w-none
            prose-headings:text-white
            prose-p:text-gray-400 prose-p:leading-relaxed
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 prose-pre:border prose-pre:border-white/10
            prose-blockquote:border-blue-500 prose-blockquote:text-gray-400
            prose-strong:text-white
            prose-hr:border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{post.content}</ReactMarkdown>
          </motion.div>
        </div>
      </div>
    </>
  );
}
