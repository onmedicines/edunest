"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { PlayCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VideoState } from "@/types/database";

export interface VideoPlayerHandle {
  getLiveState: () => VideoState | null;
}

function extractVideoId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  return null;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          width?: string | number;
          height?: string | number;
          playerVars?: Record<string, number | string>;
          events?: Record<string, (...args: unknown[]) => void>;
        }
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  destroy(): void;
  loadVideoById(videoId: string): void;
}

interface VideoPlayerProps {
  videoState: VideoState;
  onVideoChange: (state: Partial<VideoState>) => void;
  currentUserId: string;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer(
  { videoState, onVideoChange },
  ref
) {
  const [urlInput, setUrlInput] = useState("");
  const [ytReady, setYtReady] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const playerReadyRef = useRef(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const ignoreEventsRef = useRef(false);
  const lastVideoIdRef = useRef<string | null>(null);
  const videoStateRef = useRef(videoState);
  useEffect(() => {
    videoStateRef.current = videoState;
  }, [videoState]);

  useImperativeHandle(
    ref,
    () => ({
      getLiveState: () => {
        const id = videoStateRef.current.videoId;
        if (!id) return null;
        const live = playerRef.current?.getCurrentTime();
        return {
          videoId: id,
          isPlaying: videoStateRef.current.isPlaying,
          currentTime:
            typeof live === "number" && !Number.isNaN(live)
              ? live
              : videoStateRef.current.currentTime,
        };
      },
    }),
    []
  );

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT?.Player) {
      setYtReady(true);
      return;
    }
    window.onYouTubeIframeAPIReady = () => setYtReady(true);
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }, []);

  // Create / update player when videoId changes
  useEffect(() => {
    if (!ytReady || !videoState.videoId || !playerContainerRef.current) return;

    if (playerRef.current && lastVideoIdRef.current === videoState.videoId) {
      // Same video — just sync state
      return;
    }

    // New video — (re)create player
    lastVideoIdRef.current = videoState.videoId;
    playerReadyRef.current = false;
    playerRef.current?.destroy();
    playerRef.current = null;

    const el = document.createElement("div");
    el.style.width = "100%";
    el.style.height = "100%";
    playerContainerRef.current.innerHTML = "";
    playerContainerRef.current.appendChild(el);

    const initialStart = Math.max(0, Math.floor(videoState.currentTime));

    playerRef.current = new window.YT.Player(el, {
      videoId: videoState.videoId,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 0,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
        start: initialStart,
      },
      events: {
        onReady: () => {
          if (!playerRef.current) return;
          playerReadyRef.current = true;
          // Only sync if there is meaningful state to apply (late-joiner path).
          // For a fresh URL load the player already starts at 0 paused — skip
          // touching it so YouTube's thumbnail/cued state is preserved.
          const target = videoStateRef.current;
          const needsSeek = target.currentTime > 0.5;
          const needsPlay = target.isPlaying;
          if (!needsSeek && !needsPlay) return;

          ignoreEventsRef.current = true;
          if (needsSeek) playerRef.current.seekTo(target.currentTime, true);
          if (needsPlay) playerRef.current.playVideo();
          setTimeout(() => {
            ignoreEventsRef.current = false;
          }, 500);
        },
        onStateChange: (event: unknown) => {
          if (ignoreEventsRef.current) return;
          const e = event as { data: number };
          if (e.data === window.YT.PlayerState.PLAYING) {
            const t = playerRef.current?.getCurrentTime() ?? 0;
            onVideoChange({ isPlaying: true, currentTime: t });
          } else if (
            e.data === window.YT.PlayerState.PAUSED ||
            e.data === window.YT.PlayerState.ENDED
          ) {
            const t = playerRef.current?.getCurrentTime() ?? 0;
            onVideoChange({ isPlaying: false, currentTime: t });
          }
        },
      },
    });
  }, [ytReady, videoState.videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync play/pause/seek from remote
  useEffect(() => {
    if (!playerRef.current || !playerReadyRef.current) return;
    ignoreEventsRef.current = true;
    setTimeout(() => {
      ignoreEventsRef.current = false;
    }, 500);

    if (videoState.isPlaying) {
      playerRef.current.seekTo(videoState.currentTime, true);
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
      playerRef.current.seekTo(videoState.currentTime, true);
    }
  }, [videoState.isPlaying, videoState.currentTime]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(urlInput.trim());
    if (!id) return;
    onVideoChange({ videoId: id, isPlaying: false, currentTime: 0 });
    setUrlInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* URL input */}
      <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--zen-border)", background: "var(--zen-surface-2)" }}>
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste a YouTube URL or video ID…"
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <PlayCircle className="w-4 h-4 mr-1" />
            Load
          </Button>
        </form>
      </div>

      {/* Player */}
      <div className="flex-1 overflow-hidden" style={{ background: "#000" }}>
        {videoState.videoId ? (
          <div
            ref={playerContainerRef}
            className="w-full h-full"
          />
        ) : (
          <div className="text-center p-8">
            <p className="text-4xl mb-3">▶️</p>
            <p className="text-sm" style={{ color: "#aaa" }}>
              Paste a YouTube URL above to watch together
            </p>
          </div>
        )}
      </div>

      {videoState.videoId && (
        <div className="px-4 py-2 border-t flex items-center justify-between" style={{ borderColor: "var(--zen-border)", background: "var(--zen-surface-2)" }}>
          <p className="text-xs" style={{ color: "var(--zen-muted)" }}>
            Play/pause syncs across all tabs
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${videoState.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 hover:underline"
            style={{ color: "var(--zen-sage-dark)" }}
          >
            <ExternalLink className="w-3 h-3" /> Open in YouTube
          </a>
        </div>
      )}
    </div>
  );
});
