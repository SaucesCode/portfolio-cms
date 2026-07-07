const TABS = ["All", "Published", "Scheduled", "Draft", "Archived"];

export default function StatusTabs({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {TABS.map(tab => {
        const isActive = value === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className="px-3 h-8 rounded-md text-[12.5px] font-medium transition-colors"
            style={{
              background: isActive ? "var(--muted)" : "transparent",
              color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
