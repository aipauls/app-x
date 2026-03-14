import { parseJSON } from "../utils/parsing";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1024;
const MAX_RETRIES = 3;

interface AnthropicCallOptions {
  systemPrompt: string;
  userMessage: string;
  imageBase64?: string | null;
  apiKey?: string;
}

interface AnthropicResponse {
  content: Array<{ type: string; text?: string }>;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callClaude(options: AnthropicCallOptions): Promise<string> {
  const { systemPrompt, userMessage, imageBase64 } = options;
  const apiKey = options.apiKey ?? process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? "";

  const content: Array<Record<string, unknown>> = [];
  if (imageBase64) {
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } });
  }
  content.push({ type: "text", text: userMessage });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };

  const body = JSON.stringify({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: "user", content }],
  });

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const backoff = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      console.warn(`[Anthropic] Retry ${attempt}/${MAX_RETRIES - 1} after ${backoff}ms`);
      await sleep(backoff);
    }

    try {
      const response = await fetch(API_URL, { method: "POST", headers, body });

      if (!response.ok) {
        const errorBody = await response.text();
        const error = new Error(`Anthropic API error ${response.status}: ${errorBody}`);
        // Only retry on rate limit or server errors
        if (response.status !== 429 && response.status < 500) throw error;
        lastError = error;
        continue;
      }

      const data: AnthropicResponse = await response.json();
      return data.content?.map((block) => block.text || "").join("") || "";
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Anthropic API error 4")) throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Anthropic API failed after retries");
}

export async function callClaudeJSON<TResult>(options: AnthropicCallOptions): Promise<TResult | null> {
  try {
    const rawText = await callClaude(options);
    const parsed = parseJSON<TResult>(rawText);

    if (parsed === null) {
      // Retry once with explicit JSON instruction
      const retryText = await callClaude({
        ...options,
        userMessage: `${options.userMessage}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no backticks.`,
      });
      return parseJSON<TResult>(retryText);
    }

    return parsed;
  } catch (error) {
    console.error("[Anthropic] callClaudeJSON failed:", error instanceof Error ? error.message : error);
    return null;
  }
}
