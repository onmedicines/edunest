import type { Message, Resource, Todo, TimerState, VideoState } from "@/types/database";

export const CHANNEL_NAME = (roomId: string) => `room:${roomId}`;

// Broadcast event names
export const EVENTS = {
  CHAT_NEW: "chat:new",
  CHAT_REACTION: "chat:reaction",
  NOTES_UPDATE: "notes:update",
  VIDEO_STATE: "video:state",
  VIDEO_STATE_REQUEST: "video:state-request",
  TIMER_STATE: "timer:state",
  RESOURCE_ADD: "resource:add",
  RESOURCE_REMOVE: "resource:remove",
  TODO_UPDATE: "todo:update",
  HAND_TOGGLE: "hand:toggle",
  VOICE_JOIN: "voice:join",
  VOICE_LEAVE: "voice:leave",
  VOICE_OFFER: "voice:offer",
  VOICE_ANSWER: "voice:answer",
  VOICE_ICE: "voice:ice",
  VOICE_SPEAKING: "voice:speaking",
} as const;

// Broadcast payload types
export interface ChatNewPayload {
  message: Message;
}

export interface ChatReactionPayload {
  messageId: string;
  userId: string;
  emoji: string;
}

export interface NotesUpdatePayload {
  content: string;
  updatedBy: string;
}

export interface VideoStatePayload extends VideoState {
  triggeredBy: string;
}

export interface VideoStateRequestPayload {
  requesterId: string;
}

export interface TimerStatePayload extends TimerState {
  triggeredBy: string;
}

export interface ResourceAddPayload {
  resource: Resource;
}

export interface ResourceRemovePayload {
  resourceId: string;
}

export interface TodoUpdatePayload {
  todos: Todo[];
}

export interface HandTogglePayload {
  userId: string;
  isRaised: boolean;
}

// ── Voice / WebRTC payloads ────────────────────────────────────────────────

export interface VoiceJoinPayload {
  userId: string;
  username: string;
}

export interface VoiceLeavePayload {
  userId: string;
}

export interface VoiceOfferPayload {
  from: string;
  to: string;
  sdp: RTCSessionDescriptionInit;
}

export interface VoiceAnswerPayload {
  from: string;
  to: string;
  sdp: RTCSessionDescriptionInit;
}

export interface VoiceIcePayload {
  from: string;
  to: string;
  candidate: RTCIceCandidateInit;
}

export interface VoiceSpeakingPayload {
  userId: string;
  isSpeaking: boolean;
}

export interface VoiceParticipant {
  userId: string;
  username: string;
  isSpeaking: boolean;
}
