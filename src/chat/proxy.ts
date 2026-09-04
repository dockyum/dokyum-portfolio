export const UNAVAILABLE_MESSAGE = "지금은 대화할 수 없어요. 잠시 후 다시 시도해 주세요.";
export const NOT_CONNECTED_MESSAGE = "트윈이 아직 연결되지 않았어요.";

export const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "x-vercel-ai-ui-message-stream",
  "x-twin-quota-limit",
  "x-twin-quota-remaining",
] as const;

const CONVERSATION_ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;

export type ForwardChatInput = {
  upstreamUrl: string;
  body: string;
  sessionId: string;
  conversationId: string | null;
  secret?: string;
  signal: AbortSignal;
  fetch: typeof globalThis.fetch;
};

export function buildUpstreamRequest(
  input: Omit<ForwardChatInput, "fetch">,
): { url: string; init: RequestInit } {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-twin-session": input.sessionId,
  };

  if (input.conversationId && CONVERSATION_ID_PATTERN.test(input.conversationId)) {
    headers["x-twin-conversation"] = input.conversationId;
  }

  if (input.secret) {
    headers.authorization = `Bearer ${input.secret}`;
  }

  return {
    url: `${input.upstreamUrl.replace(/\/+$/, "")}/api/chat`,
    init: { method: "POST", headers, body: input.body, signal: input.signal },
  };
}

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

export async function forwardChat(input: ForwardChatInput): Promise<Response> {
  const { url, init } = buildUpstreamRequest(input);
  let upstream: Response;

  try {
    upstream = await input.fetch(url, init);
  } catch (error) {
    if (input.signal.aborted || isAbortError(error)) {
      return new Response(null, { status: 499 });
    }

    return Response.json({ error: UNAVAILABLE_MESSAGE }, { status: 502 });
  }

  const headers = new Headers({ "cache-control": "no-store" });

  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);

    if (value !== null) {
      headers.set(name, value);
    }
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}
