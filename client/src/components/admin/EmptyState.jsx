export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-20 rounded-lg text-center"
      style={{ border: "1px dashed var(--rule)" }}
    >
      {Icon && <Icon size={20} style={{ color: "var(--muted-foreground)" }} />}
      <div>
        <p className="text-[14px] font-medium">{title}</p>
        {description && (
          <p className="text-[12.5px] mt-1" style={{ color: "var(--muted-foreground)" }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
