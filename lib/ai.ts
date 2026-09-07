// lib/ai.ts
// Server-side only — reads GEMINI_API_KEY. Never import into a "use client" component.
//
// Uses the current official Google Gen AI SDK (@google/genai) with Gemini 3.6 Flash
// (model id "gemini-3.6-flash", GA since July 21, 2026). The AI never receives a bare
// question — callers must build a systemPrompt/context string from real fetched
// weather data first (see app/assistant/page.tsx's buildContext) so Gemini explains
// numbers it was given rather than inventing them.

import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.6-flash";

function client(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiError("GEMINI_NOT_CONFIGURED", "GEMINI_API_KEY is not set. Add it to .env.local and restart `npm run dev`.", 503);
  }
  return new GoogleGenAI({ apiKey });
}

export type AiErrorType =
  | "GEMINI_NOT_CONFIGURED"
  | "GEMINI_AUTH_ERROR"
  | "GEMINI_MODEL_ERROR"
  | "GEMINI_RATE_LIMIT"
  | "GEMINI_UPSTREAM_ERROR"
  | "GEMINI_UNKNOWN_ERROR";

/** Structured error so API routes can report a real cause (auth/model/quota/
 *  network) instead of masking everything as one generic message. */
export class AiError extends Error {
  type: AiErrorType;
  status: number;
  constructor(type: AiErrorType, message: string, status: number) {
    super(message);
    this.type = type;
    this.status = status;
  }
}

/** @google/genai throws an ApiError with a numeric `.status` (HTTP-ish) on
 *  API failures. Map that to our AiError types so callers get an accurate
 *  cause instead of a generic 500. Always logs the raw error server-side
 *  first — that's what should show up in your terminal during debugging. */
function classifyGeminiError(err: any): AiError {
  console.error("[Gemini API error - raw]", err?.status, err?.message ?? err);

  const status: number | undefined = err?.status;
  const rawMessage: string = err?.message ?? String(err);

  if (err instanceof AiError) return err;
  if (status === 401 || status === 403) {
    return new AiError("GEMINI_AUTH_ERROR", `Gemini rejected the API key (status ${status}). Check GEMINI_API_KEY is valid and has the Generative Language API enabled.`, status);
  }
  if (status === 404) {
    return new AiError("GEMINI_MODEL_ERROR", `Gemini model "${MODEL}" was not found (status 404). It may have been renamed or retired — check https://ai.google.dev/gemini-api/docs/models for the current model id.`, 404);
  }
  if (status === 429) {
    return new AiError("GEMINI_RATE_LIMIT", "Gemini rate limit or quota exceeded (status 429). Wait and retry, or check your quota in Google AI Studio.", 429);
  }
  if (typeof status === "number" && status >= 500) {
    return new AiError("GEMINI_UPSTREAM_ERROR", `Gemini's API is having issues (status ${status}). This is on Google's side — retry shortly.`, status);
  }
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|network/i.test(rawMessage)) {
    return new AiError("GEMINI_UPSTREAM_ERROR", `Network error reaching Gemini: ${rawMessage}`, 502);
  }
  return new AiError("GEMINI_UNKNOWN_ERROR", rawMessage, status ?? 500);
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are WeatherGPT AI Copilot — an expert assistant for weather intelligence, disaster preparedness, agricultural guidance, and emergency response in India.

IMPORTANT RULES:
- Current weather data provided by the application is authoritative. Never invent, estimate, or replace current weather values.
- ONLY discuss weather, climate, disasters, agriculture, travel safety, and emergency preparedness.
- NEVER invent temperature, rainfall, wind speed, or forecast values. Only reference values provided in the weather context you're given.
- If weather context is unavailable, say so clearly and ask the user to select a location. Do not guess in the meantime.
- Keep responses concise, factual, and actionable.
- If the user writes in a non-English language, respond in that same language.
- Format responses using Markdown (headings, **bold**, bullet/numbered lists) — it will be rendered properly, not shown as raw text.`;

/**
 * Multi-turn chat used by the AI Copilot page. `messages` alternates
 * user/assistant turns; only the last message is sent as the new turn, the
 * rest becomes chat history so follow-up questions keep context.
 */
export async function generateChatResponse(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
  if (!messages.length) {
    throw new Error("At least one message is required.");
  }
  const ai = client();

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages[messages.length - 1];

  try {
    const chat = ai.chats.create({
      model: MODEL,
      history,
      config: { systemInstruction: systemPrompt?.trim() ? systemPrompt : DEFAULT_SYSTEM_PROMPT },
    });

    const result = await chat.sendMessage({ message: lastMessage.content });
    console.log(`[Gemini] ${MODEL} responded OK (${result.text?.length ?? 0} chars)`);
    return result.text ?? "";
  } catch (err) {
    throw classifyGeminiError(err);
  }
}

/** Legacy single-turn helper, kept for callers that just want one prompt +
 *  weather context answered without managing conversation history. */
export async function generateWeatherResponse(prompt: string, contextData?: unknown): Promise<string> {
  const ai = client();
  const systemInstruction = `${DEFAULT_SYSTEM_PROMPT}\n\nCURRENT WEATHER CONTEXT:\n${JSON.stringify(contextData ?? {}, null, 2)}`;

  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { systemInstruction },
    });
    console.log(`[Gemini] ${MODEL} responded OK (${result.text?.length ?? 0} chars)`);
    return result.text ?? "";
  } catch (err) {
    throw classifyGeminiError(err);
  }
}
