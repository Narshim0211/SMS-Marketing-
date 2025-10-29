"use client";

import { useState } from "react";

export function Composer({
  onSend,
  isStreaming,
  onStop,
}: {
  onSend: (text: string) => void;
  isStreaming: boolean;
  onStop: () => void;
}) {
  const [text, setText] = useState("");

  function handleSend() {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText("");
  }

  return (
    <div className="flex items-end gap-2">
      <textarea
        className="input min-h-[44px] flex-1 resize-y"
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      {isStreaming ? (
        <button className="btn btn-secondary" onClick={onStop}>Stop</button>
      ) : (
        <button className="btn btn-primary" onClick={handleSend}>Send</button>
      )}
    </div>
  );
}
