import Link from "next/link";
import { SignupForm } from "./_components/SignupForm";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="deck-eyebrow">Get started</div>
        <h1
          className="font-extrabold tracking-tight"
          style={{
            color: "var(--zen-text)",
            fontSize: "clamp(28px, 3.5vw, 40px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          Create your <span style={{ color: "var(--zen-sage)" }}>account.</span>
        </h1>
        <p className="text-sm pt-1" style={{ color: "var(--zen-muted)" }}>
          Start a quiet, focused session with your group.
        </p>
      </div>
      <SignupForm />
      <p className="text-sm" style={{ color: "var(--zen-muted)" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium hover:underline"
          style={{ color: "var(--zen-sage-dark)" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
