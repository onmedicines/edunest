"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginWithPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = { error?: string } | null;

export function LoginForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    loginWithPassword,
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

      <p className="text-center text-sm" style={{ color: "var(--zen-muted)" }}>
        No account?{" "}
        <Link href="/signup" className="font-medium hover:underline" style={{ color: "var(--zen-sage-dark)" }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
