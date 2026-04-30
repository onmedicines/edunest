"use client";

import { useActionState } from "react";
import { joinRoom } from "@/actions/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = { error?: string } | null;

export function JoinRoomForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    joinRoom,
    null
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="room-code">Room code</Label>
        <Input
          id="room-code"
          name="code"
          placeholder="AB3XY9"
          maxLength={6}
          className="uppercase tracking-[0.3em] font-mono text-center text-lg font-bold"
          required
        />
      </div>
      {state?.error && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "var(--zen-error-light)", color: "var(--zen-error)" }}>
          {state.error}
        </p>
      )}
      <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
        {pending ? "Joining…" : "Join room"}
      </Button>
    </form>
  );
}
