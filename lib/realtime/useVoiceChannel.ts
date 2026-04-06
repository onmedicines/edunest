"use client";

import { useCallback, useRef, useState } from "react";
import { EVENTS } from "./types";
import type {
  VoiceJoinPayload,
  VoiceLeavePayload,
  VoiceOfferPayload,
  VoiceAnswerPayload,
  VoiceIcePayload,
  VoiceSpeakingPayload,
  VoiceParticipant,
} from "./types";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

type Channel = {
  send: (msg: { type: string; event: string; payload: Record<string, unknown> }) => void;
  on: (type: string, filter: { event: string }, handler: (msg: { payload: unknown }) => void) => Channel;
};

interface UseVoiceChannelOptions {
  userId: string;
  username: string;
}

export function useVoiceChannel({ userId, username }: UseVoiceChannelOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);

  const localStreamRef = useRef<MediaStream | null>(null);
  // Map<peerId, RTCPeerConnection>
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Map<peerId, HTMLAudioElement>
  const audioElemsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  // Buffered ICE candidates before remote desc is set
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  // All voice-connected peer ids → username mapping
  const voicePeersRef = useRef<Map<string, string>>(new Map());

  const channelRef = useRef<Channel | null>(null);

  // ── Broadcast helper ─────────────────────────────────────────────────────
  const broadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  // ── Create a peer connection to a remote peer ────────────────────────────
  const createPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Add local tracks
      if (localStreamRef.current) {
        for (const track of localStreamRef.current.getTracks()) {
          pc.addTrack(track, localStreamRef.current);
        }
      }

      // Trickle ICE
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          broadcast(EVENTS.VOICE_ICE, { from: userId, to: peerId, candidate: candidate.toJSON() });
        }
      };

      // Remote audio
      pc.ontrack = ({ track, streams }) => {
        // Some browsers pass streams=[], fall back to wrapping the track
        const stream = streams[0] ?? (() => {
          const s = new MediaStream();
          s.addTrack(track);
          return s;
        })();
        let audio = audioElemsRef.current.get(peerId);
        if (!audio) {
          audio = new Audio();
          audioElemsRef.current.set(peerId, audio);
        }
        if (audio.srcObject !== stream) {
          audio.srcObject = stream;
          audio.play().catch(() => {
            // Autoplay blocked — will resume on next user gesture
          });
        }
      };

      pcsRef.current.set(peerId, pc);
      return pc;
    },
    [userId, broadcast]
  );

  // ── Flush buffered ICE candidates ────────────────────────────────────────
  const flushPendingIce = useCallback(async (peerId: string, pc: RTCPeerConnection) => {
    const pending = pendingIceRef.current.get(peerId) ?? [];
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // ignore stale candidates
      }
    }
    pendingIceRef.current.delete(peerId);
  }, []);

  // ── PTT key handlers ─────────────────────────────────────────────────────
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== " " || e.repeat) return;
      const tag = (document.activeElement as HTMLElement)?.tagName ?? "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      localStreamRef.current?.getAudioTracks().forEach((t) => {
        t.enabled = true;
      });
      setIsSpeaking(true);
      broadcast(EVENTS.VOICE_SPEAKING, { userId, isSpeaking: true });
    },
    [userId, broadcast]
  );

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== " ") return;
      localStreamRef.current?.getAudioTracks().forEach((t) => {
        t.enabled = false;
      });
      setIsSpeaking(false);
      broadcast(EVENTS.VOICE_SPEAKING, { userId, isSpeaking: false });
    },
    [userId, broadcast]
  );

  const stopSpeaking = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = false;
    });
    setIsSpeaking(false);
    broadcast(EVENTS.VOICE_SPEAKING, { userId, isSpeaking: false });
  }, [userId, broadcast]);

  // ── Connect ──────────────────────────────────────────────────────────────
  const connect = useCallback(
    async () => {
      if (isConnected) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      // Start muted — PTT only
      stream.getAudioTracks().forEach((t) => {
        t.enabled = false;
      });
      localStreamRef.current = stream;

      setIsConnected(true);
      setParticipants([{ userId, username, isSpeaking: false }]);
      voicePeersRef.current.set(userId, username);

      // Announce to all peers
      broadcast(EVENTS.VOICE_JOIN, { userId, username });

      // Initiate connections to all existing voice peers
      for (const [peerId, peerUsername] of voicePeersRef.current.entries()) {
        if (peerId === userId) continue;
        const pc = createPeerConnection(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        broadcast(EVENTS.VOICE_OFFER, { from: userId, to: peerId, sdp: offer });
        // Track the peer in our list
        setParticipants((prev) => {
          if (prev.find((p) => p.userId === peerId)) return prev;
          return [...prev, { userId: peerId, username: peerUsername, isSpeaking: false }];
        });
      }

      // PTT bindings
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);

      // Silence on tab hidden / before unload
      const onVisibility = () => {
        if (document.hidden) stopSpeaking();
      };
      const onBeforeUnload = () => stopSpeaking();
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("beforeunload", onBeforeUnload);

      // Store cleanup refs on the stream object itself (simplest approach)
      (stream as MediaStream & { _cleanupVoice?: () => void })._cleanupVoice = () => {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup", onKeyUp);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("beforeunload", onBeforeUnload);
      };
    },
    [isConnected, userId, username, broadcast, createPeerConnection, onKeyDown, onKeyUp, stopSpeaking]
  );

  // ── Disconnect ───────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    // Announce leave
    broadcast(EVENTS.VOICE_LEAVE, { userId });

    // Stop PTT silently
    stopSpeaking();

    // Cleanup event listeners
    const stream = localStreamRef.current as (MediaStream & { _cleanupVoice?: () => void }) | null;
    stream?._cleanupVoice?.();

    // Close all peer connections
    for (const pc of pcsRef.current.values()) {
      pc.close();
    }
    pcsRef.current.clear();

    // Stop audio elements
    for (const audio of audioElemsRef.current.values()) {
      audio.srcObject = null;
    }
    audioElemsRef.current.clear();

    // Stop local stream
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    voicePeersRef.current.clear();
    pendingIceRef.current.clear();

    setIsConnected(false);
    setIsSpeaking(false);
    setParticipants([]);
  }, [userId, broadcast, stopSpeaking]);

  // ── Register broadcast listeners (called BEFORE channel.subscribe()) ─────
  const registerListeners = useCallback(
    (channel: Channel) => {
      channelRef.current = channel;

      // ── VOICE_JOIN: a new peer connected to voice ──
      channel.on("broadcast", { event: EVENTS.VOICE_JOIN }, async ({ payload }) => {
        const p = payload as VoiceJoinPayload;
        if (p.userId === userId) return;

        voicePeersRef.current.set(p.userId, p.username);

        // If we're connected, create an offer to the new peer
        if (localStreamRef.current) {
          setParticipants((prev) => {
            if (prev.find((x) => x.userId === p.userId)) return prev;
            return [...prev, { userId: p.userId, username: p.username, isSpeaking: false }];
          });

          const pc = createPeerConnection(p.userId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          broadcast(EVENTS.VOICE_OFFER, { from: userId, to: p.userId, sdp: offer });
        }
      });

      // ── VOICE_LEAVE: a peer disconnected ──
      channel.on("broadcast", { event: EVENTS.VOICE_LEAVE }, ({ payload }) => {
        const p = payload as VoiceLeavePayload;
        voicePeersRef.current.delete(p.userId);

        const pc = pcsRef.current.get(p.userId);
        pc?.close();
        pcsRef.current.delete(p.userId);

        const audio = audioElemsRef.current.get(p.userId);
        if (audio) {
          audio.srcObject = null;
          audioElemsRef.current.delete(p.userId);
        }

        setParticipants((prev) => prev.filter((x) => x.userId !== p.userId));
      });

      // ── VOICE_OFFER: someone is calling us ──
      channel.on("broadcast", { event: EVENTS.VOICE_OFFER }, async ({ payload }) => {
        const p = payload as VoiceOfferPayload;
        if (p.to !== userId) return;
        if (!localStreamRef.current) return;

        let pc = pcsRef.current.get(p.from);
        if (!pc) {
          pc = createPeerConnection(p.from);
        }

        await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
        await flushPendingIce(p.from, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        broadcast(EVENTS.VOICE_ANSWER, { from: userId, to: p.from, sdp: answer });
      });

      // ── VOICE_ANSWER: our offer was answered ──
      channel.on("broadcast", { event: EVENTS.VOICE_ANSWER }, async ({ payload }) => {
        const p = payload as VoiceAnswerPayload;
        if (p.to !== userId) return;

        const pc = pcsRef.current.get(p.from);
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
        await flushPendingIce(p.from, pc);
      });

      // ── VOICE_ICE: trickle ICE candidate ──
      channel.on("broadcast", { event: EVENTS.VOICE_ICE }, async ({ payload }) => {
        const p = payload as VoiceIcePayload;
        if (p.to !== userId) return;

        const pc = pcsRef.current.get(p.from);
        if (!pc || !pc.remoteDescription) {
          // Buffer until remote desc is set
          const existing = pendingIceRef.current.get(p.from) ?? [];
          existing.push(p.candidate);
          pendingIceRef.current.set(p.from, existing);
          return;
        }

        try {
          await pc.addIceCandidate(new RTCIceCandidate(p.candidate));
        } catch {
          // ignore stale candidates
        }
      });

      // ── VOICE_SPEAKING: speaking indicator ──
      channel.on("broadcast", { event: EVENTS.VOICE_SPEAKING }, ({ payload }) => {
        const p = payload as VoiceSpeakingPayload;
        setParticipants((prev) =>
          prev.map((x) => (x.userId === p.userId ? { ...x, isSpeaking: p.isSpeaking } : x))
        );
      });
    },
    [userId, broadcast, createPeerConnection, flushPendingIce]
  );

  return {
    isConnected,
    isSpeaking,
    participants,
    connect,
    disconnect,
    registerListeners,
  };
}
