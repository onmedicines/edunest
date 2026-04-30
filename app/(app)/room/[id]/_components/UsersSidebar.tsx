"use client";

import { Hand, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials, generateAvatarColor } from "@/lib/utils";
import type { PresenceUser } from "@/types/database";
import type { VoiceParticipant } from "@/lib/realtime/types";
import { VoiceChannel } from "./VoiceChannel";

interface UsersSidebarProps {
  users: PresenceUser[];
  currentUserId: string;
  isHandRaised: boolean;
  onHandToggle: (raised: boolean) => void;
  // Voice
  voiceConnected: boolean;
  voiceSpeaking: boolean;
  voiceParticipants: VoiceParticipant[];
  onVoiceConnect: () => Promise<void>;
  onVoiceDisconnect: () => void;
  // Mobile drawer
  open: boolean;
  onClose: () => void;
}

export function UsersSidebar({
  users,
  currentUserId,
  isHandRaised,
  onHandToggle,
  voiceConnected,
  voiceSpeaking,
  voiceParticipants,
  onVoiceConnect,
  onVoiceDisconnect,
  open,
  onClose,
}: UsersSidebarProps) {
  // Build a set of speaking user ids for fast lookup
  const speakingIds = new Set(
    voiceParticipants.filter((p) => p.isSpeaking).map((p) => p.userId)
  );

  return (
    <aside
      className={`flex-shrink-0 flex flex-col border-r transition-transform z-40 lg:relative lg:w-48 lg:translate-x-0 fixed inset-y-0 left-0 w-64 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
      style={{
        background: "var(--zen-surface)",
        borderColor: "var(--zen-border)",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "var(--zen-border)" }}
      >
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--zen-muted)" }}>
          Online · {users.length}
        </span>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded hover:opacity-70"
          aria-label="Close users panel"
          style={{ color: "var(--zen-muted)" }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* User list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {users.map((user) => {
            const isMe = user.userId === currentUserId;
            const initials = getInitials(user.username);
            const avatarBg = generateAvatarColor(user.userId);
            const isSpeaking = speakingIds.has(user.userId);

            return (
              <div
                key={user.userId}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{
                  background: isMe ? "var(--zen-sage-light)" : "transparent",
                }}
              >
                <div className="relative flex-shrink-0">
                  <Avatar
                    className="w-7 h-7"
                    style={
                      isSpeaking
                        ? { outline: "2px solid var(--zen-sage)", outlineOffset: "1px" }
                        : undefined
                    }
                  >
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.username} />}
                    <AvatarFallback style={{ background: avatarBg }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online dot */}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
                    style={{ background: "#52c41a" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--zen-text)" }}>
                    {user.username}
                    {isMe && (
                      <span className="ml-1" style={{ color: "var(--zen-muted)" }}>(you)</span>
                    )}
                  </p>
                </div>
                {user.isHandRaised && (
                  <span className="text-sm flex-shrink-0" title={`${user.username} raised their hand`}>
                    ✋
                  </span>
                )}
              </div>
            );
          })}

          {users.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: "var(--zen-muted)" }}>
              No one online yet
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Voice channel */}
      <VoiceChannel
        isConnected={voiceConnected}
        isSpeaking={voiceSpeaking}
        participants={voiceParticipants}
        currentUserId={currentUserId}
        onConnect={onVoiceConnect}
        onDisconnect={onVoiceDisconnect}
      />

      {/* Hand raise button */}
      <div className="p-3 border-t" style={{ borderColor: "var(--zen-border)" }}>
        <Button
          variant={isHandRaised ? "default" : "secondary"}
          size="sm"
          className="w-full gap-1.5"
          onClick={() => onHandToggle(!isHandRaised)}
        >
          <Hand className="w-3.5 h-3.5" />
          {isHandRaised ? "Lower hand" : "Raise hand"}
        </Button>
      </div>
    </aside>
  );
}
