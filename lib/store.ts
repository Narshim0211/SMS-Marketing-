"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Message, Note, TaskItem } from "@/lib/types";

interface SessionState {
  sessionId: string;
  messages: Message[];
  pinnedContext: string[];
}

interface DataState {
  notes: Note[];
  tasks: TaskItem[];
}

interface UIState {
  isStreaming: boolean;
  lastAssistantMessageId: string | null;
}

interface AppState extends SessionState, DataState, UIState {
  // Chat
  addUserMessage: (content: string) => Message;
  upsertAssistantMessage: (content: string) => Message; // replaces last assistant message if streaming
  setStreaming: (isStreaming: boolean) => void;
  clearSession: () => void;
  setPinnedContext: (items: string[]) => void;

  // Notes
  createNote: (payload: { title: string; content: string; tags?: string[] }) => Note;
  updateNote: (id: string, updates: Partial<Omit<Note, "id" | "createdAt">>) => void;
  deleteNote: (id: string) => void;

  // Tasks
  createTask: (payload: {
    title: string;
    dueDate?: string | null;
    tag?: string | null;
    status?: "pending" | "done";
    description?: string | null;
  }) => TaskItem;
  updateTask: (id: string, updates: Partial<Omit<TaskItem, "id" | "createdAt">>) => void;
  deleteTask: (id: string) => void;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sessionId: uuidv4(),
      messages: [],
      pinnedContext: [],
      notes: [],
      tasks: [],
      isStreaming: false,
      lastAssistantMessageId: null,

      addUserMessage: (content) => {
        const message: Message = {
          id: uuidv4(),
          role: "user",
          content,
          createdAt: nowIso(),
        };
        set((state) => ({ messages: [...state.messages, message] }));
        return message;
      },

      upsertAssistantMessage: (content) => {
        const { lastAssistantMessageId, messages } = get();
        if (lastAssistantMessageId) {
          // replace content of last assistant message
          const updated = messages.map((m) =>
            m.id === lastAssistantMessageId ? { ...m, content } : m
          );
          set({ messages: updated });
          return updated.find((m) => m.id === lastAssistantMessageId)!;
        }
        const newMsg: Message = {
          id: uuidv4(),
          role: "assistant",
          content,
          createdAt: nowIso(),
        };
        set((state) => ({
          messages: [...state.messages, newMsg],
          lastAssistantMessageId: newMsg.id,
        }));
        return newMsg;
      },

      setStreaming: (isStreaming) => set({ isStreaming }),

      clearSession: () =>
        set({ sessionId: uuidv4(), messages: [], lastAssistantMessageId: null }),

      setPinnedContext: (items) => set({ pinnedContext: items }),

      createNote: ({ title, content, tags }) => {
        const note: Note = {
          id: uuidv4(),
          title,
          content,
          tags: tags ?? [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((state) => ({ notes: [note, ...state.notes] }));
        return note;
      },

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: nowIso() } : n
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

      createTask: ({ title, dueDate = null, tag = null, status = "pending", description = null }) => {
        const task: TaskItem = {
          id: uuidv4(),
          title,
          dueDate,
          tag,
          status,
          description,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((state) => ({ tasks: [task, ...state.tasks] }));
        return task;
      },

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: nowIso() } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
    }),
    {
      name: "ai-assistant-store",
      partialize: (state) => ({
        sessionId: state.sessionId,
        messages: state.messages,
        pinnedContext: state.pinnedContext,
        notes: state.notes,
        tasks: state.tasks,
      }),
    }
  )
);
