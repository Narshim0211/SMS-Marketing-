"use client";

import { Chat } from "@/components/Chat";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";

export default function HomePage() {
  const [composerInject, setComposerInject] = useState<string>("");

  return (
    <main className="container-app grid h-screen grid-rows-[auto,1fr] gap-3">
      <header className="flex items-center justify-between py-3">
        <div className="text-lg font-semibold">AI Assistant Tool</div>
        <div className="text-sm text-gray-500">Think, write, and act—faster.</div>
      </header>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-[2fr,1fr]">
        <div className="card h-[calc(100vh-112px)]">
          <Chat />
        </div>
        <div className="h-[calc(100vh-112px)]">
          <Sidebar onInsertPrompt={(text) => {
            // naive: create a synthetic event by copying into clipboard / alert
            // In a richer setup, we'd plumb this into the composer state.
            navigator.clipboard.writeText(text).then(() => {
              alert("Prompt copied. Paste into the composer.");
            });
          }} />
        </div>
      </section>
    </main>
  );
}
