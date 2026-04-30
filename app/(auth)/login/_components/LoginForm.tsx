"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
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
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--zen-muted)" }}
          />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="pl-9"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--zen-muted)" }}
          />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="pl-9"
          />
        </div>
      </div>
      {state?.error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"
          style={{ background: "var(--zen-error-light)", color: "var(--zen-error)" }}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {state.error}
        </motion.p>
      )}
      <motion.div whileHover={{ scale: pending ? 1 : 1.005 }} whileTap={{ scale: 0.99 }}>
        <Button type="submit" size="lg" className="w-full group" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
          {!pending && (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </Button>
      </motion.div>
    </form>
  );
}
