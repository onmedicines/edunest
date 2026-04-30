"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { Send, MessageCircle } from "lucide-react";
import { saveMessage } from "@/actions/messages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, generateAvatarColor } from "@/lib/utils";
import type { Message } from "@/types/database";

const REACTIONS = ["👍", "🔥", "💡", "❤️", "😂", "🎉"];

interface ChatProps {
  roomId: string;
  messages: Message[];
  currentUser: { id: string; username: string; avatarUrl: string | null };
  typingUsers: string[];
  onSendMessage: (
    content: string,
    saveFn: typeof saveMessage
  ) => Promise<void>;
  onReact: (messageId: string, emoji: string) => void;
  onTyping: () => void;
}

export function Chat({
  roomId,
  messages,
  currentUser,
  typingUsers,
  onSendMessage,
  onReact,
  onTyping,
}: ChatProps) {
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pickerId, setPickerId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const content = draft.trim();
    if (!content || content.length > 2000) return;
    setDraft("");
    startTransition(async () => {
      await onSendMessage(content, saveMessage);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charsLeft = 2000 - draft.length;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div ref={scrollRef} className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "var(--zen-sage-light)" }}
              >
                <MessageCircle
                  className="w-6 h-6"
                  style={{ color: "var(--zen-sage-dark)" }}
                />
              </div>
              <p className="text-sm" style={{ color: "var(--zen-muted)" }}>
                No messages yet. Say hello!
              </p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.user_id === currentUser.id;
            const initials = getInitials(msg.username);
            const avatarBg = generateAvatarColor(msg.user_id);
            const time = new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const hasReactions = Object.keys(msg.reactions ?? {}).length > 0;

            return (
              <div
                key={msg.id}
                className="group flex gap-2.5 items-start"
                onMouseEnter={() => setHoveredId(msg.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                  <AvatarFallback style={{ background: avatarBg }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isMe ? "var(--zen-sage-dark)" : "var(--zen-text)" }}
                    >
                      {isMe ? "You" : msg.username}
                    </span>
                    <span className="text-xs" style={{ color: "var(--zen-muted)" }}>
                      {time}
                    </span>
                  </div>
                  <p
                    className="text-sm break-words whitespace-pre-wrap leading-relaxed"
                    style={{ color: "var(--zen-text)" }}
                  >
                    {msg.content}
                  </p>

                  {/* Reactions display */}
                  {hasReactions && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(msg.reactions).map(([emoji, users]) => (
                        <button
                          key={emoji}
                          onClick={() => onReact(msg.id, emoji)}
                          className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full transition-colors"
                          style={{
                            background: (users as string[]).includes(currentUser.id)
                              ? "var(--zen-sage-light)"
                              : "var(--zen-surface-2)",
                            border: "1px solid var(--zen-border)",
                            color: "var(--zen-text)",
                          }}
                        >
                          {emoji} {(users as string[]).length}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Mobile reaction trigger + inline picker */}
                  <button
                    onClick={() =>
                      setPickerId(pickerId === msg.id ? null : msg.id)
                    }
                    className="md:hidden mt-1 text-xs"
                    style={{ color: "var(--zen-muted)" }}
                  >
                    {pickerId === msg.id ? "Close" : "+ React"}
                  </button>
                  {pickerId === msg.id && (
                    <div className="md:hidden flex flex-wrap gap-1 mt-1">
                      {REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onReact(msg.id, emoji);
                            setPickerId(null);
                          }}
                          className="text-base w-8 h-8 flex items-center justify-center rounded-lg"
                          style={{
                            background: "var(--zen-surface-2)",
                            border: "1px solid var(--zen-border)",
                          }}
                          aria-label={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reaction picker — hover-only, hidden on touch/mobile */}
                {hoveredId === msg.id && (
                  <div
                    className="hidden md:flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ flexShrink: 0 }}
                  >
                    {REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => onReact(msg.id, emoji)}
                        className="text-base w-7 h-7 flex items-center justify-center rounded-lg hover:scale-110 transition-transform"
                        style={{
                          background: "var(--zen-surface-2)",
                          border: "1px solid var(--zen-border)",
                        }}
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1">
          <p className="text-xs italic" style={{ color: "var(--zen-muted)" }}>
            {typingUsers.slice(0, 3).join(", ")}{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing…
          </p>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: "var(--zen-border)" }}>
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                onTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message…"
              maxLength={2000}
              rows={1}
              className="w-full resize-none rounded-lg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zen-sage)] transition-all"
              style={{
                background: "var(--zen-surface-2)",
                border: "1px solid var(--zen-border)",
                color: "var(--zen-text)",
                maxHeight: "120px",
              }}
              disabled={isPending}
            />
            {draft.length > 1800 && (
              <span
                className="absolute bottom-2 right-2 text-xs"
                style={{ color: charsLeft < 100 ? "var(--zen-error)" : "var(--zen-muted)" }}
              >
                {charsLeft}
              </span>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={!draft.trim() || isPending}
            className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40"
            style={{ background: "var(--zen-sage)", color: "white" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--zen-muted)" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
