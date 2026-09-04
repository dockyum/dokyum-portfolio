import { NextRequest, NextResponse } from "next/server";

import { forwardChat, NOT_CONNECTED_MESSAGE } from "@/chat/proxy";
import { CHAT_SESSION_COOKIE, resolveChatSession } from "@/chat/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BODY_BYTES = 64 * 1024;

function isJsonObject(text: string): boolean {
  try {
    const parsed: unknown = JSON.parse(text);

    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const upstreamUrl = process.env.TWIN_API_URL;

  if (!upstreamUrl) {
    return NextResponse.json({ error: NOT_CONNECTED_MESSAGE }, { status: 503 });
  }

  const body = await request.text();

  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "요청이 너무 커요." }, { status: 413 });
  }

  if (!isJsonObject(body)) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const session = resolveChatSession(request.cookies.get(CHAT_SESSION_COOKIE)?.value);
  const upstream = await forwardChat({
    upstreamUrl,
    body,
    sessionId: session.id,
    conversationId: request.headers.get("x-twin-conversation"),
    secret: process.env.TWIN_PROXY_SECRET || undefined,
    signal: request.signal,
    fetch: (url, init) => fetch(url, init),
  });
  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });

  if (session.setCookie) {
    response.cookies.set(CHAT_SESSION_COOKIE, session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return response;
}
