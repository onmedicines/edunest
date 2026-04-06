"use server";

import { createClient } from "@/lib/supabase/server";
import type { Todo } from "@/types/database";

export async function addTodo(
  roomId: string,
  content: string,
  username: string
): Promise<{ data?: Todo; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data, error } = await supabase
    .from("todos")
    .insert({
      room_id: roomId,
      content: content.trim(),
      is_done: false,
      added_by: user.id,
      added_username: username,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Todo };
}

export async function toggleTodo(
  todoId: string,
  isDone: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .update({ is_done: isDone })
    .eq("id", todoId);

  if (error) return { error: error.message };
  return {};
}

export async function removeTodo(todoId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("todos").delete().eq("id", todoId);
  if (error) return { error: error.message };
  return {};
}

export async function getTodosForRoom(roomId: string): Promise<Todo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("todos")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });
  return (data as Todo[]) ?? [];
}
