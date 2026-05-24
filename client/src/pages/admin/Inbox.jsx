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

  // Mark as read + expand the message
  const handleExpand = async message => {
    // Toggle — if already expanded, collapse it
    if (expandedId === message.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(message.id);

    // Only call the API if it's actually unread
    if (!message.isRead) {
      try {
        await api.patch(`/admin/messages/${message.id}/read`);
        queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
        queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      } catch (error) {
        console.error("Failed to mark as read");
      }
    }
  };

  const handleDelete = async (id, e) => {
    // Stop click from also triggering the expand handler
    e.stopPropagation();

    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      // Collapse if the deleted message was expanded
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">Inbox</h1>
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">
              {unreadCount} unread
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm">{messages.length} total messages</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16">
          <Mail size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No messages yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden
                ${
                  message.isRead
                    ? "bg-gray-900 border-white/5"
                    : "bg-gray-900 border-blue-500/20 shadow-lg shadow-blue-500/5"
                }`}
            >
              {/* Message header — always visible, click to expand */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/2 transition-colors"
                onClick={() => handleExpand(message)}
              >
                {/* Read/unread icon */}
                <div className="flex-shrink-0">
                  {message.isRead ? (
                    <MailOpen size={16} className="text-gray-600" />
                  ) : (
                    <Mail size={16} className="text-blue-400" />
                  )}
                </div>

                {/* Sender info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-sm font-medium truncate
                      ${message.isRead ? "text-gray-300" : "text-white"}`}
                    >
                      {message.name}
                    </span>
                    {!message.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 truncate">
                      {message.subject || message.body.slice(0, 50) + "..."}
                    </p>
                  </div>
                </div>

                {/* Date + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-600 hidden sm:block">
                    {formatDate(message.receivedAt)}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={e => handleDelete(message.id, e)}
                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Expand chevron */}
                  <div className="text-gray-600">
                    {expandedId === message.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded message body */}
              <AnimatePresence>
                {expandedId === message.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-white/5 pt-4">
                      {/* Sender details */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Mail size={11} />
                          {message.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={11} />
                          {formatDate(message.receivedAt)}
                        </span>
                      </div>

                      {/* Subject */}
                      {message.subject && (
                        <p className="text-sm font-medium text-white mb-3">
                          {message.subject}
                        </p>
                      )}

                      {/* Message body */}
                      <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap mb-4">
                        {message.body}
                      </p>

                      {/* Reply button — opens mailto */}
                      <a
                        href={`mailto:${message.email}?subject=Re: ${message.subject || "Your message"}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
                      >
                        <Reply size={14} />
                        Reply to {message.name}
                      </a>
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
