"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveNotes(
  roomId: string,
  content: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("notes")
    .upsert({
      room_id: roomId,
      content,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "room_id" });

  if (error) return { error: error.message };
  return {};
}
