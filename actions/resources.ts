"use server";

import { createClient } from "@/lib/supabase/server";
import { detectResourceType, normalizeUrl } from "@/lib/utils";
import type { Resource } from "@/types/database";

export async function addResource(
  roomId: string,
  url: string,
  title: string,
  username: string
): Promise<{ data?: Resource; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const normalizedUrl = normalizeUrl(url.trim());
  const resourceType = detectResourceType(normalizedUrl);

  const { data, error } = await supabase
    .from("resources")
    .insert({
      room_id: roomId,
      url: normalizedUrl,
      title: title.trim() || normalizedUrl,
      resource_type: resourceType,
      added_by: user.id,
      added_username: username,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Resource };
}

export async function removeResource(
  resourceId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", resourceId);

  if (error) return { error: error.message };
  return {};
}
