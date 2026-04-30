"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, CheckCircle2, Circle, X } from "lucide-react";
import { addTodo, toggleTodo, removeTodo } from "@/actions/todos";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import type { Todo } from "@/types/database";

interface TodoListProps {
  roomId: string;
  todos: Todo[];
  currentUser: { id: string; username: string };
  onChange: (todos: Todo[]) => void;
  open: boolean;
  onClose: () => void;
}

export function TodoList({ roomId, todos, currentUser, onChange, open, onClose }: TodoListProps) {
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const content = draft.trim();
    setDraft("");
    startTransition(async () => {
      const { data, error } = await addTodo(roomId, content, currentUser.username);
      if (data && !error) {
        const newTodos = [...todos, data];
        onChange(newTodos);
      }
    });
  };

  const handleToggle = (todo: Todo) => {
    startTransition(async () => {
      await toggleTodo(todo.id, !todo.is_done);
      const updated = todos.map((t) =>
        t.id === todo.id ? { ...t, is_done: !t.is_done } : t
      );
      onChange(updated);
    });
  };

  const handleRemove = (todoId: string) => {
    startTransition(async () => {
      await removeTodo(todoId);
      const updated = todos.filter((t) => t.id !== todoId);
      onChange(updated);
    });
  };

  const done = todos.filter((t) => t.is_done).length;
  const total = todos.length;

  return (
    <aside
      className={`flex-shrink-0 flex flex-col border-l transition-transform z-40 lg:relative lg:w-52 lg:translate-x-0 fixed inset-y-0 right-0 w-64 ${
        open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}
      style={{
        background: "var(--zen-surface)",
        borderColor: "var(--zen-border)",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-3 border-b"
        style={{ borderColor: "var(--zen-border)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--zen-muted)" }}>
            Session Goals
          </span>
          <div className="flex items-center gap-2">
            {total > 0 && (
              <span className="text-xs" style={{ color: "var(--zen-muted)" }}>
                {done}/{total}
              </span>
            )}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:opacity-70"
              aria-label="Close goals panel"
              style={{ color: "var(--zen-muted)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {total > 0 && (
          <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: "var(--zen-border)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(done / total) * 100}%`,
                background: "var(--zen-sage)",
              }}
            />
          </div>
        )}
      </div>

      {/* Todos */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {todos.length === 0 && (
            <p className="text-xs text-center py-6 leading-relaxed" style={{ color: "var(--zen-muted)" }}>
              Add your session goals here
            </p>
          )}
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-1.5 group px-1.5 py-1 rounded-lg hover:bg-[var(--zen-surface-2)] transition-colors"
            >
              <button
                onClick={() => handleToggle(todo)}
                disabled={isPending}
                className="mt-0.5 flex-shrink-0 transition-colors"
                style={{ color: todo.is_done ? "var(--zen-sage)" : "var(--zen-border)" }}
              >
                {todo.is_done ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>
              <span
                className="flex-1 text-xs leading-relaxed break-words"
                style={{
                  color: todo.is_done ? "var(--zen-muted)" : "var(--zen-text)",
                  textDecoration: todo.is_done ? "line-through" : "none",
                }}
              >
                {todo.content}
              </span>
              <button
                onClick={() => handleRemove(todo.id)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity mt-0.5"
                style={{ color: "var(--zen-error)" }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Add todo */}
      <div className="p-2 border-t" style={{ borderColor: "var(--zen-border)" }}>
        <form onSubmit={handleAdd} className="flex gap-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add goal…"
            className="flex-1 h-7 text-xs px-2"
            maxLength={120}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isPending}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 flex-shrink-0"
            style={{ background: "var(--zen-sage)", color: "white" }}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
}
