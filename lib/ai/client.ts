type Provider = "gemini" | "groq" | "ollama" | "anthropic";

const PROVIDER = (process.env.LLM_PROVIDER ?? "gemini") as Provider;

const DEFAULT_MODEL: Record<Provider, string> = {
  gemini: "gemini-3.5-flash",
  groq: "llama-3.3-70b-versatile",
  ollama: "llama3.1",
  anthropic: "claude-sonnet-5",
};

const MODEL = process.env.LLM_MODEL ?? DEFAULT_MODEL[PROVIDER];

export const hasLLM = () =>
  PROVIDER === "ollama" || Boolean(process.env.LLM_API_KEY);

type CallOptions = {
  system: string;
  prompt: string;
  maxTokens?: number;
  timeoutMs?: number;
};

type Request = { url: string; headers: Record<string, string>; body: unknown };

function buildRequest(
  { system, prompt, maxTokens = 2000 }: CallOptions,
  key: string
): Request {
  switch (PROVIDER) {
    case "gemini":
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: {
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            // Gemini 3.x reasons before answering and that reasoning is billed
            // against this budget, so it must comfortably exceed the answer size.
            maxOutputTokens: Math.max(maxTokens * 4, 8000),
            temperature: 0.7,
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 0 },
          },
        },
      };

    case "groq":
      return {
        url: "https://api.groq.com/openai/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: {
          model: MODEL,
          max_tokens: maxTokens,
          temperature: 0.7,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        },
      };

    case "ollama":
      return {
        url: `${process.env.OLLAMA_URL ?? "http://localhost:11434"}/api/chat`,
        headers: { "Content-Type": "application/json" },
        body: {
          model: MODEL,
          stream: false,
          format: "json",
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        },
      };

    case "anthropic":
    default:
      return {
        url: "https://api.anthropic.com/v1/messages",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: {
          model: MODEL,
          max_tokens: maxTokens,
          system,
          messages: [{ role: "user", content: prompt }],
        },
      };
  }
}

function extractText(data: unknown): string | null {
  const d = data as Record<string, unknown>;

  switch (PROVIDER) {
    case "gemini": {
      const candidates = d.candidates as
        | {
            content?: { parts?: { text?: string }[] };
            finishReason?: string;
          }[]
        | undefined;

      const first = candidates?.[0];

      if (!first) {
        const feedback = d.promptFeedback as { blockReason?: string } | undefined;
        console.warn(
          "Gemini returned no candidates.",
          feedback?.blockReason ? `Blocked: ${feedback.blockReason}` : ""
        );
        return null;
      }

      const text = (first.content?.parts ?? []).map((p) => p.text ?? "").join("");

      if (!text) {
        console.warn(
          `Gemini returned empty text. finishReason=${first.finishReason ?? "unknown"}.`,
          first.finishReason === "MAX_TOKENS"
            ? "The output budget was exhausted — raise maxOutputTokens."
            : ""
        );
        return null;
      }

      return text;
    }

    case "groq": {
      const choices = d.choices as { message?: { content?: string } }[] | undefined;
      return choices?.[0]?.message?.content ?? null;
    }

    case "ollama": {
      const message = d.message as { content?: string } | undefined;
      return message?.content ?? null;
    }

    case "anthropic":
    default: {
      const content = d.content as { type: string; text?: string }[] | undefined;
      return (
        (content ?? [])
          .filter((b) => b.type === "text")
          .map((b) => b.text ?? "")
          .join("\n") || null
      );
    }
  }
}

/**
 * Calls the configured provider and returns raw text, or null on any failure.
 * Never throws — callers fall back to template content.
 */
export async function callLLM(options: CallOptions): Promise<string | null> {
  const key = process.env.LLM_API_KEY ?? "";
  if (!hasLLM()) {
    console.warn("No LLM configured — set LLM_PROVIDER and LLM_API_KEY.");
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 30000);

  try {
    const { url, headers, body } = buildRequest(options, key);

    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.warn(`LLM (${PROVIDER}/${MODEL}) failed: ${res.status}`, detail.slice(0, 400));
      return null;
    }

    return extractText(await res.json());
  } catch (error) {
    console.warn(
      `LLM (${PROVIDER}/${MODEL}) error:`,
      error instanceof Error ? error.message : error
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Extracts a JSON object from model output, tolerating fences and preamble. */
export function parseJSON<T>(text: string | null): T | null {
  if (!text) return null;

  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    console.warn("No JSON object found in model output:", cleaned.slice(0, 300));
    return null;
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch (error) {
    console.warn(
      "Model output was not valid JSON:",
      error instanceof Error ? error.message : error,
      "|",
      cleaned.slice(0, 300)
    );
    return null;
  }
}

export const currentProvider = () => ({ provider: PROVIDER, model: MODEL });