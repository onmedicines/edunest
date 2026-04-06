"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Settings, Sun, Moon, Users } from "lucide-react";
import { logout } from "@/actions/auth";
import { updateRoom } from "@/actions/rooms";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import type { Room } from "@/types/database";

interface RoomHeaderProps {
  room: Room;
  currentUser: { id: string; username: string };
  connectionStatus: "connecting" | "connected" | "reconnecting" | "disconnected";
  onlineCount: number;
}

export function RoomHeader({ room, currentUser, connectionStatus, onlineCount }: RoomHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [roomName, setRoomName] = useState(room.name);
  const [roomDesc, setRoomDesc] = useState(room.description ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const isOwner = currentUser.id === room.created_by;

  const statusBadge = {
    connected: <Badge variant="live">● Live</Badge>,
    connecting: <Badge variant="secondary">Connecting…</Badge>,
    reconnecting: <Badge variant="secondary">Reconnecting…</Badge>,
    disconnected: <Badge variant="offline">● Offline</Badge>,
  }[connectionStatus];

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveSettings = async () => {
    setSaving(true);
    await updateRoom(room.id, { name: roomName, description: roomDesc });
    setSaving(false);
    setSettingsOpen(false);
  };

  return (
    <>
      <header
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{
          background: "var(--zen-surface)",
          borderBottom: "1px solid var(--zen-border)",
        }}
      >
        <Link href="/rooms" className="text-xl flex-shrink-0" title="Back to rooms">
          📚
        </Link>
        <div className="flex-1 min-w-0">
          <h1
            className="font-semibold text-sm truncate"
            style={{ color: "var(--zen-text)" }}
          >
            {room.name}
          </h1>
          {room.description && (
            <p className="text-xs truncate" style={{ color: "var(--zen-muted)" }}>
              {room.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {statusBadge}
          <span
            className="text-xs flex items-center gap-1"
            style={{ color: "var(--zen-muted)" }}
          >
            <Users className="w-3 h-3" />
            {onlineCount}
          </span>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSettingsOpen(true)}
            title="Room settings"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Logout */}
          <form action={logout}>
            <Button variant="ghost" size="icon-sm" type="submit" title="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </header>

      {/* Settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room settings</DialogTitle>
            <DialogDescription>
              Share the code with friends to invite them.
            </DialogDescription>
          </DialogHeader>

          {/* Join code */}
          <div className="space-y-1.5">
            <Label>Room code</Label>
            <div className="flex gap-2">
              <div
                className="flex-1 font-mono text-center text-xl font-semibold tracking-widest rounded-lg py-2"
                style={{
                  background: "var(--zen-surface-2)",
                  border: "1px solid var(--zen-border)",
                  color: "var(--zen-sage-dark)",
                }}
              >
                {room.code}
              </div>
              <Button variant="secondary" onClick={copyCode}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {isOwner && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="edit-room-name">Room name</Label>
                <Input
                  id="edit-room-name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  maxLength={60}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-room-desc">Description</Label>
                <Input
                  id="edit-room-desc"
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  maxLength={120}
                />
              </div>
              <Button onClick={saveSettings} className="w-full" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
