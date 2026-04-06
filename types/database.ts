export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: Room;
        Insert: Omit<Room, "id" | "created_at">;
        Update: Partial<Omit<Room, "id" | "created_at">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: Partial<Omit<Message, "id" | "created_at">>;
      };
      notes: {
        Row: Note;
        Insert: Omit<Note, "id">;
        Update: Partial<Omit<Note, "id">>;
      };
      resources: {
        Row: Resource;
        Insert: Omit<Resource, "id" | "added_at">;
        Update: Partial<Omit<Resource, "id" | "added_at">>;
      };
      room_state: {
        Row: RoomState;
        Insert: Partial<RoomState> & { room_id: string };
        Update: Partial<RoomState>;
      };
      todos: {
        Row: Todo;
        Insert: Omit<Todo, "id" | "created_at">;
        Update: Partial<Omit<Todo, "id" | "created_at">>;
      };
    };
  };
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  code: string;
  created_by: string;
  created_at: string;
  is_public: boolean;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
  reactions: Record<string, string[]>;
}

export interface Note {
  id: string;
  room_id: string;
  content: string;
  updated_by: string | null;
  updated_at: string;
}

export interface Resource {
  id: string;
  room_id: string;
  url: string;
  title: string;
  resource_type: ResourceType;
  added_by: string;
  added_username: string;
  added_at: string;
}

export interface RoomState {
  room_id: string;
  timer_started_at: string | null;
  timer_duration: number;
  timer_is_running: boolean;
  timer_remaining: number;
  video_id: string | null;
  video_is_playing: boolean;
  video_time: number;
}

export interface Todo {
  id: string;
  room_id: string;
  content: string;
  is_done: boolean;
  added_by: string;
  added_username: string;
  created_at: string;
}

export type ResourceType =
  | "youtube"
  | "google-docs"
  | "github"
  | "pdf"
  | "notion"
  | "link";

// Presence payload for Supabase Realtime
export interface PresenceUser {
  userId: string;
  username: string;
  avatarUrl: string | null;
  isHandRaised: boolean;
  joinedAt: string;
}

// Timer state (also stored in room_state table)
export interface TimerState {
  startedAt: string | null;
  duration: number;
  isRunning: boolean;
  remainingAtPause: number;
}

// Video state
export interface VideoState {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
}
