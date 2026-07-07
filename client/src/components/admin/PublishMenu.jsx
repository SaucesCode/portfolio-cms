import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Calendar } from "lucide-react";

function actionsFor(status) {
  switch (status) {
    case "DRAFT":
      return [
        { key: "publish", label: "Publish now" },
        { key: "schedule", label: "Schedule…" },
      ];
    case "SCHEDULED":
      return [
        { key: "publish", label: "Publish now instead" },
        { key: "unpublish", label: "Move back to draft" },
      ];
    case "PUBLISHED":
      return [
        { key: "unpublish", label: "Unpublish" },
        { key: "archive", label: "Archive" },
      ];
    case "ARCHIVED":
      return [{ key: "unpublish", label: "Restore as draft" }];
    default:
      return [];
  }
}

export default function PublishMenu({ status, onAction }) {
  const [open, setOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [when, setWhen] = useState("");

  const actions = actionsFor(status);

  const run = key => {
    setOpen(false);
    if (key === "schedule") {
      setScheduling(true);
      return;
    }
    onAction(key);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="p-1.5 rounded-md hover:bg-[var(--muted)]"
        style={{ color: "var(--muted-foreground)" }}
        aria-label="Publishing actions"
      >
        <MoreHorizontal size={14} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 mt-1.5 w-48 rounded-lg overflow-hidden z-20"
              style={{
                background: "var(--card)",
                border: "1px solid var(--rule)",
                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.15)",
              }}
            >
              {actions.map(a => (
                <button
                  key={a.key}
                  onClick={() => run(a.key)}
                  className="w-full text-left px-3 h-9 text-[12.5px] transition-colors hover:bg-[var(--muted)]"
                >
                  {a.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scheduling && (
          <>
            <div
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.3)" }}
              onClick={() => setScheduling(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 w-80 p-5 rounded-lg"
              style={{ background: "var(--card)", border: "1px solid var(--rule)" }}
            >
              <p className="flex items-center gap-1.5 text-[13px] font-semibold mb-3">
                <Calendar size={14} /> Schedule for later
              </p>
              <input
                type="datetime-local"
                value={when}
                onChange={e => setWhen(e.target.value)}
                className="w-full px-3 h-9 rounded-md text-[13px] mb-3"
                style={{ border: "1px solid var(--rule)", background: "var(--background)" }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setScheduling(false)}
                  className="px-3 h-8 rounded-md text-[12px] font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!when) return;
                    onAction("schedule", new Date(when).toISOString());
                    setScheduling(false);
                  }}
                  className="px-3 h-8 rounded-md text-[12px] font-semibold"
                  style={{ background: "var(--signal)", color: "var(--background)" }}
                >
                  Schedule
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
