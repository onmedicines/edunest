"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginWithPassword, loginAsGuest } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = { error?: string; confirmEmail?: boolean } | null;

export function LoginForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    loginWithPassword,
    null
  );

  const [guestState, guestAction, guestPending] = useActionState<State, FormData>(
    loginAsGuest,
    null
  );

  return (
    <div className="zen-card p-6 space-y-4">
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>
        {state?.error && (
          <p className="text-xs rounded-lg px-3 py-2" style={{ background: "var(--zen-error-light)", color: "var(--zen-error)" }}>
            {state.error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" style={{ borderColor: "var(--zen-border)" }} />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2" style={{ background: "var(--zen-surface)", color: "var(--zen-muted)" }}>
            or
          </span>
        </div>
      </div>

      <form action={guestAction}>
        <Button type="submit" variant="secondary" className="w-full" disabled={guestPending}>
          {guestPending ? "Joining as guest…" : "Continue as Guest"}
        </Button>
        {guestState?.error && (
          <p className="text-xs mt-2" style={{ color: "var(--zen-error)" }}>{guestState.error}</p>
        )}
      </form>

      <p className="text-center text-sm" style={{ color: "var(--zen-muted)" }}>
        No account?{" "}
        <Link href="/signup" className="font-medium hover:underline" style={{ color: "var(--zen-sage-dark)" }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
