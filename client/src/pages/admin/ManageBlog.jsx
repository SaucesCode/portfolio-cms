import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { createPublishingApi } from "../../services/publishing";
import { usePublishingActions } from "../../hooks/usePublishingActions";
import PageHeader from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";
import StatusTabs from "../../components/admin/StatusTabs";
import PublishBadge from "../../components/admin/PublishBadge";
import PublishMenu from "../../components/admin/PublishMenu";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ManageBlog() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const publishingApi = createPublishingApi("/admin/blog");
  const { handleTransition } = usePublishingActions(publishingApi, [["admin-blog"], ["blog"]]);

  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () => api.get("/admin/blog").then(r => r.data),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
    queryClient.invalidateQueries({ queryKey: ["blog"] });
  };

  const filtered = useMemo(() => {
    let list = [...posts];
    if (statusFilter !== "All")
      list = list.filter(p => p.status === statusFilter.toUpperCase());
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [posts, statusFilter, query]);

  const handleDelete = async id => {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      toast.success("Post deleted");
      invalidate();
    } catch {
      toast.error("Couldn't delete — try again");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={`${posts.length} total`}
        title="Blog"
        description="Articles shown in your portfolio's Writing section."
        action={
          <button
            onClick={() => navigate("/admin/blog/new")}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[12.5px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--signal)", color: "var(--background)" }}
          >
            <Plus size={14} />
            New post
          </button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <StatusTabs value={statusFilter} onChange={setStatusFilter} />
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--muted-foreground)" }}
          />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search title or tag..."
            className="h-8 pl-7 pr-3 rounded-lg text-[12.5px] outline-none w-48"
            style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--rule)", borderTopColor: "var(--signal)" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={posts.length === 0 ? "No posts yet" : "Nothing matches this filter"}
          description={
            posts.length === 0
              ? "Write your first post to see it appear here."
              : "Try a different search or status."
          }
          action={
            posts.length === 0 && (
              <button
                onClick={() => navigate("/admin/blog/new")}
                className="mt-2 px-3.5 h-9 rounded-lg text-[12.5px] font-semibold"
                style={{ background: "var(--signal)", color: "var(--background)" }}
              >
                New post
              </button>
            )
          }
        />
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--rule)" }}
        >
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--muted)]"
              style={{
                background: "var(--card)",
                borderTop: i > 0 ? "1px solid var(--rule)" : "none",
              }}
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-[13.5px] font-semibold truncate">{post.title}</h3>
                <p
                  className="text-[12px] font-mono truncate mt-0.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  /blog/{post.slug}
                  {post.tags?.length > 0 && <span> · {post.tags.slice(0, 2).join(", ")}</span>}
                </p>
              </div>

              <span
                className="hidden sm:block text-[11.5px] shrink-0"
                style={{ color: "var(--muted-foreground)" }}
              >
                {post.publishedAt ? formatDate(post.publishedAt) : "Not yet published"}
              </span>

              <div className="shrink-0">
                <PublishBadge
                  status={post.status}
                  scheduledAt={post.scheduledAt}
                  publishedAt={post.publishedAt}
                />
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <PublishMenu
                  status={post.status}
                  onAction={(action, payload) => handleTransition(post, action, payload)}
                />
                <button
                  onClick={() => navigate(`/admin/blog/${post.id}/edit`)}
                  className="p-1.5 rounded-md hover:bg-[var(--background)]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-1.5 rounded-md hover:bg-[var(--background)]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
