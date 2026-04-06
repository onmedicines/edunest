"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CHANNEL_NAME, EVENTS } from "@/lib/realtime/types";
import { getRemainingSeconds } from "@/lib/utils";
import type {
  Message, Resource, Todo, TimerState, VideoState,
  PresenceUser, Room,
} from "@/types/database";
import type {
  ChatNewPayload, ChatReactionPayload, NotesUpdatePayload,
  VideoStatePayload, TimerStatePayload, ResourceAddPayload,
  ResourceRemovePayload, TodoUpdatePayload, HandTogglePayload,
} from "@/lib/realtime/types";

import { Chat } from "./Chat";
import { Notes } from "./Notes";
import { VideoPlayer } from "./VideoPlayer";
import { Timer } from "./Timer";
import { UsersSidebar } from "./UsersSidebar";
import { ResourceLibrary } from "./ResourceLibrary";
import { TodoList } from "./TodoList";
import { RoomHeader } from "./RoomHeader";

// ── Types ──────────────────────────────────────────────────────────────────

interface CurrentUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  isGuest: boolean;
}

interface InitialState {
  messages: Message[];
  notes: string;
  resources: Resource[];
  todos: Todo[];
  timerState: TimerState;
  videoState: VideoState;
}

interface RoomShellProps {
  room: Room;
  currentUser: CurrentUser;
  initialState: InitialState;
}

type Tab = "chat" | "notes" | "video" | "resources";
type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

// ── Component ─────────────────────────────────────────────────────────────

