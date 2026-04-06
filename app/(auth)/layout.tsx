export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--zen-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ background: "var(--zen-sage-light)" }}>
            <span className="text-2xl">📚</span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--zen-text)" }}>
            Study Room
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--zen-muted)" }}>
            A calm space for focused group learning
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
