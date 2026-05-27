import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Inbox,
  FileText,
  RefreshCw,
  Wrench,
  Briefcase,
  Award,
  MessageSquare,
  BarChart2,
  User,
  CheckCircle,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const QUICK_LINKS = [
  {
    label: "Hero Section",
    href: "/admin/hero",
    icon: User,
    desc: "Bio, profile assets, structural taglines",
  },
  {
    label: "Projects Ecosystem",
    href: "/admin/projects",
    icon: FolderOpen,
    desc: "Production architecture case-studies",
  },
  {
    label: "Core Capabilities",
    href: "/admin/skills",
    icon: Wrench,
    desc: "Stack proficiencies, toolchains, ecosystems",
  },
  {
    label: "Career Timeline",
    href: "/admin/experience",
    icon: Briefcase,
    desc: "Professional background, history logs",
  },
  {
    label: "Certifications",
    href: "/admin/certifications",
    icon: Award,
    desc: "Verified credentials and cloud badges",
  },
  {
    label: "Endorsements",
    href: "/admin/testimonials",
    icon: MessageSquare,
    desc: "Client quotes and verified references",
  },
  {
    label: "Performance Metrics",
    href: "/admin/stats",
    icon: BarChart2,
    desc: "Quantifiable numbers and impact analytics",
  },
  {
    label: "Technical Blog",
    href: "/admin/blog",
    icon: FileText,
    desc: "Publish markdown posts and tech drafts",
  },
  {
    label: "Communications",
    href: "/admin/inbox",
    icon: Inbox,
    desc: "Lead capture pipeline and inbox streams",
  },
];

export default function Dashboard() {
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => api.get("/admin/projects").then(res => res.data),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => api.get("/admin/messages").then(res => res.data),
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () => api.get("/admin/blog").then(res => res.data),
  });

  const { data: syncStatus, refetch: refetchSyncStatus } = useQuery({
    queryKey: ["sync-status"],
    queryFn: () => api.get("/admin/github/sync-status").then(res => res.data),
  });

  const unreadCount = messages.filter(m => !m.isRead).length;
  const publishedCount = blogPosts.filter(p => p.published).length;
  const draftCount = blogPosts.filter(p => !p.published).length;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await api.post("/admin/github/sync");
      const synced = res.data.results.filter(r => r.status === "synced").length;
      const skipped = res.data.results.filter(
        r => r.status === "skipped — synced recently",
      ).length;

      if (synced > 0) {
        toast.success(`Synchronized ${synced} workspace components`);
      } else if (skipped > 0) {
        toast.info("Ecosystem data matches origin node — sync skipped");
      }
      refetchSyncStatus();
    } catch (error) {
      toast.error("Handshake failed — check integration parameters");
    } finally {
      setIsSyncing(false);
    }
  };

  function formatSyncTime(dateStr) {
    if (!dateStr) return "Pending initial connection";
    const date = new Date(dateStr);
    return (
      date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " UTC"
    );
  }

  const STAT_CARDS = [
    {
      label: "Production Projects",
      value: projects.length,
      icon: FolderOpen,
      href: "/admin/projects",
    },
    {
      label: "Unread Submissions",
      value: unreadCount,
      icon: Inbox,
      href: "/admin/inbox",
      highlight: unreadCount > 0,
    },
    { label: "Published Content", value: publishedCount, icon: FileText, href: "/admin/blog" },
    { label: "Staged Drafts", value: draftCount, icon: FileText, href: "/admin/blog" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 antialiased selection:bg-primary/20 selection:text-primary">
      {/* Structural Header Context */}
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4"
      >
        <div>
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
            System Architecture
          </h1>
          <p className="text-[11px] text-muted-foreground mt-1 font-mono tracking-tight">
            Node status: active // Portfolio Core Content Management System
          </p>
        </div>
      </motion.div>

      {/* High-Contrast Analytical Metrics Matrix */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {STAT_CARDS.map(card => (
          <motion.div key={card.label} variants={fadeUp}>
            <Link
              to={card.href}
              className={`group flex flex-col justify-between p-5 h-32 rounded-xl border bg-card transition-all duration-200 select-none
                ${
                  card.highlight
                    ? "border-primary/40 bg-gradient-to-br from-card to-primary/[0.02] shadow-[0_0_20px_-5px_rgba(var(--primary),0.1)]"
                    : "border-border hover:border-foreground/20 hover:bg-muted/30"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  {card.label}
                </span>
                <card.icon
                  size={14}
                  strokeWidth={2}
                  className={`transition-colors duration-200 ${card.highlight ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"}`}
                />
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-black tracking-tight font-mono text-foreground">
                  {String(card.value).padStart(2, "0")}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Integration Synchronizer */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-card border border-border rounded-xl p-5 select-none hover:border-foreground/10 transition-colors duration-200"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-muted border border-border text-foreground shrink-0 flex items-center justify-center">
              <FaGithub size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-foreground">
                External VCS Pipeline
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono flex items-center gap-2">
                {syncStatus?.lastSyncedAt ? (
                  <>
                    <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                    Last safe handshake: {formatSyncTime(syncStatus.lastSyncedAt)}
                  </>
                ) : (
                  "VCS pipeline data unpopulated"
                )}
              </p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="h-9 px-4 bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 font-mono"
          >
            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Executing Pipeline..." : "Sync Workspace"}
          </button>
        </div>
      </motion.div>

      {/* System Routing Controls */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em] pl-0.5">
          Workspace Modules
        </h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {QUICK_LINKS.map(link => (
            <motion.div key={link.href} variants={fadeUp}>
              <Link
                to={link.href}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-foreground/20 hover:bg-muted/20 transition-all group duration-150"
              >
                <div className="p-3 rounded-lg bg-muted border border-border group-hover:bg-foreground/[0.02] group-hover:border-foreground/20 transition-colors shrink-0 flex items-center justify-center text-muted-foreground/70 group-hover:text-foreground">
                  <link.icon size={14} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground transition-colors">
                    {link.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-1">
                    {link.desc}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
