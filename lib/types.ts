export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string; // ISO-8601
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "pending" | "done";

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string | null; // ISO-8601 or null
  tag: string | null;
  status: TaskStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  sessionId: string;
  messageId: string;
  assistantMessage: string;
  usage?: { inputTokens: number; outputTokens: number };
  suggestedActions: ("copy" | "regenerate" | "add_note" | "create_task")[];
}
