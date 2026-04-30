export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateRoomForm } from "./_components/CreateRoomForm";
import { JoinRoomForm } from "./_components/JoinRoomForm";
import { RoomsList } from "./_components/RoomsList";
import { RoomsHeader } from "./_components/RoomsHeader";
import { Plus, KeyRound } from "lucide-react";
import type { Room } from "@/types/database";

export default async function RoomsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const username = user.user_metadata?.username ?? "You";

  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen relative" style={{ background: "var(--zen-bg)" }}>
      <RoomsHeader username={username} />

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 relative">
        <div className="text-center sm:text-left">
          <div className="deck-eyebrow muted">Your study space</div>
          <h1
            className="mt-2 font-extrabold tracking-tight"
            style={{
              color: "var(--zen-text)",
              fontSize: "clamp(28px, 3.6vw, 40px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Welcome back, <span style={{ color: "var(--zen-sage)" }}>{username}.</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--zen-muted)" }}>
            Spin up a new session or jump into one with a code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="zen-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="deck-icon-circle green" style={{ width: 40, height: 40 }}>
                <Plus className="w-5 h-5" />
              </span>
              <div>
                <div className="deck-eyebrow muted text-[10px]">New session</div>
                <h2 className="font-bold text-base" style={{ color: "var(--zen-text)" }}>
                  Create a room
                </h2>
              </div>
            </div>
            <p className="text-sm" style={{ color: "var(--zen-muted)" }}>
              Start a study session and invite friends with a 6-character code.
            </p>
            <CreateRoomForm />
          </div>
          <div className="zen-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="deck-icon-circle blue" style={{ width: 40, height: 40 }}>
                <KeyRound className="w-5 h-5" />
              </span>
              <div>
                <div className="deck-eyebrow muted text-[10px]">Join existing</div>
                <h2 className="font-bold text-base" style={{ color: "var(--zen-text)" }}>
                  Join a room
                </h2>
              </div>
            </div>
            <p className="text-sm" style={{ color: "var(--zen-muted)" }}>
              Paste the 6-character code your group shared with you.
            </p>
            <JoinRoomForm />
          </div>
        </div>

        {rooms && rooms.length > 0 && (
          <RoomsList rooms={rooms as Room[]} />
        )}
      </main>
    </div>
  );
}
