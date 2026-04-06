"use client";

import { useActionState } from "react";
import { createRoom } from "@/actions/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = { error?: string } | null;

export function CreateRoomForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    createRoom,
    null
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="room-name">Room name</Label>
        <Input
          id="room-name"
          name="name"
          placeholder="e.g. Finals Study Group"
          maxLength={60}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="room-desc">Description <span style={{ color: "var(--zen-muted)" }}>(optional)</span></Label>
        <Input
          id="room-desc"
          name="description"
          placeholder="What are you studying?"
          maxLength={120}
        />
      </div>
      {state?.error && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "var(--zen-error-light)", color: "var(--zen-error)" }}>
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating…" : "Create room"}
      </Button>
    </form>
  );
}
