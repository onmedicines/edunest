export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/actions/auth";
import { CreateRoomForm } from "./_components/CreateRoomForm";
import { JoinRoomForm } from "./_components/JoinRoomForm";
import type { Room } from "@/types/database";

export default async function RoomsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const username = user.user_metadata?.username ?? "You";

  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen" style={{ background: "var(--zen-bg)" }}>
      {/* Header */}
      <header className="zen-card rounded-none border-x-0 border-t-0 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">📚</span>
          <span className="font-semibold text-base sm:text-lg truncate" style={{ color: "var(--zen-text)" }}>Study Room</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <span className="text-sm hidden sm:inline truncate max-w-[160px]" style={{ color: "var(--zen-muted)" }}>
            {username}
          </span>
          <form action={logout}>
            <button type="submit" className="text-sm hover:underline" style={{ color: "var(--zen-muted)" }}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Create + Join */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="zen-card p-5 sm:p-6 space-y-3">
            <h2 className="font-semibold text-base" style={{ color: "var(--zen-text)" }}>Create a room</h2>
            <p className="text-sm" style={{ color: "var(--zen-muted)" }}>Start a new study session and invite friends with a code.</p>
            <CreateRoomForm />
          </div>
          <div className="zen-card p-5 sm:p-6 space-y-3">
            <h2 className="font-semibold text-base" style={{ color: "var(--zen-text)" }}>Join a room</h2>
            <p className="text-sm" style={{ color: "var(--zen-muted)" }}>Enter a 6-character room code to join someones session.</p>
            <JoinRoomForm />
          </div>
        </div>

        {/* Recent Rooms */}
        {rooms && rooms.length > 0 && (
          <div className="zen-card p-5 sm:p-6 space-y-4">
            <h2 className="font-semibold text-base" style={{ color: "var(--zen-text)" }}>Recent rooms</h2>
            <div className="space-y-2">
              {rooms.map((room: Room) => (
                <Link
                  key={room.id}
                  href={`/room/${room.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ background: "var(--zen-surface-2)", border: "1px solid var(--zen-border)" }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate" style={{ color: "var(--zen-text)" }}>{room.name}</p>
                    {room.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "var(--zen-muted)" }}>{room.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-1 rounded flex-shrink-0" style={{ background: "var(--zen-sage-light)", color: "var(--zen-sage-dark)" }}>
                    {room.code}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
