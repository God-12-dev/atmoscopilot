import { NextResponse } from "next/server";
import { generateChatResponse, generateWeatherResponse, AiError, type ChatMessage } from "@/lib/ai";

// A short, honest, user-facing line per error type. The FULL technical error
// (Gemini's raw status/message) is always logged server-side in lib/ai.ts's
// classifyGeminiError — check your terminal, not this string, when debugging.
const USER_MESSAGE: Record<string, string> = {
  GEMINI_NOT_CONFIGURED: "Weather data is available, but the AI explanation service isn't configured yet.",
  GEMINI_AUTH_ERROR: "Weather data is available, but the AI explanation service rejected its credentials.",
  GEMINI_MODEL_ERROR: "Weather data is available, but the AI explanation service is misconfigured (invalid model).",
  GEMINI_RATE_LIMIT: "Weather data is available, but the AI explanation service is rate-limited right now.",
  GEMINI_UPSTREAM_ERROR: "Weather data is available, but the AI explanation service is temporarily unavailable.",
  GEMINI_UNKNOWN_ERROR: "Weather data is available, but the AI explanation service hit an unexpected error.",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // New multi-turn format from the AI Copilot page: { messages, systemPrompt }
    if (Array.isArray(body.messages)) {
      const messages: ChatMessage[] = body.messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));
      const text = await generateChatResponse(messages, body.systemPrompt);
      return NextResponse.json({ success: true, message: text });
    }

    // Legacy single-turn format (backward compat)
    const userPrompt = body.message || body.prompt || body.userMessage;
    if (!userPrompt || typeof userPrompt !== "string") {
      return NextResponse.json({ success: false, error: "A valid message is required." }, { status: 400 });
    }

    const text = await generateWeatherResponse(userPrompt, body.contextData ?? body);

    return NextResponse.json({
      success: true,
      message: text,
      reply: { id: `msg-${Date.now()}`, role: "assistant", content: text },
      conversationId: body.conversationId || `conv-${Date.now()}`,
    });
  } catch (error: any) {
    if (error instanceof AiError) {
      // `error` stays a plain string so the existing frontend check
      // (`data.error ?? "..."`) keeps working; `debug` carries the full
      // structured type/status/message for anyone inspecting the network tab.
      return NextResponse.json(
        {
          success: false,
          error: USER_MESSAGE[error.type] ?? error.message,
          debug: { type: error.type, message: error.message, status: error.status },
        },
        { status: error.status || 500 }
      );
    }
    console.error("[AI API] Unhandled error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "WeatherGPT AI is temporarily unavailable. Please try again.",
        debug: { type: "UNKNOWN", message: error?.message ?? String(error), status: 500 },
      },
      { status: 500 }
    );
  }
}
