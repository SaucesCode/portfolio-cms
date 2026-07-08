import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MailOpen, Trash2, Reply, Search, Inbox as InboxIcon, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import PageHeader from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Inbox() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [query, setQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => api.get("/admin/messages").then(res => res.data),
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  const filtered = messages.filter(m => {
    if (unreadOnly && m.isRead) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.subject || "").toLowerCase().includes(q) ||
      m.body.toLowerCase().includes(q)
    );
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-messages"] });

  const handleExpand = async message => {
    if (expandedId === message.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(message.id);
    if (!message.isRead) {
      try {
        await api.patch(`/admin/messages/${message.id}/read`);
        invalidate();
      } catch {
        // silent — read status is a nicety, not worth interrupting the reading flow with a toast
      }
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this message? This can't be undone.")) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      toast.success("Message deleted");
      if (expandedId === id) setExpandedId(null);
      invalidate();
    } catch {
      toast.error("Couldn't delete — try again");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        title="Messages"
        description="Sent through your portfolio's contact form."
      />

      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="h-9 w-full pl-8 pr-3 rounded-lg text-[13px] outline-none"
            style={{ border: "1px solid var(--rule)", background: "var(--card)" }}
          />
        </div>
        <button
          onClick={() => setUnreadOnly(p => !p)}
          className="h-9 px-3.5 rounded-lg text-[12.5px] font-medium transition-colors"
          style={{
            border: `1px solid ${unreadOnly ? "var(--signal)" : "var(--rule)"}`,
            background: unreadOnly ? "color-mix(in oklch, var(--signal) 8%, transparent)" : "var(--card)",
            color: unreadOnly ? "var(--signal)" : "var(--foreground)",
          }}
        >
          Unread only
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: "var(--rule)", borderTopColor: "var(--signal)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title={messages.length === 0 ? "No messages yet" : "Nothing matches this search"}
          description={
            messages.length === 0
              ? "Messages sent through your contact form will show up here."
              : "Try a different search term or clear the unread filter."
          }
        />
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
          {filtered.map((message, i) => {
            const isOpen = expandedId === message.id;
            return (
              <div key={message.id} style={{ borderTop: i > 0 ? "1px solid var(--rule)" : "none" }}>
                <button
                  onClick={() => handleExpand(message)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-[var(--muted)]"
                  style={{ background: "var(--card)" }}
                >
                  <div className="shrink-0">
                    {message.isRead ? (
                      <MailOpen size={15} style={{ color: "var(--muted-foreground)" }} />
                    ) : (
                      <Mail size={15} style={{ color: "var(--signal)" }} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-1 md:gap-4 items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-[13.5px] truncate"
                        style={{ fontWeight: message.isRead ? 500 : 700, color: message.isRead ? "var(--muted-foreground)" : "var(--foreground)" }}
                      >
                        {message.name}
                      </span>
                      {!message.isRead && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--signal)" }} />}
                    </div>
                    <p className="text-[12.5px] truncate" style={{ color: "var(--muted-foreground)" }}>
                      {message.subject && <span style={{ color: "var(--foreground)" }}>{message.subject} — </span>}
                      {message.body.slice(0, 90)}
                    </p>
                  </div>

                  <span className="hidden sm:block text-[11.5px] shrink-0" style={{ color: "var(--muted-foreground)" }}>
                    {formatDate(message.receivedAt)}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={e => handleDelete(message.id, e)}
                      className="p-1.5 rounded-md hover:bg-[var(--background)]"
                      style={{ color: "var(--muted-foreground)" }}
                      aria-label="Delete message"
                    >
                      <Trash2 size={13} />
                    </button>
                    {isOpen ? (
                      <ChevronUp size={14} style={{ color: "var(--muted-foreground)" }} />
                    ) : (
                      <ChevronDown size={14} style={{ color: "var(--muted-foreground)" }} />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                      style={{ borderTop: "1px solid var(--rule)" }}
                    >
                      <div className="p-5" style={{ background: "var(--background)" }}>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] mb-4" style={{ color: "var(--muted-foreground)" }}>
                          <span>
                            From <span style={{ color: "var(--signal)" }}>{message.email}</span>
                          </span>
                          <span>{formatDate(message.receivedAt)}</span>
                        </div>

                        {message.subject && <h2 className="text-[14px] font-semibold mb-3">{message.subject}</h2>}

                        <p
                          className="text-[13px] leading-relaxed whitespace-pre-wrap rounded-lg p-4"
                          style={{ background: "var(--card)", border: "1px solid var(--rule)" }}
                        >
                          {message.body}
                        </p>

                        <a
                          href={`mailto:${message.email}?subject=Re: ${message.subject || "Your message"}`}
                          className="inline-flex items-center gap-1.5 mt-4 px-3.5 h-9 rounded-lg text-[12.5px] font-semibold transition-opacity hover:opacity-90"
                          style={{ background: "var(--signal)", color: "var(--background)" }}
                        >
                          <Reply size={13} />
                          Reply by email
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}