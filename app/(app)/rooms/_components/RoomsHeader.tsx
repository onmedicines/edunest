"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, LogOut, Presentation } from "lucide-react";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

interface RoomsHeaderProps {
  username: string;
}

export function RoomsHeader({ username }: RoomsHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 relative z-10"
      style={{
        background: "var(--zen-surface)",
        borderBottom: "1px solid var(--zen-border)",
      }}
    >
      <Link href="/" className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "var(--zen-sage-light)",
            border: "1px solid var(--deck-accent-dim)",
          }}
        >
          <BookOpen className="w-5 h-5" style={{ color: "var(--zen-sage)" }} />
        </span>
        <span
          className="font-semibold text-base sm:text-lg truncate tracking-tight"
          style={{ color: "var(--zen-text)" }}
        >
          EduNest
        </span>
        <span
          className="hidden sm:inline-flex font-mono text-[10px] px-1.5 py-0.5 rounded ml-1"
          style={{
            color: "var(--zen-muted)",
            border: "1px solid var(--zen-border)",
            background: "var(--zen-surface-2)",
          }}
        >
          v0.1
        </span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          href="/presentation/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
          style={{ color: "var(--zen-muted)" }}
          title="Pitch deck"
        >
          <Presentation className="w-3.5 h-3.5" />
          <span className="font-mono">/deck</span>
        </Link>
        <span
          className="text-sm hidden sm:inline truncate max-w-40"
          style={{ color: "var(--zen-muted)" }}
        >
          {username}
        </span>
        <form action={logout}>
          <Button variant="ghost" size="icon-sm" type="submit" title="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </motion.header>
  );
}
