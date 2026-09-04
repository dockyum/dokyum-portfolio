export const CHAT_SESSION_COOKIE = "dk_chat_session_v1";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ChatSession = { id: string; setCookie: boolean };

export function resolveChatSession(
  cookieValue: string | undefined,
  generateId: () => string = () => crypto.randomUUID(),
): ChatSession {
  if (cookieValue && UUID_PATTERN.test(cookieValue)) {
    return { id: cookieValue.toLowerCase(), setCookie: false };
  }

  return { id: generateId(), setCookie: true };
}
