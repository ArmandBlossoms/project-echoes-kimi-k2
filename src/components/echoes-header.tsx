import Image from "next/image";
import { DemoDataBadge } from "./demo-data-badge";

export function EchoesHeader() {
  return (
    <header
      data-testid="echoes-header"
      className="flex items-center justify-between gap-6 px-8 py-6"
      style={{ borderBottom: "1px solid var(--border-ink)" }}
    >
      <div className="flex items-center gap-4">
        <Image
          src="/vfcc-logo.png"
          alt="Voices From Care Cymru"
          width={64}
          height={64}
          priority
          className="h-16 w-auto"
        />
        <div className="flex flex-col leading-none">
          <span
            className="text-4xl"
            style={{
              fontFamily: "var(--font-display), serif",
              color: "var(--fg-1)",
              minWidth: "96px",
            }}
          >
            Echoes
            <span
              aria-hidden="true"
              className="mx-3 text-2xl align-middle"
              style={{ color: "var(--fg-3)" }}
            >
              ·
            </span>
            <span style={{ color: "var(--brand)" }}>Atseiniau</span>
          </span>
          <span
            className="mt-1 text-xs uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-mono), monospace",
              color: "var(--fg-3)",
            }}
          >
            6-month composite · Dec 2025 – May 2026
          </span>
        </div>
      </div>

      <DemoDataBadge />
    </header>
  );
}
