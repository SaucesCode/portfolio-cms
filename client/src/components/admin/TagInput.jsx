import { useState } from "react";
import { X } from "lucide-react";

export default function TagInput({
  value = [],
  onChange,
  placeholder = "Add and press Enter",
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim();
    if (!v || value.includes(v)) return setDraft("");
    onChange([...value, v]);
    setDraft("");
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-lg"
      style={{ border: "1px solid var(--rule)", background: "var(--background)" }}
    >
      {value.map((tag, i) => (
        <span
          key={tag}
          className="flex items-center gap-1 pl-2 pr-1 h-6 rounded-md text-[12px] font-medium"
          style={{ background: "var(--muted)" }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="p-0.5 rounded-sm hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
            aria-label={`Remove ${tag}`}
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={value.length ? "" : placeholder}
        className="flex-1 min-w-[100px] bg-transparent outline-none text-[13px] py-0.5"
      />
    </div>
  );
}
