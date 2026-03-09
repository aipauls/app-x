import { parseJSON } from "../utils/parsing";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1024;

interface AnthropicCallOptions {
  systemPrompt: string;
  userMessage: string;
  imageBase64?: string | null;
  apiKey?: string;
}

interface AnthropicResponse {
  content: Array<{ type: string; text?: string }>;
}

export async function callClaude(options: AnthropicCallOptions): Promise<string> {
  const { systemPrompt, userMessage, imageBase64, apiKey } = options;

  const content: Array<Record<string, unknown>> = [];

  if (imageBase64) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
    });
  }

  content.push({ type: "text", text: userMessage });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorBody}`);
  }

  const data: AnthropicResponse = await response.json();
  return data.content?.map((block) => block.text || "").join("") || "";
}

export async function callClaudeJSON<T>(options: AnthropicCallOptions): Promise<T | null> {
  const rawText = await callClaude(options);
  return parseJSON<T>(rawText);
}
