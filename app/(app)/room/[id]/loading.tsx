export default function RoomLoading() {
  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--zen-bg)" }}>
      {/* Header skeleton */}
      <div
        className="h-14 border-b px-4 flex items-center gap-3"
        style={{ background: "var(--zen-surface)", borderColor: "var(--zen-border)" }}
      >
        <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "var(--zen-border)" }} />
        <div className="h-4 w-40 rounded animate-pulse" style={{ background: "var(--zen-border)" }} />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-48 border-r p-3 space-y-2" style={{ background: "var(--zen-surface)", borderColor: "var(--zen-border)" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "var(--zen-border)" }} />
          ))}
        </div>
        {/* Main */}
        <div className="flex-1 flex flex-col">
          <div className="h-12 border-b animate-pulse" style={{ background: "var(--zen-border)", borderColor: "var(--zen-border)" }} />
          <div className="flex-1 p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "var(--zen-border)", opacity: 1 - i * 0.1 }} />
            ))}
          </div>
        </div>
        {/* Right sidebar */}
        <div className="w-52 border-l p-3 space-y-2" style={{ background: "var(--zen-surface)", borderColor: "var(--zen-border)" }}>
          {[1, 2].map((i) => (
            <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "var(--zen-border)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
