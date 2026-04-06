"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupWithPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = { error?: string; confirmEmail?: boolean } | null;

export function SignupForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    signupWithPassword,
    null
  );

  // Email confirmation required — show success state instead of crashing
  if (state?.confirmEmail) {
    return (
      <div className="zen-card p-6 text-center space-y-3">
        <p className="text-3xl">📬</p>
        <h3 className="font-semibold" style={{ color: "var(--zen-text)" }}>
          Check your email
        </h3>
        <p className="text-sm" style={{ color: "var(--zen-muted)" }}>
          We sent a confirmation link to your email address. Click it to
          activate your account, then{" "}
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: "var(--zen-sage-dark)" }}
          >
            sign in
          </Link>
          .
        </p>
        <p className="text-xs" style={{ color: "var(--zen-muted)" }}>
          Tip: to skip email confirmation during development, go to{" "}
          <strong>Supabase Dashboard → Authentication → Email → disable &ldquo;Confirm email&rdquo;</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="zen-card p-6 space-y-4">
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">Display name</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Your name"
            required
            maxLength={32}
          />
        </div>
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
            placeholder="At least 6 characters"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        {state?.error && (
          <p
            className="text-xs rounded-lg px-3 py-2"
            style={{
              background: "var(--zen-error-light)",
              color: "var(--zen-error)",
            }}
          >
            {state.error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm" style={{ color: "var(--zen-muted)" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium hover:underline"
          style={{ color: "var(--zen-sage-dark)" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
