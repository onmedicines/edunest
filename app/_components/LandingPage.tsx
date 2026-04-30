"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Presentation,
  ArrowRight,
  Video,
  Mic,
  Database,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  isAuthed: boolean;
  username: string | null;
}

interface Feature {
  title: string;
  desc: string;
  color: string;
}

const features: Feature[] = [
  {
    title: "Synced video",
    desc: "Everyone loads the same YouTube video; play, pause, and seek broadcast as ~100-byte events. No screen-share, no upload.",
    color: "var(--zen-sage)",
  },
  {
    title: "Live chat & reactions",
    desc: "Realtime messaging with emoji reactions and typing indicators on Supabase Realtime.",
    color: "var(--zen-blue-dark)",
  },
  {
    title: "Shared notes",
    desc: "Markdown notes with live presence. Updates fan out to everyone in the room, instantly.",
    color: "var(--deck-purple)",
  },
  {
    title: "Voice channel",
    desc: "Drop into a low-latency voice room without leaving your study session or switching apps.",
    color: "#e07a8b",
  },
  {
    title: "Pomodoro timer",
    desc: "A synchronized focus timer everyone in the room follows together — start, pause, skip.",
    color: "var(--deck-amber)",
  },
  {
    title: "Session goals",
    desc: "A lightweight shared todo list to keep the session honest and on track.",
    color: "#5cbeb0",
  },
];

