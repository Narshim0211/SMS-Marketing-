"use client";

import { Markdown } from "@/components/Markdown";
import type { Message } from "@/lib/types";
import { SmartActions } from "@/components/SmartActions";
import { useAppStore } from "@/lib/store";

export function MessageBubble({ message, onAction }: {
  message: Message;
  onAction: (action: "copy" | "regenerate" | "add_note" | "create_task", content: string) => void;
}) {
  const isAssistant = message.role === "assistant";
  const isStreaming = useAppStore((s) => s.isStreaming);

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div className={`card max-w-[85%] p-3 ${isAssistant ? "bg-white" : "bg-blue-50"}`}>
        <div className="text-xs text-gray-500 mb-1">
          {isAssistant ? "Assistant" : "You"}
        </div>
        <div className="prose prose-sm max-w-none">
          <Markdown content={message.content} />
        </div>
        {isAssistant && (
          <SmartActions
            onCopy={() => onAction("copy", message.content)}
            onRegenerate={() => onAction("regenerate", message.content)}
            onAddNote={() => onAction("add_note", message.content)}
            onCreateTask={() => onAction("create_task", message.content)}
          />
        )}
        {isAssistant && isStreaming && (
          <div className="mt-2 text-xs text-gray-400">Streaming…</div>
        )}
      </div>
    </div>
  );
}
