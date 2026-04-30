"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, History } from "lucide-react";
import type { Room } from "@/types/database";

interface RoomsListProps {
  rooms: Room[];
}

export function RoomsList({ rooms }: RoomsListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="zen-card p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <span className="deck-icon-circle green" style={{ width: 32, height: 32 }}>
          <History className="w-4 h-4" />
        </span>
        <div>
          <div className="deck-eyebrow muted text-[10px]">History</div>
          <h2 className="font-bold text-base" style={{ color: "var(--zen-text)" }}>
            Recent rooms
          </h2>
        </div>
      </div>
      <div className="space-y-2">
        {rooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * i }}
            whileHover={{ x: 4 }}
          >
            <Link
              href={`/room/${room.id}`}
              className="flex items-center justify-between gap-3 p-3 rounded-lg transition-colors"
              style={{
                background: "var(--zen-surface-2)",
                border: "1px solid var(--zen-border)",
              }}
            >
              <div className="min-w-0 flex-1">
                <p
                  className="font-semibold text-sm truncate"
                  style={{ color: "var(--zen-text)" }}
                >
                  {room.name}
                </p>
                {room.description && (
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: "var(--zen-muted)" }}
                  >
                    {room.description}
                  </p>
                )}
              </div>
              <span
                className="font-mono text-xs font-semibold px-2 py-1 rounded shrink-0"
                style={{
                  background: "var(--zen-sage-light)",
                  color: "var(--zen-sage)",
                  border: "1px solid var(--deck-accent-dim)",
                  letterSpacing: "0.08em",
                }}
              >
                {room.code}
              </span>
              <ChevronRight
                className="w-4 h-4 shrink-0"
                style={{ color: "var(--zen-muted)" }}
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
