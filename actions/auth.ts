"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string; confirmEmail?: boolean } | null;

export async function loginWithPassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        error:
          "Please confirm your email before signing in. Check your inbox for a confirmation link.",
      };
    }
    return { error: error.message };
  }

  redirect("/rooms");
}

export async function signupWithPassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  if (!email || !password || !username) {
    return { error: "All fields are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, is_guest: false },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If session is null, Supabase requires email confirmation before login
  if (!data.session) {
    return { confirmEmail: true };
  }

  redirect("/rooms");
}

export async function loginAsGuest(
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  // Use Supabase anonymous sign-in — no email required, no confirmation needed
  const { data, error } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        username: `Guest ${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        is_guest: true,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return { error: "Could not create guest session. Try again." };
  }

  redirect("/rooms");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
