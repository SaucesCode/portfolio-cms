import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MailOpen, Trash2, Reply, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

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

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => api.get("/admin/messages").then(res => res.data),
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  const handleExpand = async message => {
    if (expandedId === message.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(message.id);

    if (!message.isRead) {
      try {
        await api.patch(`/admin/messages/${message.id}/read`);
        queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      } catch (error) {
        console.error("Failed to mark as read");
      }
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 select-none">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto selection:bg-primary/10 selection:text-primary px-2">
      {/* Page header */}
      <div className="mb-6 select-none">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xs font-black uppercase tracking-[0.25em] text-foreground">
            Inbound Transmission Registry
          </h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono uppercase tracking-wider font-bold">
              {unreadCount} unread node{unreadCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="text-[11px] font-mono text-muted-foreground">
          {messages.length} total structural data packets parsed through client telemetry
        </p>
      </div>

      {/* Expanded Wide Layout Message Container */}
      {messages.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card select-none">
          <Mail size={24} className="text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-[11px] font-mono text-muted-foreground/50 italic">
            Zero communications compiled inside queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 w-full">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`w-full border rounded-xl subpixel-antialiased transition-all duration-150 overflow-hidden
                ${
                  message.isRead
                    ? "bg-card border-border"
                    : "bg-card border-amber-500/20 shadow-sm shadow-amber-500/5"
                }`}
            >
              {/* Message Row Item Row — Configured for wide screen spaces */}
              <div
                className="flex items-center justify-between gap-6 p-4 cursor-pointer hover:bg-neutral-900/40 transition-colors"
                onClick={() => handleExpand(message)}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Status Indicator Icon */}
                  <div className="shrink-0 select-none">
                    {message.isRead ? (
                      <MailOpen size={13} className="text-neutral-600" />
                    ) : (
                      <Mail size={13} className="text-amber-400" />
                    )}
                  </div>

                  {/* Sender & Preview Meta Content Grid Segment */}
                  <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-6 items-center">
                    {/* Sender Identity Wrapper */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-xs truncate tracking-wide
                        ${message.isRead ? "text-neutral-400 font-normal" : "text-white font-bold"}`}
                      >
                        {message.name}
                      </span>
                      {!message.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </div>

                    {/* Preview Area Segment */}
                    <p className="text-[11px] font-mono text-neutral-500 truncate md:col-span-2">
                      {message.subject ? (
                        <>
                          <span
                            className={`${message.isRead ? "text-neutral-400" : "text-neutral-300 font-semibold"} mr-2`}
                          >
                            {message.subject}
                          </span>
                          <span className="text-neutral-600">—</span>{" "}
                          {message.body.slice(0, 80)}
                        </>
                      ) : (
                        message.body.slice(0, 100)
                      )}
                    </p>
                  </div>
                </div>

                {/* Operations Actions & Time Column Data Wrapper */}
                <div className="flex items-center gap-3 shrink-0 select-none">
                  <span className="text-[10px] font-mono text-neutral-500 hidden sm:block">
                    {formatDate(message.receivedAt)}
                  </span>

                  {/* Operational Removal Anchor */}
                  <button
                    onClick={e => handleDelete(message.id, e)}
                    className="p-1.5 text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Structural View Toggle Anchor */}
                  <div className="text-neutral-600 hidden sm:block">
                    {expandedId === message.id ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </div>
                </div>
              </div>

              {/* Smooth Drawer Expansion for Data Stream Reading View */}
              <AnimatePresence>
                {expandedId === message.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden border-t border-border/60 bg-neutral-950/40"
                  >
                    <div className="p-5 flex flex-col gap-4">
                      {/* Sub-header Details Trace Log Info */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[10px] font-mono text-neutral-500 border-b border-border/30 pb-3">
                        <span className="flex items-center gap-1.5">
                          <span className="text-neutral-600 uppercase tracking-wider font-bold">
                            Origin Path:
                          </span>
                          <span className="text-blue-400 select-all">{message.email}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-neutral-600 uppercase tracking-wider font-bold">
                            Timestamp:
                          </span>
                          <span>{formatDate(message.receivedAt)}</span>
                        </span>
                      </div>

                      {/* Expanded Headline Data Stream */}
                      {message.subject && (
                        <h2 className="text-xs font-bold text-white tracking-wide uppercase px-0.5">
                          Subject Matrix: {message.subject}
                        </h2>
                      )}

                      {/* Core Content Box Area */}
                      <p className="text-[11px] font-mono text-neutral-400 leading-relaxed whitespace-pre-wrap bg-neutral-950 border border-neutral-900 rounded-lg p-4 select-text shadow-inner">
                        {message.body}
                      </p>

                      {/* Local System Context Execution Redirect Trigger */}
                      <div className="flex select-none pt-1">
                        <a
                          href={`mailto:${message.email}?subject=Re: ${message.subject || "Your message"}`}
                          className="inline-flex items-center gap-1.5 px-3.5 h-9 bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-wider rounded-md transition-colors hover:bg-primary/90 cursor-pointer shadow-sm"
                        >
                          <Reply size={12} />
                          Dispatch Pipeline Response
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
