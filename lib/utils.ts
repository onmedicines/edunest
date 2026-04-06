import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ResourceType } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function getRemainingSeconds(state: {
  startedAt: string | null;
  isRunning: boolean;
  remainingAtPause: number;
}): number {
  if (!state.isRunning || !state.startedAt) return state.remainingAtPause;
  const elapsedMs = Date.now() - new Date(state.startedAt).getTime();
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  return Math.max(0, state.remainingAtPause - elapsedSeconds);
}

export function detectResourceType(url: string): ResourceType {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/docs\.google\.com/.test(url)) return "google-docs";
  if (/github\.com/.test(url)) return "github";
  if (/notion\.so/.test(url)) return "notion";
  if (/\.pdf($|\?)/.test(url)) return "pdf";
  return "link";
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateAvatarColor(userId: string): string {
  const colors = [
    "#8FBC8F", // sage green
    "#A0C4FF", // dusty blue
    "#B5EAD7", // mint
    "#FFDAC1", // peach
    "#C7CEEA", // lavender
    "#FFB7B2", // blush
    "#E2CFC4", // sand
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
