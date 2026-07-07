const STATUS_META = {
  DRAFT: { label: "Draft", tone: "muted" },
  SCHEDULED: { label: "Scheduled", tone: "signal" },
  PUBLISHED: { label: "Published", tone: "signal" },
  ARCHIVED: { label: "Archived", tone: "muted" },
};

function formatWhen(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const isFuture = d > new Date();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(isFuture && { hour: "numeric", minute: "2-digit" }) });
}

export default function PublishBadge({ status, scheduledAt, publishedAt }) {
  const meta = STATUS_META[status] || STATUS_META.DRAFT;
  const detail =
    status === "SCHEDULED" && scheduledAt
      ? `for ${formatWhen(scheduledAt)}`
      : status === "PUBLISHED" && publishedAt
        ? `since ${formatWhen(publishedAt)}`
        : null;

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap">
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ background: meta.tone === "signal" ? "var(--signal)" : "var(--muted-foreground)" }}
      />
      <span style={{ color: meta.tone === "signal" ? "var(--signal)" : "var(--muted-foreground)" }}>{meta.label}</span>
      {detail && (
        <span style={{ color: "var(--muted-foreground)" }}>{detail}</span>
      )}
    </span>
  );
}   