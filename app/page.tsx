export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "./_components/LandingPage";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const username = (user?.user_metadata?.username as string | undefined) ?? null;

  return <LandingPage isAuthed={!!user} username={username} />;
}
