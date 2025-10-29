import type { ChatResponse } from "@/lib/types";

export async function sendChat(message: string, options?: { pinnedContext?: string[] }): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, pinnedContext: options?.pinnedContext ?? [] }),
  });
  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`);
  }
  return (await res.json()) as ChatResponse;
}
