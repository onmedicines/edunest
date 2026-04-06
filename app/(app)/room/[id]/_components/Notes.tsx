"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download } from "lucide-react";
import { saveNotes } from "@/actions/notes";

type NotesMode = "edit" | "preview" | "split";

interface NotesProps {
  roomId: string;
  roomName: string;
  content: string;
  onChange: (content: string) => void;
}

export function Notes({ roomId, roomName, content, onChange }: NotesProps) {
  const [mode, setMode] = useState<NotesMode>("split");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(content);

  // Debounced persistence
  useEffect(() => {
    if (content === lastSavedRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lastSavedRef.current = content;
      startTransition(async () => {
        await saveNotes(roomId, content);
      });
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, roomId]);

  const modes: { id: NotesMode; label: string }[] = [
    { id: "edit", label: "Edit" },
    { id: "split", label: "Split" },
    { id: "preview", label: "Preview" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b gap-3"
        style={{ borderColor: "var(--zen-border)", background: "var(--zen-surface-2)" }}
      >
        <div className="flex gap-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className="px-3 py-1 text-xs rounded-md font-medium transition-colors"
              style={{
                background: mode === m.id ? "var(--zen-sage-light)" : "transparent",
                color: mode === m.id ? "var(--zen-sage-dark)" : "var(--zen-muted)",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--zen-muted)" }}>
            {isPending ? "Saving…" : "Markdown supported"}
          </span>
          <button
            onClick={() => {
              const blob = new Blob([content], { type: "text/markdown" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              const slug = roomName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              a.download = `${slug}-${new Date().toISOString().slice(0, 10)}.md`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={!content}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors disabled:opacity-40"
            style={{ color: "var(--zen-sage-dark)" }}
            title="Download notes as Markdown"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-hidden flex">
        {/* Editor pane */}
        {(mode === "edit" || mode === "split") && (
          <div
            className="flex flex-col"
            style={{
              width: mode === "split" ? "50%" : "100%",
              borderRight: mode === "split" ? `1px solid var(--zen-border)` : "none",
            }}
          >
            <textarea
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder="# Your notes\n\nStart typing in Markdown…"
              className="flex-1 resize-none p-4 text-sm focus:outline-none font-mono leading-relaxed"
              style={{
                background: "var(--zen-surface)",
                color: "var(--zen-text)",
                border: "none",
                height: "100%",
              }}
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview pane */}
        {(mode === "preview" || mode === "split") && (
          <div
            className="overflow-auto p-4 md-preview"
            style={{
              width: mode === "split" ? "50%" : "100%",
              background: "var(--zen-surface)",
            }}
          >
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <p style={{ color: "var(--zen-muted)" }} className="text-sm italic">
                Preview will appear here…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
