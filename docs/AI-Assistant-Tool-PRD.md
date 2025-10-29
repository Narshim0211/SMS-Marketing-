# AI Assistant Tool — Product Requirements Document (PRD)

## Project: AI Assistant Tool (MVP)
- Goal: Deliver a conversational assistant that helps users think, write, and act faster via chat, summaries, and structured actions, with a clean, intuitive UI.

## Objectives
- Enable natural-language chat to draft, summarize, and organize.
- Provide quick actions to convert outputs into notes/tasks.
- Offer lightweight context memory with optional pinned context.
- Present structured outputs (lists, tables, cards) with markdown support.

## Scope (MVP)
- Chat with streaming responses, markdown rendering.
- Recent message memory; user-pinned context.
- Smart actions: Copy, Regenerate, Add as Note, Create Task.
- Notes and Tasks (inline creation + sidebar view).
- Optional: Prompt Library (prebuilt + saved prompts).
- Local/session storage persistence; backend persistence optional.

## Out of Scope (Post-MVP)
- Voice input/output, file understanding, and deep external integrations (Calendar, CRM, SMS sending).
- Multi-assistant modes; collaboration/sharing.
- Enterprise auth/SSO, roles/permissions beyond single-user.

## Personas
- Primary: Small business owners/professionals (non-technical); draft client messages, summaries, ideas, reminders.
- Secondary: Content creators/managers; brainstorm, rewrite, automate responses.

## Success Metrics
- Time-to-first-output (<2s perceived with streaming).
- Conversion: % of AI responses turned into notes/tasks.
- Weekly retention; session length; CSAT (👍/👎).
- Reliability: error rate <1%; uptime targets per deployment.

---

# Frontend Specification

## UX Principles
- Minimal, professional, distraction-free.
- Fast perception via streaming and skeleton/loading states.
- Clear affordances for quick actions and saving outcomes.
- Consistent shadcn/ui components and spacing/typography.

## Information Architecture
- Main layout: two-column desktop, single-column mobile.
  - Left: Chat area.
  - Right: Context/Actions Sidebar (Notes/Tasks, Prompts).
- Top bar: App title, settings (memory controls), feedback (👍/👎).
- Bottom composer: Input, Send/Stop, Quick prompts.

## Key Screens/Components
- Chat View
  - Message list with bubbles (user/assistant), timestamps.
  - Markdown renderer: headings, lists, code blocks, tables.
  - Streaming responses with “Stop” control and partial content display.
  - Inline quick actions below each assistant message.
- Composer
  - Text `Input`, `Button` for Send/Stop.
  - Optional quick-prompt chips; `Tooltip` for hints.
- Smart Action Toolbar (per assistant response)
  - Actions: Copy, Regenerate, Add as Note, Create Task.
  - Optional: “Send as SMS” (placeholder if not integrated).
- Notes & Tasks Sidebar
  - Tabs or segmented `Tabs`: Notes | Tasks.
  - List of items using `Card` with title, snippet/status.
  - `Dialog` or `Sheet` for create/edit with fields:
    - Notes: Title, Content, Tags.
    - Tasks: Title, Due Date, Tag, Status (Pending/Done), Description.
  - `Badge` for status/tags; `DropdownMenu` for item actions.
- Prompt Library (Optional)
  - List with categories; “Save Prompt” flow.
  - One-click insert into composer.

## UI Components (shadcn/ui recommendations)
- Input, Button, Textarea, ScrollArea, Card, Tabs, Dialog/Sheet, Badge, Tooltip, DropdownMenu, Separator, Skeleton, Toast/Toaster, Toggle/Checkbox, Avatar.

## Interaction Flows
- Send Message
  - User types → Send → UI shows user bubble → starts streaming assistant message → Stop available → on complete, show Smart Action Toolbar.
- Add as Note / Create Task
  - Click action → open Dialog with prefilled content → user edits → Save → item appears in sidebar list (optimistic update).
- Pin Context
  - User opens Settings → “Pinned Context” textarea/list → saved locally (and optionally server-side).
- Regenerate
  - Resend last user message with same context; replaces last assistant response with new one (keep history accessible).

## Frontend State Management
- View state: current tab, dialogs open, loading flags.
- Session state: sessionId, messages[], pinnedContext[], model settings (temperature, max tokens).
- Data state: notes[], tasks[], prompts[] (local-first; sync with backend if available).
- Persistence: localStorage/sessionStorage for session/notes/tasks in MVP; feature-flag server sync.

## Accessibility & i18n
- Keyboard: Enter to send; Shift+Enter for newline; Escape to close modals; Tab order logical.
- ARIA roles/labels for chat list, messages, and streaming status.
- High contrast, focus rings; reduced motion setting respected.
- Copy and actions accessible via keyboard; screen-reader announcements for streamed tokens optional.
- i18n-ready: all text through a string map; RTL-safe styles.

