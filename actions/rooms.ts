"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string } | null;

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createRoom(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { error: "Room name is required." };
  if (name.length > 60) return { error: "Room name is too long." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Generate a unique code
  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", code)
      .single();
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      name,
      description,
      code,
      created_by: user.id,
      is_public: true,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Initialize room_state row
  await supabase.from("room_state").insert({
    room_id: room.id,
    timer_duration: 1500,
    timer_is_running: false,
    timer_remaining: 1500,
    video_is_playing: false,
    video_time: 0,
  });

  // Initialize notes row
  await supabase.from("notes").insert({
    room_id: room.id,
    content: "",
    updated_at: new Date().toISOString(),
  });

  redirect(`/room/${room.id}`);
}

export async function joinRoom(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) return { error: "Room code is required." };

  const supabase = await createClient();
  const { data: room, error } = await supabase
    .from("rooms")
    .select("id")
    .eq("code", code)
    .single();

  if (error || !room) return { error: "Room not found. Check the code and try again." };

  redirect(`/room/${room.id}`);
}

export async function updateRoom(
  roomId: string,
  data: { name?: string; description?: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("rooms")
    .update(data)
    .eq("id", roomId)
    .eq("created_by", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
