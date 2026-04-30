import Link from "next/link";
import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="deck-eyebrow">Sign in</div>
        <h1
          className="font-extrabold tracking-tight"
          style={{
            color: "var(--zen-text)",
            fontSize: "clamp(28px, 3.5vw, 40px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          Welcome <span style={{ color: "var(--zen-sage)" }}>back.</span>
        </h1>
        <p className="text-sm pt-1" style={{ color: "var(--zen-muted)" }}>
          Sign in to rejoin your study rooms.
        </p>
      </div>
      <LoginForm />
      <p className="text-sm" style={{ color: "var(--zen-muted)" }}>
        No account?{" "}
        <Link
          href="/signup"
          className="font-medium hover:underline"
          style={{ color: "var(--zen-sage-dark)" }}
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
