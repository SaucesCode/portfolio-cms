import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, ArrowUpRight, Inbox as InboxIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../services/api";
import PageHeader from "../../components/admin/PageHeader";

function useGreeting() {
  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);
  return greeting;
}

const CONTENT_LINKS = [
  { label: "Projects", href: "/admin/projects", key: "projects" },
  { label: "Skills", href: "/admin/skills", key: "skills" },
  { label: "Experience", href: "/admin/experience", key: "experience" },
  { label: "Certifications", href: "/admin/certifications", key: "certifications" },
  { label: "Testimonials", href: "/admin/testimonials", key: "testimonials" },
];

export default function Dashboard() {
  const greeting = useGreeting();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: hero } = useQuery({
    queryKey: ["hero"],
    queryFn: () => api.get("/hero").then(r => r.data),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => api.get("/admin/projects").then(r => r.data),
  });
  const { data: skills = [] } = useQuery({
    queryKey: ["admin-skills"],
    queryFn: () => api.get("/admin/skills").then(r => r.data),
  });
  const { data: experiences = [] } = useQuery({
    queryKey: ["admin-experiences"],
    queryFn: () => api.get("/admin/experiences").then(r => r.data),
  });
  const { data: certifications = [] } = useQuery({
    queryKey: ["admin-certifications"],
    queryFn: () => api.get("/admin/certifications").then(r => r.data),
  });
  const { data: testimonials = [] } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => api.get("/admin/testimonials").then(r => r.data),
  });
  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => api.get("/admin/messages").then(r => r.data),
  });
  const { data: blogPosts = [] } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () => api.get("/admin/blog").then(r => r.data),
  });
  const { data: syncStatus, refetch: refetchSyncStatus } = useQuery({
    queryKey: ["sync-status"],
    queryFn: () => api.get("/admin/github/sync-status").then(r => r.data),
  });

  const counts = {
    projects: projects.length,
    skills: skills.length,
    experience: experiences.length,
    certifications: certifications.length,
    testimonials: testimonials.length,
  };
  const unread = messages.filter(m => !m.isRead);
  const publishedCount = blogPosts.filter(p => p.published).length;
  const draftCount = blogPosts.filter(p => !p.published).length;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await api.post("/admin/github/sync");
      const synced = res.data.results.filter(r => r.status === "synced").length;
      toast.success(
        synced > 0
          ? `Synced ${synced} project${synced !== 1 ? "s" : ""}`
          : "Already up to date",
      );
      refetchSyncStatus();
    } catch {
      toast.error("Sync failed — check the connection and try again");
    } finally {
      setIsSyncing(false);
    }
  };

  function formatSyncTime(dateStr) {
    if (!dateStr) return "Never synced";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
        title={`${greeting}${hero?.name ? `, ${hero.name.split(" ")[0]}` : ""}`}
        description="Here's where things stand across the site."
      />

      {/* Inline stat strip — one row, not four cards */}
      <div
        className="flex flex-wrap gap-x-10 gap-y-4 mb-10 pb-8"
        style={{ borderBottom: "1px solid var(--rule)" }}
      >
        {[
          { label: "Projects", value: counts.projects },
          { label: "Published posts", value: publishedCount },
          { label: "Drafts", value: draftCount },
          { label: "Unread messages", value: unread.length, flag: unread.length > 0 },
        ].map(item => (
          <div key={item.label}>
            <p
              className="font-mono text-[11px] uppercase tracking-wider mb-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              {item.label}
            </p>
            <p
              className="font-mono text-[26px] font-bold tabular-nums leading-none"
              style={{ color: item.flag ? "var(--signal)" : "var(--foreground)" }}
            >
              {String(item.value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10">
        <div className="flex flex-col gap-10">
          {/* GitHub sync — a utility row, not an icon-card */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--muted-foreground)" }}
            >
              GitHub sync
            </p>
            <div
              className="flex items-center justify-between gap-4 px-4 h-14 rounded-lg"
              style={{ background: "var(--card)", border: "1px solid var(--rule)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FaGithub size={16} style={{ color: "var(--muted-foreground)" }} />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium truncate">
                    {syncStatus?.lastSyncedProject
                      ? `Last: ${syncStatus.lastSyncedProject}`
                      : "Not synced yet"}
                  </p>
                  <p
                    className="font-mono text-[11px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {formatSyncTime(syncStatus?.lastSyncedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 h-8 rounded-md text-[12px] font-semibold transition-opacity disabled:opacity-50 shrink-0"
                style={{ background: "var(--signal)", color: "var(--background)" }}
              >
                <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? "Syncing" : "Sync now"}
              </button>
            </div>
          </div>

          {/* Content overview — scannable list with live counts, not an icon grid */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--muted-foreground)" }}
            >
              Content
            </p>
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--rule)" }}
            >
              {CONTENT_LINKS.map((item, i) => (
                <Link
                  key={item.key}
                  to={item.href}
                  className="group flex items-center justify-between px-4 h-12 transition-colors hover:bg-[var(--muted)]"
                  style={{
                    borderTop: i > 0 ? "1px solid var(--rule)" : "none",
                    background: "var(--card)",
                  }}
                >
                  <span className="text-[13.5px] font-medium">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono text-[12px]"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {String(counts[item.key]).padStart(2, "0")}
                    </span>
                    <ArrowUpRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      style={{ color: "var(--muted-foreground)" }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent messages preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted-foreground)" }}
            >
              Recent messages
            </p>
            <Link
              to="/admin/inbox"
              className="text-[11px] font-medium"
              style={{ color: "var(--signal)" }}
            >
              View all
            </Link>
          </div>

          {messages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-2 py-10 rounded-lg text-center"
              style={{ border: "1px dashed var(--rule)" }}
            >
              <InboxIcon size={18} style={{ color: "var(--muted-foreground)" }} />
              <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                Nothing here yet
              </p>
            </div>
          ) : (
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--rule)" }}
            >
              {messages.slice(0, 4).map((m, i) => (
                <Link
                  key={m.id}
                  to="/admin/inbox"
                  className="block px-4 py-3 transition-colors hover:bg-[var(--muted)]"
                  style={{
                    borderTop: i > 0 ? "1px solid var(--rule)" : "none",
                    background: "var(--card)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="text-[13px] font-semibold truncate"
                      style={{
                        color: m.isRead ? "var(--muted-foreground)" : "var(--foreground)",
                      }}
                    >
                      {m.name}
                    </span>
                    {!m.isRead && (
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ background: "var(--signal)" }}
                      />
                    )}
                  </div>
                  <p
                    className="text-[12px] truncate"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {m.subject || m.body}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
