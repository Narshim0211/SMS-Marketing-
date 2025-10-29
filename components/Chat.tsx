"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageBubble } from "@/components/MessageBubble";
import { Composer } from "@/components/Composer";
import { useAppStore } from "@/lib/store";
import { sendChat } from "@/lib/api";
import type { Message } from "@/lib/types";

export function Chat() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messages = useAppStore((s) => s.messages);
  const pinnedContext = useAppStore((s) => s.pinnedContext);
  const addUserMessage = useAppStore((s) => s.addUserMessage);
  const upsertAssistantMessage = useAppStore((s) => s.upsertAssistantMessage);
  const setStreaming = useAppStore((s) => s.setStreaming);
  const isStreaming = useAppStore((s) => s.isStreaming);
  const lastAssistantMessageId = useAppStore((s) => s.lastAssistantMessageId);
  const createNote = useAppStore((s) => s.createNote);
  const createTask = useAppStore((s) => s.createTask);

  const [streamAbort, setStreamAbort] = useState<() => void>(() => () => {});

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, isStreaming]);

  async function handleSend(text: string) {
    const userMsg = addUserMessage(text);
    setStreaming(true);

    try {
      // Call backend (non-streaming), then simulate streaming locally
      const res = await sendChat(text, { pinnedContext });
      const full = res.assistantMessage;

      let current = "";
      const tokens = tokenizeForStreaming(full);
      const controller = new AbortController();

      // seed an empty assistant message
      upsertAssistantMessage("");

      const interval = setInterval(() => {
        const next = tokens.next();
        if (next.done) {
          clearInterval(interval);
          setStreaming(false);
          return;
        }
        current += next.value;
        upsertAssistantMessage(current);
      }, 20);

      setStreamAbort(() => () => {
        clearInterval(interval);
        setStreaming(false);
      });
    } catch (err) {
      upsertAssistantMessage("Sorry, there was an error generating a response.");
      setStreaming(false);
    }
  }

  function handleStop() {
    streamAbort();
  }

  const onAction = async (
    action: "copy" | "regenerate" | "add_note" | "create_task",
    content: string
  ) => {
    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(content);
        // simple toast replacement
        alert("Copied to clipboard");
      } catch {}
      return;
    }
    if (action === "regenerate") {
      const lastUser = findLastUserMessage(messages);
      if (lastUser) {
        handleSend(lastUser.content);
      }
      return;
    }
    if (action === "add_note") {
      createNote({ title: content.split("\n")[0]?.slice(0, 60) || "Note", content, tags: [] });
      return;
    }
    if (action === "create_task") {
      const title = content.split("\n").find(Boolean)?.slice(0, 60) || "Task";
      createTask({ title });
      return;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="scroll-area flex-1 space-y-3 overflow-y-auto p-3" role="log" aria-live="polite">
        {messages.length === 0 && (
          <div className="text-sm text-gray-500">
            Hi! How can I help today?
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Summarize this text",
                "Draft a reply to this message",
                "Create a task list for launch",
              ].map((q) => (
                <button key={q} className="btn btn-secondary" onClick={() => handleSend(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} onAction={onAction} />
        ))}
      </div>
      <div className="border-t p-3">
        <Composer onSend={handleSend} isStreaming={isStreaming} onStop={handleStop} />
      </div>
    </div>
  );
}

function* tokenizeForStreaming(text: string): Generator<string> {
  // naive tokenization by characters; could be per word for smoothness
  for (const ch of text) {
    yield ch;
  }
}

function findLastUserMessage(messages: Message[]): Message | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i];
  }
  return undefined;
}
