"use server";

import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/types/database";

export async function saveMessage(
  roomId: string,
  content: string,
  username: string
): Promise<{ data?: Message; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data, error } = await supabase
    .from("messages")
    .insert({
      room_id: roomId,
      user_id: user.id,
      username,
      content: content.slice(0, 2000),
      reactions: {},
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Message };
}

export async function addReaction(
  messageId: string,
  emoji: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: msg } = await supabase
    .from("messages")
    .select("reactions")
    .eq("id", messageId)
    .single();

  if (!msg) return { error: "Message not found." };

  const reactions = (msg.reactions as Record<string, string[]>) || {};
  const users = reactions[emoji] ?? [];

  let updatedUsers: string[];
  if (users.includes(user.id)) {
    updatedUsers = users.filter((id) => id !== user.id);
  } else {
    updatedUsers = [...users, user.id];
  }

  if (updatedUsers.length === 0) {
    delete reactions[emoji];
  } else {
    reactions[emoji] = updatedUsers;
  }

  const { error } = await supabase
    .from("messages")
    .update({ reactions })
    .eq("id", messageId);

  if (error) return { error: error.message };
  return {};
}
