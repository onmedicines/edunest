"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Lamp,
  Sprout,
  Notebook,
  Clock,
  Coffee,
  Headphones,
  Zap,
  Lock,
  type LucideIcon,
} from "lucide-react";

type Tone = "green" | "blue" | "purple" | "amber";

interface Floater {
  Icon: LucideIcon;
  top: string;
  left: string;
  size: number;
  dur: number;
  delay: number;
  rot: number;
  tone: Tone;
}

const floaters: Floater[] = [
  { Icon: BookOpen,   top: "12%", left: "18%", size: 22, dur: 6,   delay: 0,    rot: -6, tone: "green"  },
  { Icon: Lamp,       top: "22%", left: "62%", size: 22, dur: 7.5, delay: 0.6,  rot: 4,  tone: "amber"  },
  { Icon: Notebook,   top: "44%", left: "12%", size: 20, dur: 6.8, delay: 0.3,  rot: 3,  tone: "blue"   },
  { Icon: Coffee,     top: "52%", left: "70%", size: 20, dur: 7,   delay: 0.9,  rot: -8, tone: "amber"  },
  { Icon: Sprout,     top: "70%", left: "26%", size: 22, dur: 8,   delay: 0.2,  rot: 2,  tone: "green"  },
  { Icon: Clock,      top: "30%", left: "40%", size: 18, dur: 9,   delay: 1.2,  rot: -3, tone: "purple" },
  { Icon: Headphones, top: "62%", left: "56%", size: 22, dur: 6.5, delay: 0.45, rot: 6,  tone: "purple" },
];

const dots = Array.from({ length: 10 }).map((_, i) => ({
  left: `${(i * 13 + 7) % 100}%`,
  size: 1 + (i % 3),
  dur: 14 + (i % 5) * 2,
  delay: i * 1.3,
}));

export function StudySceneArt() {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: "var(--zen-bg)" }}
    >
      {/* Sage radial glow — deck-style */}
      <div
        className="deck-glow zen-anim-pulse-glow"
        style={{
          width: 700,
          height: 500,
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        aria-hidden
      />
      {/* Secondary blue glow */}
      <motion.div
        aria-hidden
        className="absolute rounded-full blur-3xl"
        style={{
          width: 320,
          height: 320,
          left: "-10%",
          top: "10%",
          background: "rgba(74, 144, 184, 0.08)",
        }}
        animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating dust particles */}
      {dots.map((d, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute rounded-full"
          style={{
            left: d.left,
            bottom: -10,
            width: d.size,
            height: d.size,
            background: "var(--zen-sage)",
            opacity: 0.4,
          }}
          animate={{ y: ["0vh", "-110vh"], opacity: [0, 0.5, 0] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: "linear" }}
        />
      ))}

      {/* Floating icon objects — deck icon-circle style */}
      {floaters.map(({ Icon, top, left, size, dur, delay, rot, tone }, i) => (
        <motion.div
          key={i}
          aria-hidden
          className="absolute"
          style={{ top, left }}
          animate={{ y: [0, -14, 0], rotate: [rot, rot + 4, rot] }}
          transition={{ duration: dur, repeat: Infinity, delay, ease: "easeInOut" }}
        >
          <div className={`deck-icon-circle ${tone}`} style={{ width: 52, height: 52 }}>
            <Icon style={{ width: size, height: size }} strokeWidth={1.75} />
          </div>
        </motion.div>
      ))}

      {/* Brand block */}
      <div className="absolute inset-x-0 bottom-0 p-10 sm:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="deck-eyebrow muted mb-3"
        >
          A focused, real-time study room
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="deck-wordmark"
          style={{
            fontSize: "clamp(40px, 5vw, 64px)",
            color: "var(--zen-text)",
          }}
        >
          Edu<span className="accent-letter" style={{ color: "var(--zen-sage)" }}>Nest</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="deck-divider mt-4"
        />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-5 max-w-md text-sm sm:text-base"
          style={{ color: "var(--zen-muted)" }}
        >
          Synced video, shared notes, voice rooms, and a focus timer — built for study groups, not chaos.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-5 flex flex-wrap gap-2"
        >
          <span className="deck-chip deck-chip-green"><BookOpen className="w-3 h-3" /> Study-first</span>
          <span className="deck-chip deck-chip-blue"><Zap className="w-3 h-3" /> Real-time</span>
          <span className="deck-chip deck-chip-purple"><Lock className="w-3 h-3" /> Distraction-free</span>
        </motion.div>
      </div>
    </div>
  );
}
