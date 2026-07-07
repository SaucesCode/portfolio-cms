export default function StatusDot({ active, activeLabel = "Live", inactiveLabel = "Draft" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium"
      style={{ color: active ? "var(--signal)" : "var(--muted-foreground)" }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: active ? "var(--signal)" : "var(--rule)" }}
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
