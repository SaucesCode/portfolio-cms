export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b"
      style={{ borderColor: "var(--rule)" }}
    >
      <div>
        {eyebrow && (
          <p
            className="font-mono text-[11px] uppercase tracking-wider mb-1.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className="text-[22px] font-bold tracking-[-0.01em]"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-[13px] mt-1" style={{ color: "var(--muted-foreground)" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
