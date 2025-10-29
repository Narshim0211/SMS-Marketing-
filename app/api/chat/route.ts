import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are an AI teammate that helps users think, write, and act—faster.
- Be concise, friendly, and professional.
- Use markdown for structure (headings, lists, tables when helpful).
- Prefer actionable outputs (steps, templates, to-do lists).
- When asked, produce short, copy-ready drafts.
- Avoid making assumptions about facts not provided.`;

export async function POST(req: NextRequest) {
  try {
    const { message, pinnedContext = [] } = (await req.json()) as {
      message: string;
      pinnedContext?: string[];
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const sessionId = uuidv4();
    const messageId = uuidv4();

    const apiKey = process.env.OPENAI_API_KEY;

    let assistantMessage: string;

    if (!apiKey) {
      // Stub response for environments without API key
      assistantMessage = `Here’s a helpful response based on your request.\n\n### Key Points\n- You said: “${message.slice(0, 280)}${message.length > 280 ? "…" : ""}”\n- Pinned context: ${pinnedContext.length > 0 ? pinnedContext.join(", ") : "(none)"}\n\n### Suggested Next Steps\n1. Confirm details or constraints.\n2. Choose an action below (Copy, Add as Note, Create Task).\n3. If needed, ask me to refine or rewrite.`;
    } else {
      // Call OpenAI non-streaming
      const body = {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...(pinnedContext.length
            ? [{
                role: "system",
                content: `Pinned context to consider:\n- ${pinnedContext.join("\n- ")}`,
              }]
            : []),
          { role: "user", content: message },
        ],
        stream: false,
      } as const;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI error ${res.status}: ${errText}`);
      }

      const json = await res.json();
      assistantMessage = json.choices?.[0]?.message?.content?.trim() ||
        "Sorry, I couldn't generate a response.";
    }

    return NextResponse.json({
      sessionId,
      messageId,
      assistantMessage,
      suggestedActions: ["copy", "regenerate", "add_note", "create_task"],
    });
  } catch (err: unknown) {
    console.error("/api/chat error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
