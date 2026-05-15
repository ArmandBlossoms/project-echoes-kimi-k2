export default function Page() {
  return (
    <section className="px-8 py-16">
      <h1
        className="text-6xl leading-tight"
        style={{
          fontFamily: "var(--font-display), serif",
          color: "var(--fg-1)",
        }}
      >
        Voices of care-experienced Wales.
      </h1>
      <p className="mt-6 max-w-prose text-lg" style={{ color: "var(--fg-2)" }}>
        Echoes surfaces what care-experienced children and young people across Wales are telling
        Voices From Care Cymru — by topic, by region, by source — and what the Young People&apos;s
        Advisory Boards are asking for in response.
      </p>
      <p
        className="mt-3 text-xs uppercase tracking-widest"
        style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono), monospace" }}
      >
        Phase 3 scaffold · dashboard and 3D hero land in later phases
      </p>
    </section>
  );
}