const stack = [
  { name: "Next.js 16", desc: "App router, server actions" },
  { name: "Supabase", desc: "Auth, Postgres, Realtime" },
  { name: "WebRTC", desc: "Peer-to-peer voice" },
  { name: "YouTube IFrame", desc: "Synced playback" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function LandingPage({ isAuthed, username }: LandingPageProps) {
  const primaryHref = isAuthed ? "/rooms" : "/signup";
  const primaryLabel = isAuthed ? "Open your rooms" : "Get started";
  const [selectedFeature, setSelectedFeature] = useState(0);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--zen-bg)" }}>
      {/* ── Nav ── */}
      <header className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
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
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/presentation/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--zen-muted)" }}
          >
            <Presentation className="w-4 h-4" />
            Pitch deck
          </Link>
          {isAuthed ? (
            <Button asChild>
              <Link href="/rooms" className="flex items-center gap-1.5">
                Open rooms
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup" className="flex items-center gap-1.5">
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      {/* ── Hero (deck S1) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-12 text-center">
        {/* Sage radial glow behind the wordmark */}
        <div
          className="deck-glow zen-anim-pulse-glow"
          style={{
            width: 700,
            height: 360,
            position: "absolute",
            top: "38%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="deck-eyebrow muted relative"
        >
          {isAuthed && username ? `Welcome back, ${username}` : "Introducing"}
        </motion.div>

        <h1
          className="deck-wordmark mt-3 relative"
          style={{
            fontSize: "clamp(64px, 10vw, 110px)",
            fontWeight: "black",
            color: "var(--zen-text)",
          }}
        >
          {"Edu".split("").map((c, i) => (
            <motion.span
              key={`e-${i}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 * i, ease: [0.2, 0.8, 0.2, 1] }}
              className="inline-block font-black"
            >
              {c}
            </motion.span>
          ))}
          {"Nest".split("").map((c, i) => (
            <motion.span
              key={`n-${i}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 * (i + 3), ease: [0.2, 0.8, 0.2, 1] }}
              className="inline-block accent-letter font-black"
              style={{ color: "var(--zen-sage)" }}
            >
              {c}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative mt-6 max-w-xl mx-auto text-base sm:text-lg"
          style={{ color: "var(--zen-muted)" }}
        >
          A collaborative study room — built for focus, not chaos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative mt-8 flex flex-wrap gap-12 justify-center"
        >
          <span className="deck-chip deck-chip-green">Study-first</span>
          <span className="deck-chip deck-chip-blue">Real-time</span>
          <span className="deck-chip deck-chip-purple">Distraction-free</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="relative mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Button asChild size="lg">
            <Link href={primaryHref} className="flex items-center gap-2 group">
              {primaryLabel}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link
              href="/presentation/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Presentation className="w-4 h-4" />
              View pitch deck
            </Link>
          </Button>
        </motion.div>

        {/* Mock product chrome */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="relative mt-14 mx-auto max-w-4xl text-left"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid var(--zen-border)",
              boxShadow: "0 40px 100px -30px rgba(0,0,0,0.6)",
              background: "var(--zen-surface)",
            }}
          >
            <div
              className="flex items-center gap-1.5 px-4 py-2.5"
              style={{
                borderBottom: "1px solid var(--zen-border)",
                background: "var(--zen-surface-2)",
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--zen-error)" }}
              />
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--deck-amber)" }}
              />
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--zen-sage)" }}
              />
              <span className="ml-3 font-mono text-xs" style={{ color: "var(--zen-muted)" }}>
                study-room.app/room/quiet-glade
              </span>
              <span
                className="ml-auto deck-chip deck-chip-green"
                style={{ padding: "2px 8px", fontSize: 10 }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--zen-sage)" }}
                />
                Live
              </span>
            </div>
            <div className="grid grid-cols-12">
              <div
                className="col-span-3 hidden sm:flex flex-col gap-2.5 p-4"
                style={{
                  borderRight: "1px solid var(--zen-border)",
                  background: "var(--zen-surface-2)",
                }}
              >
                <div className="deck-eyebrow muted text-[10px]">Online · 4</div>
                {[
                  { n: "Anya", c: "var(--zen-sage)" },
                  { n: "Beto", c: "var(--zen-blue)" },
                  { n: "Cleo", c: "var(--deck-purple)" },
                  { n: "Devi", c: "var(--deck-amber)" },
                ].map((u, i) => (
                  <div key={u.n} className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full text-xs flex items-center justify-center font-semibold"
                      style={{
                        background: u.c,
                        color: "#0a0d12",
                      }}
                    >
                      {u.n[0]}
                    </div>
                    <span className="text-xs" style={{ color: "var(--zen-text)" }}>
                      {u.n}
                    </span>
                    {i === 1 && (
                      <Mic className="w-3 h-3 ml-auto" style={{ color: "var(--zen-sage)" }} />
                    )}
                  </div>
                ))}
              </div>
              <div className="col-span-12 sm:col-span-9 p-5 space-y-3">
                <div className="flex gap-2 text-xs">
                  {["Chat", "Notes", "Watch", "Resources"].map((t, i) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md font-medium"
                      style={{
                        background: i === 0 ? "var(--zen-sage-light)" : "transparent",
                        color: i === 0 ? "var(--zen-sage)" : "var(--zen-muted)",
                        border:
                          i === 0 ? "1px solid var(--deck-accent-dim)" : "1px solid transparent",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {[
                  { who: "Anya", c: "var(--zen-sage)", m: "Let's start with chapter 4." },
                  { who: "Beto", c: "var(--zen-blue)", m: "Queued the lecture video — t=0:12." },
                  { who: "Cleo", c: "var(--deck-purple)", m: "Notes are open, taking lead." },
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.18 }}
                    className="flex items-start gap-2"
                  >
                    <div
                      className="w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-semibold flex-shrink-0"
                      style={{ background: row.c, color: "#0a0d12" }}
                    >
                      {row.who[0]}
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-2xl rounded-tl-sm text-xs"
                      style={{
                        background: "var(--zen-surface-2)",
                        color: "var(--zen-text)",
                        border: "1px solid var(--zen-border)",
                      }}
                    >
                      {row.m}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-12">
        <div className="text-center mb-12">
          <div className="deck-eyebrow muted">What's inside</div>
          <h2
            className="mt-3 font-extrabold tracking-tight"
            style={{
              color: "var(--zen-text)",
              fontSize: "clamp(28px, 4vw, 48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Everything you need <span style={{ color: "var(--zen-sage)" }}>in one room.</span>
          </h2>
          <div className="deck-divider mx-auto mt-5" />
        </div>
        {/* Fanned card hand — desktop */}
        <div
          className="hidden lg:flex justify-center items-end relative mx-auto"
          style={{ minHeight: 460, perspective: 1200, paddingTop: 40, paddingBottom: 60 }}
        >
          {features.map((f, i) => {
            // 6 cards: offsets -2.5..2.5 → rotation -15deg..15deg
            const offset = i - (features.length - 1) / 2;
            const rot = offset * 6;
            // held-in-hand curve: center cards high, edges droop down (positive y = lower)
            const baseY = Math.pow(offset, 2) * 8;
            const isSelected = selectedFeature === i;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 60, rotate: 0 }}
                animate={{
                  opacity: 1,
                  y: baseY,
                  rotate: isSelected ? 0 : rot,
                  scale: isSelected ? 1.15 : 1,
                  zIndex: isSelected ? 50 : i + 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 22,
                }}
                style={{
                  marginLeft: i === 0 ? 0 : -110,
                  transformOrigin: "50% 100%",
                  width: 260,
                  height: 280,
                }}
                className="zen-card p-5 flex flex-col"
              >
                <span
                  className="block w-8 h-[3px] rounded-full mb-4"
                  style={{ background: f.color }}
                  aria-hidden
                />
                <h3
                  className="font-extrabold text-lg tracking-tight"
                  style={{ color: f.color, letterSpacing: "-0.01em" }}
                >
                  {f.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{
                    color: "var(--zen-muted)",
                    display: "-webkit-box",
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Card switcher buttons (desktop) */}
        <div className="hidden lg:flex justify-center flex-wrap gap-2 mt-2 mb-2">
          {features.map((f, i) => {
            const isActive = selectedFeature === i;
            return (
              <button
                key={f.title}
                type="button"
                onClick={() => setSelectedFeature(i)}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  background: isActive ? f.color : "var(--zen-surface-2)",
                  color: isActive ? "#0a0d12" : f.color,
                  border: `1px solid ${isActive ? f.color : "var(--zen-border)"}`,
                  letterSpacing: "0.02em",
                }}
              >
                {f.title}
              </button>
            );
          })}
        </div>

        {/* Grid fallback — mobile / tablet */}
        <div
          className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          style={{ gridAutoRows: "1fr" }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className="zen-card p-5 sm:p-6 transition-colors h-full flex flex-col"
              style={{ borderColor: "var(--zen-border)" }}
            >
              <span
                className="block w-8 h-[3px] rounded-full mb-4"
                style={{ background: f.color }}
                aria-hidden
              />
              <h3
                className="font-extrabold text-lg tracking-tight"
                style={{ color: f.color, letterSpacing: "-0.01em" }}
              >
                {f.title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{
                  color: "var(--zen-muted)",
                  display: "-webkit-box",
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tech stack strip (deck S11 vibe) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-12">
        <div className="text-center mb-6">
          <div className="deck-eyebrow muted">Built with</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stack.map((s) => (
            <div
              key={s.name}
              className="rounded-xl p-4 transition-colors hover:opacity-100"
              style={{
                background: "var(--zen-surface-2)",
                border: "1px solid var(--zen-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {s.name.startsWith("Next") && (
                  <Radio className="w-3.5 h-3.5" style={{ color: "var(--zen-sage)" }} />
                )}
                {s.name.startsWith("Supabase") && (
                  <Database className="w-3.5 h-3.5" style={{ color: "var(--zen-sage)" }} />
                )}
                {s.name.startsWith("WebRTC") && (
                  <Mic className="w-3.5 h-3.5" style={{ color: "var(--zen-sage)" }} />
                )}
                {s.name.startsWith("YouTube") && (
                  <Video className="w-3.5 h-3.5" style={{ color: "var(--zen-sage)" }} />
                )}
                <span className="font-semibold text-sm" style={{ color: "var(--zen-text)" }}>
                  {s.name}
                </span>
              </div>
              <span className="font-mono text-[11px]" style={{ color: "var(--zen-muted)" }}>
                {s.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing CTA (deck S12) ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-20">
        <div
          className="relative rounded-2xl p-10 sm:p-14 text-center overflow-hidden"
          style={{
            background: "var(--zen-surface)",
            border: "1px solid var(--zen-border)",
          }}
        >
          <div
            className="deck-glow zen-anim-pulse-glow"
            style={{
              width: 600,
              height: 300,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            aria-hidden
          />
          <div className="relative">
            <div className="deck-eyebrow">Ready when you are</div>
            <h3
              className="mt-3 font-extrabold tracking-tight"
              style={{
                color: "var(--zen-text)",
                fontSize: "clamp(28px, 4vw, 44px)",
                letterSpacing: "-0.02em",
              }}
            >
              Study together — <span style={{ color: "var(--zen-sage)" }}>without the chaos.</span>
            </h3>
            <p className="mt-3 text-sm sm:text-base" style={{ color: "var(--zen-muted)" }}>
              Spin up a room in seconds. Invite your group with a 6-character code.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href={primaryHref} className="flex items-center gap-2">
                  {primaryLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link
                  href="/presentation/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Presentation className="w-4 h-4" />
                  Pitch deck
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: "1px solid var(--zen-border)" }}
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--zen-muted)" }}>
          <BookOpen className="w-4 h-4" />
          EduNest — built for focus, not chaos.
        </div>
        <Link
          href="/presentation/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:underline flex items-center gap-1.5 font-mono"
          style={{ color: "var(--zen-muted)" }}
        >
          <Presentation className="w-3.5 h-3.5" />
          /presentation
        </Link>
      </footer>
    </div>
  );
}
