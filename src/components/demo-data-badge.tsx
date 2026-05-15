export function DemoDataBadge() {
  return (
    <span
      data-testid="demo-data-badge"
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
      style={{
        color: "var(--fg-1)",
        background: "var(--surface)",
        border: "2px solid var(--border-ink)",
        boxShadow: "var(--shadow-offset)",
      }}
    >
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: "var(--brand)" }}
      />
      Sample data — illustrative composite voices
    </span>
  );
}
