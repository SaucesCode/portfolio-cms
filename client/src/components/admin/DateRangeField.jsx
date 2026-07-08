export default function DateRangeField({
  startDate,
  endDate,
  isCurrent,
  onChange,
  currentLabel = "This is my current role",
}) {
  const inputClass = "w-full px-3 h-9 rounded-lg text-[13px] outline-none";
  const inputStyle = { border: "1px solid var(--rule)", background: "var(--background)" };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-medium mb-1.5">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => onChange({ startDate: e.target.value })}
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1.5">
            End date{" "}
            {isCurrent && <span style={{ color: "var(--muted-foreground)" }}>(ongoing)</span>}
          </label>
          <input
            type="date"
            value={isCurrent ? "" : endDate}
            onChange={e => onChange({ endDate: e.target.value })}
            disabled={isCurrent}
            className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
            style={inputStyle}
          />
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-4 px-3.5 h-11 rounded-lg"
        style={{ border: "1px solid var(--rule)" }}
      >
        <span className="text-[13px] font-medium">{currentLabel}</span>
        <button
          type="button"
          onClick={() =>
            onChange({ isCurrent: !isCurrent, endDate: !isCurrent ? "" : endDate })
          }
          className="relative w-9 h-5 rounded-full shrink-0 transition-colors"
          style={{ background: isCurrent ? "var(--signal)" : "var(--muted)" }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform"
            style={{
              background: "var(--background)",
              transform: isCurrent ? "translateX(16px)" : "translateX(0)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
