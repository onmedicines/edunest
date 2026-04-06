"use client";

import { Mic, MicOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VoiceParticipant } from "@/lib/realtime/types";

interface VoiceChannelProps {
  isConnected: boolean;
  isSpeaking: boolean;
  participants: VoiceParticipant[];
  currentUserId: string;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

export function VoiceChannel({
  isConnected,
  isSpeaking,
  participants,
  currentUserId,
  onConnect,
  onDisconnect,
}: VoiceChannelProps) {
  if (!isConnected) {
    return (
      <div className="p-3 border-t" style={{ borderColor: "var(--zen-border)" }}>
        <Button
          variant="secondary"
          size="sm"
          className="w-full gap-1.5"
          onClick={onConnect}
        >
          <Mic className="w-3.5 h-3.5" />
          Connect Voice
        </Button>
      </div>
    );
  }

  return (
    <div className="border-t" style={{ borderColor: "var(--zen-border)" }}>
      {/* Status bar */}
      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{ background: "var(--zen-surface-2)" }}
      >
        {isSpeaking ? (
          <span className="text-xs font-medium flex items-center gap-1.5 animate-pulse" style={{ color: "var(--zen-sage-dark)" }}>
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: "var(--zen-sage-dark)" }}
            />
            Speaking…
          </span>
        ) : (
          <span className="text-xs" style={{ color: "var(--zen-muted)" }}>
            Hold <kbd
              className="px-1 py-0.5 rounded text-xs font-mono border"
              style={{ borderColor: "var(--zen-border)", background: "var(--zen-surface)" }}
            >Space</kbd> to talk
          </span>
        )}
        <button
          onClick={onDisconnect}
          className="p-1 rounded-md transition-colors hover:opacity-70"
          style={{ color: "var(--zen-error)" }}
          title="Disconnect voice"
        >
          <PhoneOff className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Participant list */}
      {participants.length > 0 && (
        <div className="px-3 pb-2 space-y-0.5">
          {participants.map((p) => {
            const isMe = p.userId === currentUserId;
            return (
              <div
                key={p.userId}
                className="flex items-center justify-between py-0.5"
              >
                <span className="text-xs truncate" style={{ color: p.isSpeaking ? "var(--zen-sage-dark)" : "var(--zen-muted)" }}>
                  {p.username}
                  {isMe && <span style={{ color: "var(--zen-muted)" }}> (you)</span>}
                </span>
                {p.isSpeaking ? (
                  <Mic className="w-3 h-3 flex-shrink-0" style={{ color: "var(--zen-sage-dark)" }} />
                ) : (
                  <MicOff className="w-3 h-3 flex-shrink-0" style={{ color: "var(--zen-border)" }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