export function RoomShell({ room, currentUser, initialState }: RoomShellProps) {
  // ── State ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>(initialState.messages);
  const [notes, setNotes] = useState(initialState.notes);
  const [resources, setResources] = useState<Resource[]>(initialState.resources);
  const [todos, setTodos] = useState<Todo[]>(initialState.todos);
  const [timerState, setTimerState] = useState<TimerState>(initialState.timerState);
  const [videoState, setVideoState] = useState<VideoState>(initialState.videoState);
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceUser>>({});
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  // ── Refs ───────────────────────────────────────────────────────────────
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const sentMessageIds = useRef<Set<string>>(new Set());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // ── Broadcast helpers ──────────────────────────────────────────────────
  const broadcast = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      channelRef.current?.send({ type: "broadcast", event, payload });
    },
    []
  );

  // ── Realtime setup ─────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;

    const channel = supabase.channel(CHANNEL_NAME(room.id), {
      config: { presence: { key: currentUser.id } },
    });

    // ── Presence ──
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceUser>();
      const map: Record<string, PresenceUser> = {};
      for (const [key, presences] of Object.entries(state)) {
        if (presences.length > 0) map[key] = presences[0];
      }
      setPresenceMap(map);
    });

    channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
      if (newPresences.length > 0) {
        setPresenceMap((prev) => ({ ...prev, [key]: newPresences[0] as unknown as PresenceUser }));
      }
    });

    channel.on("presence", { event: "leave" }, ({ key }) => {
      setPresenceMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    });

    // ── Chat ──
    channel.on<ChatNewPayload>(
      "broadcast",
      { event: EVENTS.CHAT_NEW },
      ({ payload }) => {
        if (sentMessageIds.current.has(payload.message.id)) return;
        setMessages((prev) => [...prev, payload.message]);
      }
    );

    channel.on<ChatReactionPayload>(
      "broadcast",
      { event: EVENTS.CHAT_REACTION },
      ({ payload }) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== payload.messageId) return m;
            const reactions = { ...m.reactions };
            const users = reactions[payload.emoji] ?? [];
            const hasReacted = users.includes(payload.userId);
            const updatedUsers = hasReacted
              ? users.filter((id) => id !== payload.userId)
              : [...users, payload.userId];
            if (updatedUsers.length === 0) {
              delete reactions[payload.emoji];
            } else {
              reactions[payload.emoji] = updatedUsers;
            }
            return { ...m, reactions };
          })
        );
      }
    );

    // ── Notes ──
    channel.on<NotesUpdatePayload>(
      "broadcast",
      { event: EVENTS.NOTES_UPDATE },
      ({ payload }) => {
        if (payload.updatedBy !== currentUser.id) {
          setNotes(payload.content);
        }
      }
    );

    // ── Video ──
    channel.on<VideoStatePayload>(
      "broadcast",
      { event: EVENTS.VIDEO_STATE },
      ({ payload }) => {
        if (payload.triggeredBy !== currentUser.id) {
          setVideoState({
            videoId: payload.videoId,
            isPlaying: payload.isPlaying,
            currentTime: payload.currentTime,
          });
        }
      }
    );

    // ── Timer ──
    channel.on<TimerStatePayload>(
      "broadcast",
      { event: EVENTS.TIMER_STATE },
      ({ payload }) => {
        setTimerState({
          startedAt: payload.startedAt,
          duration: payload.duration,
          isRunning: payload.isRunning,
          remainingAtPause: payload.remainingAtPause,
        });
      }
    );

    // ── Resources ──
    channel.on<ResourceAddPayload>(
      "broadcast",
      { event: EVENTS.RESOURCE_ADD },
      ({ payload }) => {
        setResources((prev) => [...prev, payload.resource]);
      }
    );

    channel.on<ResourceRemovePayload>(
      "broadcast",
      { event: EVENTS.RESOURCE_REMOVE },
      ({ payload }) => {
        setResources((prev) => prev.filter((r) => r.id !== payload.resourceId));
      }
    );

    // ── Todos ──
    channel.on<TodoUpdatePayload>(
      "broadcast",
      { event: EVENTS.TODO_UPDATE },
      ({ payload }) => {
        setTodos(payload.todos);
      }
    );

    // ── Hand raise ──
    channel.on<HandTogglePayload>(
      "broadcast",
      { event: EVENTS.HAND_TOGGLE },
      ({ payload }) => {
        setPresenceMap((prev) => {
          if (!prev[payload.userId]) return prev;
          return {
            ...prev,
            [payload.userId]: { ...prev[payload.userId], isHandRaised: payload.isRaised },
          };
        });
      }
    );

    // ── Typing (via presence update) ──
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceUser & { isTyping?: boolean }>();
      const typing: string[] = [];
      for (const [key, presences] of Object.entries(state)) {
        if (key !== currentUser.id && presences[0]?.isTyping) {
          typing.push(presences[0].username);
        }
      }
      setTypingUsers(typing);
    });

    // ── Subscribe ──
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setConnectionStatus("connected");
        await channel.track({
          userId: currentUser.id,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          isHandRaised: false,
          joinedAt: new Date().toISOString(),
        });
      } else if (status === "CHANNEL_ERROR") {
        setConnectionStatus("reconnecting");
      } else if (status === "CLOSED") {
        setConnectionStatus("disconnected");
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, currentUser.id, currentUser.username, currentUser.avatarUrl]);

  // ── Typing indicator helpers ───────────────────────────────────────────
  const sendTypingStart = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      channelRef.current?.track({
        userId: currentUser.id,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        isHandRaised: false,
        isTyping: true,
        joinedAt: new Date().toISOString(),
      });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      channelRef.current?.track({
        userId: currentUser.id,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        isHandRaised: false,
        isTyping: false,
        joinedAt: new Date().toISOString(),
      });
    }, 2000);
  }, [currentUser]);

  // ── Send message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, saveMessage: (roomId: string, content: string, username: string) => Promise<{ data?: Message; error?: string }>) => {
      const { data, error } = await saveMessage(room.id, content, currentUser.username);
      if (error || !data) return;
      sentMessageIds.current.add(data.id);
      setMessages((prev) => [...prev, data]);
      broadcast(EVENTS.CHAT_NEW, { message: data });
    },
    [room.id, currentUser.username, broadcast]
  );

  // ── React to message ───────────────────────────────────────────────────
  const reactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      broadcast(EVENTS.CHAT_REACTION, {
        messageId,
        userId: currentUser.id,
        emoji,
      });
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const reactions = { ...m.reactions };
          const users = reactions[emoji] ?? [];
          const hasReacted = users.includes(currentUser.id);
          const updatedUsers = hasReacted
            ? users.filter((id) => id !== currentUser.id)
            : [...users, currentUser.id];
          if (updatedUsers.length === 0) {
            delete reactions[emoji];
          } else {
            reactions[emoji] = updatedUsers;
          }
          return { ...m, reactions };
        })
      );
    },
    [currentUser.id, broadcast]
  );

  // ── Notes update ───────────────────────────────────────────────────────
  const handleNotesChange = useCallback(
    (content: string) => {
      setNotes(content);
      broadcast(EVENTS.NOTES_UPDATE, { content, updatedBy: currentUser.id });
    },
    [currentUser.id, broadcast]
  );

  // ── Video sync ─────────────────────────────────────────────────────────
  const handleVideoChange = useCallback(
    (newState: Partial<VideoState>) => {
      setVideoState((prev) => ({ ...prev, ...newState }));
      broadcast(EVENTS.VIDEO_STATE, {
        ...videoState,
        ...newState,
        triggeredBy: currentUser.id,
      });
    },
    [videoState, currentUser.id, broadcast]
  );

  // ── Timer sync ─────────────────────────────────────────────────────────
  const handleTimerChange = useCallback(
    async (newState: TimerState, updateRoomState: (roomId: string, state: TimerState) => Promise<void>) => {
      setTimerState(newState);
      broadcast(EVENTS.TIMER_STATE, { ...newState, triggeredBy: currentUser.id });
      await updateRoomState(room.id, newState);
    },
    [room.id, currentUser.id, broadcast]
  );

  // ── Resource actions ───────────────────────────────────────────────────
  const handleResourceAdd = useCallback(
    (resource: Resource) => {
      setResources((prev) => [...prev, resource]);
      broadcast(EVENTS.RESOURCE_ADD, { resource });
    },
    [broadcast]
  );

  const handleResourceRemove = useCallback(
    (resourceId: string) => {
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      broadcast(EVENTS.RESOURCE_REMOVE, { resourceId });
    },
    [broadcast]
  );

  // ── Todo actions ───────────────────────────────────────────────────────
  const handleTodosChange = useCallback(
    (newTodos: Todo[]) => {
      setTodos(newTodos);
      broadcast(EVENTS.TODO_UPDATE, { todos: newTodos });
    },
    [broadcast]
  );

  // ── Hand raise ─────────────────────────────────────────────────────────
  const handleHandToggle = useCallback(
    (isRaised: boolean) => {
      broadcast(EVENTS.HAND_TOGGLE, { userId: currentUser.id, isRaised });
      setPresenceMap((prev) => {
        if (!prev[currentUser.id]) return prev;
        return {
          ...prev,
          [currentUser.id]: { ...prev[currentUser.id], isHandRaised: isRaised },
        };
      });
      channelRef.current?.track({
        userId: currentUser.id,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        isHandRaised: isRaised,
        joinedAt: new Date().toISOString(),
      });
    },
    [currentUser, broadcast]
  );

  const isHandRaised = presenceMap[currentUser.id]?.isHandRaised ?? false;
  const onlineUsers = Object.values(presenceMap);

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "chat", label: "Chat", emoji: "💬" },
    { id: "notes", label: "Notes", emoji: "📝" },
    { id: "video", label: "Watch", emoji: "▶️" },
    { id: "resources", label: "Resources", emoji: "🔗" },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--zen-bg)" }}>
      {/* Header */}
      <RoomHeader
        room={room}
        currentUser={currentUser}
        connectionStatus={connectionStatus}
        onlineCount={onlineUsers.length}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Users sidebar */}
        <UsersSidebar
          users={onlineUsers}
          currentUserId={currentUser.id}
          isHandRaised={isHandRaised}
          onHandToggle={handleHandToggle}
        />

        {/* Content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div
            className="flex gap-1 px-4 pt-3 pb-0 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--zen-border)" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative -mb-px"
                style={{
                  background: activeTab === tab.id ? "var(--zen-surface)" : "transparent",
                  color: activeTab === tab.id ? "var(--zen-text)" : "var(--zen-muted)",
                  borderTop: activeTab === tab.id ? "1px solid var(--zen-border)" : "none",
                  borderLeft: activeTab === tab.id ? "1px solid var(--zen-border)" : "none",
                  borderRight: activeTab === tab.id ? "1px solid var(--zen-border)" : "none",
                  borderBottom: activeTab === tab.id ? "1px solid var(--zen-surface)" : "none",
                }}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}

            {/* Timer — always visible in tab bar */}
            <div className="ml-auto flex items-center pr-2">
              <Timer
                roomId={room.id}
                timerState={timerState}
                onTimerChange={handleTimerChange}
                compact
              />
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden" style={{ background: "var(--zen-surface)" }}>
            {activeTab === "chat" && (
              <Chat
                roomId={room.id}
                messages={messages}
                currentUser={currentUser}
                typingUsers={typingUsers}
                onSendMessage={sendMessage}
                onReact={reactToMessage}
                onTyping={sendTypingStart}
              />
            )}
            {activeTab === "notes" && (
              <Notes
                roomId={room.id}
                roomName={room.name}
                content={notes}
                onChange={handleNotesChange}
              />
            )}
            {activeTab === "video" && (
              <VideoPlayer
                videoState={videoState}
                onVideoChange={handleVideoChange}
                currentUserId={currentUser.id}
              />
            )}
            {activeTab === "resources" && (
              <ResourceLibrary
                roomId={room.id}
                resources={resources}
                currentUser={currentUser}
                onAdd={handleResourceAdd}
                onRemove={handleResourceRemove}
              />
            )}
          </div>
        </div>

        {/* Todo sidebar */}
        <TodoList
          roomId={room.id}
          todos={todos}
          currentUser={currentUser}
          onChange={handleTodosChange}
        />
      </div>
    </div>
  );
}
