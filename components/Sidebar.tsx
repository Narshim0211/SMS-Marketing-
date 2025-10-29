"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { Note, TaskItem } from "@/lib/types";
import { format } from "date-fns";

export function Sidebar({ onInsertPrompt }: { onInsertPrompt: (text: string) => void }) {
  const [tab, setTab] = useState<"notes" | "tasks" | "prompts" | "context">("notes");
  const notes = useAppStore((s) => s.notes);
  const tasks = useAppStore((s) => s.tasks);
  const createNote = useAppStore((s) => s.createNote);
  const createTask = useAppStore((s) => s.createTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const pinnedContext = useAppStore((s) => s.pinnedContext);
  const setPinnedContext = useAppStore((s) => s.setPinnedContext);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const [noteDraft, setNoteDraft] = useState<{ title: string; content: string; tags: string }>(
    { title: "", content: "", tags: "" }
  );

  const [taskDraft, setTaskDraft] = useState<{ title: string; dueDate: string; tag: string; description: string }>(
    { title: "", dueDate: "", tag: "", description: "" }
  );

  const promptCategories = useMemo(() => ([
    {
      title: "Marketing",
      items: [
        "Write a social post about our weekend discount.",
        "Draft a promo SMS to drive bookings.",
      ],
    },
    {
      title: "Client",
      items: [
        "Summarize this client conversation:",
        "Write a polite rescheduling message.",
      ],
    },
    {
      title: "Planning",
      items: [
        "Create a task list for product launch.",
        "Generate content ideas for next month.",
      ],
    },
  ]), []);

  return (
    <aside className="card h-full p-3">
      <div className="mb-3 flex gap-2">
        <button className={`btn btn-secondary ${tab === "notes" ? "!bg-gray-200" : ""}`} onClick={() => setTab("notes")}>Notes</button>
        <button className={`btn btn-secondary ${tab === "tasks" ? "!bg-gray-2 00" : ""}`} onClick={() => setTab("tasks")}>Tasks</button>
        <button className={`btn btn-secondary ${tab === "prompts" ? "!bg-gray-200" : ""}`} onClick={() => setTab("prompts")}>Prompts</button>
        <button className={`btn btn-secondary ${tab === "context" ? "!bg-gray-200" : ""}`} onClick={() => setTab("context")}>Context</button>
      </div>

      {tab === "notes" && (
        <div className="flex h-[calc(100%-48px)] flex-col">
          <div className="mb-2 flex justify-end">
            <button className="btn btn-primary" onClick={() => setNoteModalOpen(true)}>New Note</button>
          </div>
          <div className="scroll-area divide-y divide-gray-100" style={{ maxHeight: "calc(100% - 40px)" }}>
            {notes.length === 0 && <div className="text-sm text-gray-500">No notes yet.</div>}
            {notes.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div className="flex h-[calc(100%-48px)] flex-col">
          <div className="mb-2 flex justify-end">
            <button className="btn btn-primary" onClick={() => setTaskModalOpen(true)}>New Task</button>
          </div>
          <div className="scroll-area divide-y divide-gray-100" style={{ maxHeight: "calc(100% - 40px)" }}>
            {tasks.length === 0 && <div className="text-sm text-gray-500">No tasks yet.</div>}
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={() => updateTask(t.id, { status: t.status === "pending" ? "done" : "pending" })} onDelete={() => deleteTask(t.id)} />
            ))}
          </div>
        </div>
      )}

      {tab === "prompts" && (
        <div className="space-y-3">
          {promptCategories.map((cat) => (
            <div key={cat.title} className="card p-3">
              <div className="mb-2 font-medium">{cat.title}</div>
              <div className="flex flex-col gap-2">
                {cat.items.map((it) => (
                  <button key={it} className="btn btn-secondary justify-start" onClick={() => onInsertPrompt(it)}>
                    {it}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "context" && (
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-sm text-gray-600">Pinned context lines (one per row)</div>
            <textarea
              className="input min-h-[180px]"
              value={pinnedContext.join("\n")}
              onChange={(e) => setPinnedContext(
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )}
              placeholder={"e.g.\nSalon name: Glow Studio\nWeekends: Open 10-6"}
            />
          </div>
          <div className="text-xs text-gray-500">
            Context is sent with your prompts to improve relevance.
          </div>
        </div>
      )}

      {noteModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4" role="dialog" aria-modal>
          <div className="card w-full max-w-lg p-4">
            <div className="mb-2 text-lg font-semibold">New Note</div>
            <input className="input mb-2" placeholder="Title" value={noteDraft.title} onChange={(e) => setNoteDraft({ ...noteDraft, title: e.target.value })} />
            <textarea className="input mb-2 min-h-[160px]" placeholder="Content" value={noteDraft.content} onChange={(e) => setNoteDraft({ ...noteDraft, content: e.target.value })} />
            <input className="input mb-3" placeholder="Tags (comma separated)" value={noteDraft.tags} onChange={(e) => setNoteDraft({ ...noteDraft, tags: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={() => setNoteModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const tags = noteDraft.tags.split(",").map((s) => s.trim()).filter(Boolean);
                createNote({ title: noteDraft.title || "Untitled", content: noteDraft.content, tags });
                setNoteDraft({ title: "", content: "", tags: "" });
                setNoteModalOpen(false);
              }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {taskModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4" role="dialog" aria-modal>
          <div className="card w-full max-w-lg p-4">
            <div className="mb-2 text-lg font-semibold">New Task</div>
            <input className="input mb-2" placeholder="Title" value={taskDraft.title} onChange={(e) => setTaskDraft({ ...taskDraft, title: e.target.value })} />
            <input className="input mb-2" placeholder="Due date (YYYY-MM-DD)" value={taskDraft.dueDate} onChange={(e) => setTaskDraft({ ...taskDraft, dueDate: e.target.value })} />
            <input className="input mb-2" placeholder="Tag" value={taskDraft.tag} onChange={(e) => setTaskDraft({ ...taskDraft, tag: e.target.value })} />
            <textarea className="input mb-3 min-h-[120px]" placeholder="Description" value={taskDraft.description} onChange={(e) => setTaskDraft({ ...taskDraft, description: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={() => setTaskModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const dueISO = taskDraft.dueDate ? new Date(taskDraft.dueDate).toISOString() : null;
                createTask({ title: taskDraft.title || "Untitled", dueDate: dueISO, tag: taskDraft.tag || null, description: taskDraft.description || null });
                setTaskDraft({ title: "", dueDate: "", tag: "", description: "" });
                setTaskModalOpen(false);
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <div className="p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{note.title}</div>
        <div className="badge">{format(new Date(note.updatedAt), "MMM d")}</div>
      </div>
      <div className="mt-1 line-clamp-3 text-sm text-gray-600">{note.content}</div>
      {note.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.map((t) => (
            <span key={t} className="badge">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }: { task: TaskItem; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={task.status === "done"} onChange={onToggle} />
        <div>
          <div className="font-medium">{task.title}</div>
          <div className="text-xs text-gray-500">
            {task.tag && <span className="mr-2">#{task.tag}</span>}
            {task.dueDate && <span>Due {format(new Date(task.dueDate), "MMM d")}</span>}
          </div>
        </div>
      </div>
      <button className="btn btn-secondary" onClick={onDelete}>Delete</button>
    </div>
  );
}
