export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomShell } from "./_components/RoomShell";
import type { Message, Note, Resource, RoomState, Todo, Room } from "@/types/database";

// Must await params in Next.js 16
export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch room info
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();

  if (!room) notFound();

  // Fetch initial data in parallel
  const [
    { data: messagesData },
    { data: notesData },
    { data: resourcesData },
    { data: roomStateData },
    { data: todosData },
  ] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .eq("room_id", id)
      .order("created_at", { ascending: true })
      .limit(50),
    supabase.from("notes").select("*").eq("room_id", id).single(),
    supabase
      .from("resources")
      .select("*")
      .eq("room_id", id)
      .order("added_at", { ascending: true })
      .limit(100),
    supabase.from("room_state").select("*").eq("room_id", id).single(),
    supabase
      .from("todos")
      .select("*")
      .eq("room_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const initialState = {
    messages: (messagesData as Message[]) ?? [],
    notes: (notesData as Note | null)?.content ?? "",
    resources: (resourcesData as Resource[]) ?? [],
    todos: (todosData as Todo[]) ?? [],
    timerState: roomStateData
      ? {
          startedAt: (roomStateData as RoomState).timer_started_at,
          duration: (roomStateData as RoomState).timer_duration ?? 1500,
          isRunning: (roomStateData as RoomState).timer_is_running ?? false,
          remainingAtPause: (roomStateData as RoomState).timer_remaining ?? 1500,
        }
      : { startedAt: null, duration: 1500, isRunning: false, remainingAtPause: 1500 },
    videoState: roomStateData
      ? {
          videoId: (roomStateData as RoomState).video_id ?? null,
          isPlaying: (roomStateData as RoomState).video_is_playing ?? false,
          currentTime: (roomStateData as RoomState).video_time ?? 0,
        }
      : { videoId: null, isPlaying: false, currentTime: 0 },
  };

  const currentUser = {
    id: user.id,
    username: user.user_metadata?.username ?? "Anonymous",
    avatarUrl: user.user_metadata?.avatar_url ?? null,
    isGuest: user.user_metadata?.is_guest ?? false,
  };

  return (
    <RoomShell
      room={room as Room}
      currentUser={currentUser}
      initialState={initialState}
    />
  );
}