## Error States & Empty States
- Empty chat: greeting message with 3 suggested prompts.
- Network/LLM errors: inline error block with “Retry”.
- Notes/Tasks empty: friendly zero-state with CTA to create from response.

## Non-Functional (Frontend)
- Performance: virtualized chat list for long histories; diff-friendly updates while streaming; throttled reflows.
- Offline-tolerant for local data; graceful degradation if backend unavailable.
- Security: sanitize markdown; disable raw HTML/script; safe link handling (rel=noopener, noreferrer).

---

# Backend Specification

## Architecture Overview
- Stateless API with session-aware chat orchestration.
- LLM provider abstraction to support multiple vendors (OpenAI, Anthropic, etc.).
- Memory strategy: recent-turn buffer + optional pinned context + rolling summary beyond token window.
- Optional persistence: database for sessions/messages/notes/tasks/prompts; MVP can operate ephemeral with local-only persistence on client.

## Data Model (conceptual)
- User
  - id, email (optional), createdAt.
- Session
  - id, userId, title (first user prompt), createdAt, updatedAt, summary (rolling).
- Message
  - id, sessionId, role (user|assistant|system), content, createdAt, tokensIn|tokensOut, errorFlag.
- Note
  - id, userId, title, content, tags[], createdAt, updatedAt.
- Task
  - id, userId, title, dueDate, tag, status (pending|done), description, createdAt, updatedAt.
- Prompt
  - id, userId (nullable for global), title, content, category, createdAt.

## API Endpoints (stack-agnostic HTTP/JSON)
- Chat
  - POST /v1/chat
    - Request:
      ```json
      {
        "sessionId": "string|null",
        "message": "string",
        "pinnedContext": ["string"],
        "model": "string|null",
        "stream": false
      }
      ```
    - Response:
      ```json
      {
        "sessionId": "string",
        "messageId": "string",
        "assistantMessage": "string",
        "usage": { "inputTokens": 0, "outputTokens": 0 },
        "suggestedActions": ["copy","regenerate","add_note","create_task"]
      }
      ```
  - POST /v1/chat/stream
    - Streaming via Server-Sent Events (SSE) or WebSocket.
    - Events: token, done, error.
    - Example SSE event payload:
      ```json
      { "type": "token", "value": "partial text" }
      ```
- Sessions
  - GET /v1/sessions
  - GET /v1/sessions/:id
  - PATCH /v1/sessions/:id (e.g., rename, pin context server-side)
- Notes
  - GET /v1/notes
  - POST /v1/notes
  - PATCH /v1/notes/:id
  - DELETE /v1/notes/:id
- Tasks
  - GET /v1/tasks
  - POST /v1/tasks
  - PATCH /v1/tasks/:id
  - DELETE /v1/tasks/:id
- Prompts (Optional)
  - GET /v1/prompts
  - POST /v1/prompts
  - PATCH /v1/prompts/:id
  - DELETE /v1/prompts/:id
- Feedback
  - POST /v1/feedback
    - ```json
      { "sessionId":"string", "messageId":"string", "rating":"up|down", "comment":"string|null" }
      ```

## Chat Orchestration & Memory
- System Prompt
  - Brief, role-establishing; instruct on tone, formatting (markdown), action suggestions.
- Context Assembly
  - pinnedContext[] + last N turns + session summary (if exists).
- Token Management
  - Pre-estimate tokens; if overflow risk:
    - Trim to last N turns.
    - Summarize older turns into session summary (LLM or heuristic).
- Output formatting
  - Encourage structured lists/tables when user intent suggests.
  - Include action hints for UI mapping (but keep pure text in content).
- Regeneration
  - Replay last user message with same context and a “regenerate” flag (for analytics only).

## Security & Privacy
- Do not store sensitive content by default unless user opts in.
- Redact PII where appropriate in logs; never log raw prompts/responses in production logs.
- Configurable data retention; delete endpoints for user content.
- No training on user data; vendor configured to disable data training if supported.
- Rate limiting per IP/user; abuse detection (length caps, frequency).
- CORS configured for specific frontend origins.

## Observability
- Request tracing (requestId, sessionId).
- Metrics: latency p50/p95, error rates, token usage, stream start time.
- Structured logs (JSON) with severity; sampling to control volume.

## Non-Functional (Backend)
- Performance: first token <1.5s typical with warmed provider; stream cadence stable.
- Reliability: idempotency keys for chat requests to prevent duplicates.
- Scalability: stateless workers; horizontal scale; SSE optimized with keep-alive.
- Config: environment-driven secrets; provider selection via config.

