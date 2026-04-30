"use client";

import { useState, useTransition } from "react";
import {
  ExternalLink,
  Trash2,
  Plus,
  Link2,
  CirclePlay,
  FileText,
  Code2,
  FileType,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";
import { addResource, removeResource } from "@/actions/resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { extractDomain } from "@/lib/utils";
import type { Resource, ResourceType } from "@/types/database";

const TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  youtube: CirclePlay,
  "google-docs": FileText,
  github: Code2,
  pdf: FileType,
  notion: NotebookPen,
  link: Link2,
};

interface ResourceLibraryProps {
  roomId: string;
  resources: Resource[];
  currentUser: { id: string; username: string };
  onAdd: (resource: Resource) => void;
  onRemove: (resourceId: string) => void;
}

export function ResourceLibrary({
  roomId,
  resources,
  currentUser,
  onAdd,
  onRemove,
}: ResourceLibraryProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError(null);
    startTransition(async () => {
      const { data, error: err } = await addResource(
        roomId,
        url.trim(),
        title.trim(),
        currentUser.username
      );
      if (err) {
        setError(err);
        return;
      }
      if (data) {
        onAdd(data);
        setUrl("");
        setTitle("");
      }
    });
  };

  const handleRemove = (resourceId: string) => {
    startTransition(async () => {
      await removeResource(resourceId);
      onRemove(resourceId);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Add resource form */}
      <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--zen-border)", background: "var(--zen-surface-2)" }}>
        <form onSubmit={handleAdd} className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL…"
              className="flex-1"
              required
            />
            <Button type="submit" size="sm" disabled={isPending || !url.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
          />
          {error && (
            <p className="text-xs" style={{ color: "var(--zen-error)" }}>{error}</p>
          )}
        </form>
      </div>

      {/* Resources list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {resources.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "var(--zen-sage-light)" }}
              >
                <Link2
                  className="w-6 h-6"
                  style={{ color: "var(--zen-sage-dark)" }}
                />
              </div>
              <p className="text-sm" style={{ color: "var(--zen-muted)" }}>
                No resources yet. Add a link above.
              </p>
            </div>
          )}
          {resources.map((resource) => {
            const Icon = TYPE_ICONS[resource.resource_type] ?? Link2;
            const domain = extractDomain(resource.url);
            const isSelected = previewUrl === resource.url;

            return (
              <div
                key={resource.id}
                className="rounded-lg p-3 transition-colors"
                style={{
                  background: isSelected ? "var(--zen-sage-light)" : "var(--zen-surface-2)",
                  border: `1px solid ${isSelected ? "var(--zen-sage)" : "var(--zen-border)"}`,
                }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--zen-surface)", border: "1px solid var(--zen-border)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "var(--zen-sage-dark)" }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--zen-text)" }}>
                      {resource.title}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--zen-muted)" }}>
                      {domain} · Added by {resource.added_username}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setPreviewUrl(isSelected ? null : resource.url)}
                      className="p-1 rounded hover:opacity-70 transition-opacity text-xs"
                      style={{ color: "var(--zen-sage-dark)" }}
                      title="Preview"
                    >
                      {isSelected ? "Close" : "Preview"}
                    </button>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:opacity-70 transition-opacity"
                      style={{ color: "var(--zen-muted)" }}
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleRemove(resource.id)}
                      className="p-1 rounded hover:opacity-70 transition-opacity"
                      style={{ color: "var(--zen-error)" }}
                      title="Remove"
                      disabled={isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline preview */}
                {isSelected && (
                  <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: "var(--zen-border)", height: "200px" }}>
                    <iframe
                      src={resource.url}
                      title={resource.title}
                      className="w-full h-full"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
