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
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// Quick nav links to every management panel
const QUICK_LINKS = [
  { label: "Hero", href: "/admin/hero", icon: User, desc: "Edit bio, photo, taglines" },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderOpen,
    desc: "Manage your projects",
  },
  { label: "Skills", href: "/admin/skills", icon: Wrench, desc: "Add or edit skills" },
  { label: "Experience", href: "/admin/experience", icon: Briefcase, desc: "Work history" },
  { label: "Certifications", href: "/admin/certifications", icon: Award, desc: "Credentials" },
  {
    label: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquare,
    desc: "Manage quotes",
  },
  { label: "Stats", href: "/admin/stats", icon: BarChart2, desc: "Edit stat numbers" },
  { label: "Blog", href: "/admin/blog", icon: FileText, desc: "Write and publish posts" },
  { label: "Inbox", href: "/admin/inbox", icon: Inbox, desc: "View messages" },
];

export default function Dashboard() {
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch summary counts for stat cards
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

  // Fetch last sync status
  const { data: syncStatus, refetch: refetchSyncStatus } = useQuery({
    queryKey: ["sync-status"],
    queryFn: () => api.get("/admin/github/sync-status").then(res => res.data),
  });

  // Derived counts
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
        toast.success(`Synced ${synced} repo${synced > 1 ? "s" : ""} successfully`);
      } else if (skipped > 0) {
        toast.info("All repos were synced recently — skipped");
      }

      // Refresh sync status timestamp
      refetchSyncStatus();
    } catch (error) {
      toast.error("Sync failed — check your GitHub token");
    } finally {
      setIsSyncing(false);
    }
  };

  // Format the last synced timestamp nicely
  function formatSyncTime(dateStr) {
    if (!dateStr) return "Never synced";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const STAT_CARDS = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: FolderOpen,
      href: "/admin/projects",
    },
    {
      label: "Unread Messages",
      value: unreadCount,
      icon: Inbox,
      href: "/admin/inbox",
      highlight: unreadCount > 0,
    },
    {
      label: "Published Posts",
      value: publishedCount,
      icon: FileText,
      href: "/admin/blog",
    },
    {
      label: "Drafts",
      value: draftCount,
      icon: FileText,
      href: "/admin/blog",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Manage your portfolio content</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {STAT_CARDS.map(card => (
          <motion.div key={card.label} variants={fadeUp}>
            <Link
              to={card.href}
              className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5
                ${
                  card.highlight
                    ? "bg-blue-500/10 border-blue-500/20"
                    : "bg-gray-900 border-white/5"
                }`}
            >
              <card.icon
                size={18}
                className={card.highlight ? "text-blue-400" : "text-gray-500"}
              />
              <div>
                <p
                  className={`text-2xl font-bold ${card.highlight ? "text-blue-400" : "text-white"}`}
                >
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* GitHub sync panel */}
      <motion.div
        className="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-8"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <FaGithub size={18} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">GitHub Sync</h2>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                {syncStatus?.lastSyncedAt ? (
                  <>
                    <CheckCircle size={11} className="text-green-400" />
                    Last synced: {formatSyncTime(syncStatus.lastSyncedAt)}
                  </>
                ) : (
                  "Never synced"
                )}
              </p>
            </div>
          </div>

          {/* Sync button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </motion.div>

      {/* Quick nav links */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Manage Content
        </h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {QUICK_LINKS.map(link => (
            <motion.div key={link.href} variants={fadeUp}>
              <Link
                to={link.href}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-900 border border-white/5 hover:border-blue-500/30 hover:bg-gray-800/50 transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-blue-500/10 transition-colors">
                  <link.icon
                    size={16}
                    className="text-gray-400 group-hover:text-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{link.label}</p>
                  <p className="text-xs text-gray-500">{link.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
