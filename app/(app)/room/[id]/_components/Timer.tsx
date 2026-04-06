"use client";

import { useEffect, useRef, useState, useCallback, useTransition } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { formatTime, getRemainingSeconds } from "@/lib/utils";
import type { TimerState } from "@/types/database";

async function persistTimerState(roomId: string, state: TimerState) {
  const supabase = createClient();
  await supabase.from("room_state").upsert(
    {
      room_id: roomId,
      timer_started_at: state.startedAt,
      timer_duration: state.duration,
      timer_is_running: state.isRunning,
      timer_remaining: state.remainingAtPause,
    },
    { onConflict: "room_id" }
  );
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.8);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.8);
    });
  } catch {
    // AudioContext not available
  }
}

interface TimerProps {
  roomId: string;
  timerState: TimerState;
  onTimerChange: (
    newState: TimerState,
    persistFn: (roomId: string, state: TimerState) => Promise<void>
  ) => Promise<void>;
  compact?: boolean;
}

export function Timer({ roomId, timerState, onTimerChange, compact = false }: TimerProps) {
  const [displaySeconds, setDisplaySeconds] = useState(() =>
    getRemainingSeconds(timerState)
  );
  const [isPending, startTransition] = useTransition();
  const hasChimedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep display in sync with timerState
  useEffect(() => {
    setDisplaySeconds(getRemainingSeconds(timerState));
    hasChimedRef.current = false;
  }, [timerState]);

  // Tick
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!timerState.isRunning) return;

    intervalRef.current = setInterval(() => {
      const remaining = getRemainingSeconds(timerState);
      setDisplaySeconds(remaining);

      if (remaining === 0 && !hasChimedRef.current) {
        hasChimedRef.current = true;
        playChime();
      }
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState]);

  const handleStart = () => {
    startTransition(async () => {
      const newState: TimerState = {
        startedAt: new Date().toISOString(),
        duration: timerState.duration,
        isRunning: true,
        remainingAtPause: displaySeconds,
      };
      await onTimerChange(newState, persistTimerState);
    });
  };

  const handlePause = () => {
    startTransition(async () => {
      const newState: TimerState = {
        startedAt: null,
        duration: timerState.duration,
        isRunning: false,
        remainingAtPause: getRemainingSeconds(timerState),
      };
      await onTimerChange(newState, persistTimerState);
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const newState: TimerState = {
        startedAt: null,
        duration: timerState.duration,
        isRunning: false,
        remainingAtPause: timerState.duration,
      };
      await onTimerChange(newState, persistTimerState);
    });
  };

  const timeColor =
    displaySeconds < 60
      ? "var(--zen-error)"
      : displaySeconds < 300
      ? "#e67e22"
      : "var(--zen-text)";

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className="font-mono text-sm font-semibold tabular-nums"
          style={{ color: timeColor }}
        >
          {formatTime(displaySeconds)}
        </span>
        {timerState.isRunning ? (
          <button
            onClick={handlePause}
            disabled={isPending}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: "var(--zen-muted)" }}
            title="Pause timer"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isPending}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: "var(--zen-muted)" }}
            title="Start timer"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={handleReset}
          disabled={isPending}
          className="p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: "var(--zen-muted)" }}
          title="Reset timer"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div
        className="font-mono text-6xl font-bold tabular-nums"
        style={{ color: timeColor, letterSpacing: "0.05em" }}
      >
        {formatTime(displaySeconds)}
      </div>
      {displaySeconds === 0 && (
        <p className="text-sm" style={{ color: "var(--zen-muted)" }}>
          🍵 Time for a break!
        </p>
      )}
      <div className="flex gap-2">
        {timerState.isRunning ? (
          <Button onClick={handlePause} disabled={isPending} variant="secondary">
            <Pause className="w-4 h-4 mr-1" /> Pause
          </Button>
        ) : (
          <Button onClick={handleStart} disabled={isPending}>
            <Play className="w-4 h-4 mr-1" /> Start
          </Button>
        )}
        <Button onClick={handleReset} disabled={isPending} variant="outline">
          <RotateCcw className="w-4 h-4 mr-1" /> Reset
        </Button>
      </div>
    </div>
  );
}
