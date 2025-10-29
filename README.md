# AI Assistant Tool

An AI teammate that helps you think, write, and act—faster.

This repository implements the MVP described in `docs/AI-Assistant-Tool-PRD.md`:
- Two-column UI with chat on the left and a sidebar for Notes/Tasks/Prompts/Context on the right
- Markdown rendering, quick actions (Copy, Regenerate, Add as Note, Create Task)
- Local-first persistence (messages, notes, tasks, pinned context)
- Backend chat endpoint with a stub response (works without API keys); optional OpenAI integration

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (lightweight, shadcn/ui-compatible styling approach)
- Zustand (state + localStorage persistence)
- `react-markdown` + `remark-gfm` for rendering

The UI follows the PRD’s guidance and is compatible with shadcn/ui components should you choose to add them later.

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

### 3) Optional: Connect to OpenAI
The app works out-of-the-box with a stubbed response.
To enable real LLM responses, add an API key:

Create `.env.local` at the repo root:

```
OPENAI_API_KEY=sk-...
# Optional (defaults to gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
```

Then restart the dev server. The backend endpoint at `/api/chat` will call OpenAI (non-streaming) and return the response to the UI.

## Project Structure

```
app/
  api/
    chat/route.ts      # Chat endpoint (stub + OpenAI)
  layout.tsx
  page.tsx             # Main two-column layout
  globals.css          # Tailwind styles + basic component classes
components/
  Chat.tsx             # Chat surface: messages list + composer
  MessageBubble.tsx    # User/assistant bubbles + actions
  Composer.tsx         # Input area with Send/Stop
  Sidebar.tsx          # Notes, Tasks, Prompts, Pinned Context
  Markdown.tsx         # MD renderer with GFM
lib/
  api.ts               # Client API helpers
  store.ts             # Zustand store with local persistence
  types.ts             # Shared types
```

## Core Flows (MVP)
- Send a message → assistant responds (stub or OpenAI)
- Quick actions on assistant messages: Copy, Regenerate, Add as Note, Create Task
- Notes/Tasks live in the right sidebar (create/edit basic, toggle task done)
- Pinned Context editor applies context to subsequent requests

## Design & UI
- Minimal, professional; light theme
- Buttons, inputs, badges, and basic cards are Tailwind-based
- You can add shadcn/ui components at any time and gradually replace the Tailwind utility classes

## Deployment

### Option A: Push to GitHub (source of truth)
- Commit and push this repository to GitHub. The app runs via `npm run dev` locally.
- You can add a CI workflow to check type/lint/build on push.

### Option B: GitHub Pages (static export)
- This app includes a backend route. GitHub Pages is static-only; you would need a separate backend (e.g., Vercel, Fly, Railway) or keep using the stubbed responses.
- If you want a static export (no API), set the UI to operate solely with the stub and run:

```bash
npm run build && npm run export
```

The static site will be under `out/`. Publish `out/` to Pages, understanding that real LLM responses require a server.

### Option C: Vercel/Netlify/Render
- Easiest fully functional deploy is Vercel: it supports Next.js API routes.
- Set `OPENAI_API_KEY` and `OPENAI_MODEL` in project environment variables.

## Notes for Developers
- The store (`lib/store.ts`) persists messages, notes, tasks, and pinned context to `localStorage` for a fast, privacy-friendly MVP.
- The chat endpoint (`/api/chat`) chooses a stub response if `OPENAI_API_KEY` is not defined. This makes local testing and GitHub demo links work without secrets.
- The UI simulates streaming for perceived responsiveness; real streaming can be added via SSE/web streams later.

## License
MIT