## Example System Prompt (illustrative)
```
You are an AI teammate that helps users think, write, and act—faster.
- Be concise, friendly, and professional.
- Use markdown for structure (headings, lists, tables when helpful).
- Prefer actionable outputs (steps, templates, to-do lists).
- When asked, produce short, copy-ready drafts.
- Avoid making assumptions about facts not provided.
```

---

# Functional Requirements (MVP)

- Chat
  - Send/receive messages with streaming.
  - Markdown rendering; code blocks, tables, lists.
  - Stop generation; Regenerate last response.
- Memory
  - Maintain recent-turn buffer.
  - Allow pinned context; user can edit.
  - Clear/reset chat session.
- Smart Actions
  - Copy Text, Regenerate, Add as Note, Create Task.
- Notes & Tasks
  - Create, edit, delete items.
  - Tasks: title, due date, tag, status; Notes: title, content, tags.
  - Sidebar list with filters (by tag/status).
- Prompt Library (Optional)
  - Use prebuilt prompts; save custom prompts.
- Feedback
  - Thumbs up/down per assistant message; optional comment.

---

# Non-Functional Requirements

- Performance
  - First token under 2s; total latency observable.
  - Smooth streaming; minimal reflows.
- Accessibility
  - WCAG 2.1 AA targets; keyboard-first users supported.
- Security
  - Content sanitization; CSP recommended; secure secrets.
- Privacy
  - Configurable retention; right to delete.
- Reliability
  - Graceful fallbacks on provider errors; clear user messaging.

---

# Data Contracts (Representative)

- Message (client-side)
```json
{
  "id": "string",
  "role": "user|assistant|system",
  "content": "string",
  "createdAt": "ISO-8601"
}
```
- Note
```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "tags": ["string"],
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```
- Task
```json
{
  "id": "string",
  "title": "string",
  "dueDate": "ISO-8601|null",
  "tag": "string|null",
  "status": "pending|done",
  "description": "string|null",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

---

# Acceptance Criteria

- Chat
  - User can send a message; assistant streams a response with markdown.
  - Stop button interrupts streaming within 300ms.
  - Regenerate produces a distinct response without duplicate messages.
- Memory
  - Pinned context included in responses; clearing session empties chat and memory.
- Actions
  - Copy copies full assistant response; confirmation toast shown.
  - Add as Note/Task opens a modal with prefilled content and saves successfully.
- Notes/Tasks
  - Create/edit/delete reflected immediately in sidebar; persists across reloads (local or server).
  - Tasks show status badges and can toggle to Done.
- Prompt Library (Optional)
  - Prebuilt prompts appear; clicking inserts into composer.
- Accessibility
  - Keyboard navigation and screen reader labels verified on main flows.
- Telemetry
  - Each chat request logs latency, token usage, and stream start event.

---

# Release Plan

- Milestone 1: Chat core
  - Streaming, markdown, stop/regenerate, pinned context, local persistence.
- Milestone 2: Notes & Tasks
  - Create/edit/delete; sidebar; tags/status; toasts.
- Milestone 3: Prompt Library (Optional)
  - Prebuilt + saved prompts; quick insert.
- Milestone 4: Feedback + Metrics
  - Thumbs up/down; latency/tokens logging; basic dashboard or endpoint.
- Milestone 5: Hardening
  - A11y pass, security review, rate limits, error scenarios, copy polish.

---

# Risks & Mitigations

- LLM variability: enforce concise system prompt; temperature bounds; regen option.
- Token overflows: implement rolling summary and strict turn limits.
- Privacy concerns: default to client-side storage; opt-in server sync; redact logs.
- Vendor outages: provider abstraction; configurable failover or graceful error.

---

# Open Questions

- Will server-side persistence be enabled in MVP or client-only?
- Which LLM vendor(s) and default model?
- Authentication needs (none, email link, OAuth)?
- SMS/CRM integrations priority post-MVP?

---

# Implementation Notes (Agnostic)

- Frontend
  - Any SPA framework; React pairs well with shadcn/ui.
  - Use a markdown renderer with sanitization.
  - Local persistence via localStorage/IndexedDB; feature-flag server sync.
- Backend
  - HTTP API with SSE for streaming.
  - LLM provider client behind an interface; env-configured.
  - If persisting, simple relational schema or a document store; migrations versioned.

---

# Example UX Copy

- Greeting: “Hi! How can I help today?”
- Quick prompts: “Summarize this text”, “Draft a reply”, “Create a task list”.
- Action labels: “Add as Note”, “Create Task”, “Copy”, “Regenerate”.

---

# Future Extensions (Post-MVP)

- Voice (Web Speech API / server ASR + TTS).
- File understanding (PDF, DOCX ingestion).
- Integrations: Calendar, Notion, CRM, SMS.
- Assistant modes: Writer, Planner, Marketing.
- Shareable links; multi-user collaboration.
