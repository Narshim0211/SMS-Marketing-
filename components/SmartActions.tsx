"use client";

import { useAppStore } from "@/lib/store";

export function SmartActions({
  onCopy,
  onRegenerate,
  onAddNote,
  onCreateTask,
}: {
  onCopy: () => void;
  onRegenerate: () => void;
  onAddNote: () => void;
  onCreateTask: () => void;
}) {
  const isStreaming = useAppStore((s) => s.isStreaming);
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button className="btn btn-secondary" onClick={onCopy} disabled={isStreaming}>
        Copy Text
      </button>
      <button className="btn btn-secondary" onClick={onRegenerate}>
        Regenerate
      </button>
      <button className="btn btn-secondary" onClick={onAddNote}>
        Add as Note
      </button>
      <button className="btn btn-secondary" onClick={onCreateTask}>
        Create Task
      </button>
    </div>
  );
}
