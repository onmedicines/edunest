import Link from "next/link";
import { BookOpen } from "lucide-react";
import { StudySceneArt } from "./_components/StudySceneArt";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen grid lg:grid-cols-2"
      style={{ background: "var(--zen-bg)" }}
    >
      {/* Left — illustrated study scene */}
      <div className="hidden lg:block relative">
        <StudySceneArt />
      </div>

      {/* Right — form column */}
      <div className="flex flex-col min-h-screen relative">
        {/* Mobile-only header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--zen-sage-light)",
                border: "1px solid var(--deck-accent-dim)",
              }}
            >
              <BookOpen className="w-5 h-5" style={{ color: "var(--zen-sage)" }} />
            </div>
            <span
              className="font-semibold text-base tracking-tight"
              style={{ color: "var(--zen-text)" }}
            >
              EduNest
            </span>
          </Link>
        </div>

        {/* Desktop top-right home link */}
        <div className="hidden lg:flex absolute top-6 right-8 z-10">
          <Link
            href="/"
            className="text-sm hover:underline"
            style={{ color: "var(--zen-muted)" }}
          >
            ← Back home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
