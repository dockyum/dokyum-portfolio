"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { UNAVAILABLE_MESSAGE } from "@/chat/proxy";
import {
  applyQuotaResponse,
  countLocalSend,
  describeQuota,
  initialQuota,
  type QuotaState,
} from "@/chat/quota";

const STORAGE_KEY = "dk_ask_docky_v1";
const EMAIL_HREF = "mailto:snfltptkd91@gmail.com";
const PLACEHOLDER_IDLE = "docky에 대해 물어보세요.";
const PLACEHOLDER_ACTIVE = "이어서 물어보세요.";
const CAPTION =
  "docky의 기록을 학습한 AI 트윈이 답합니다. 확답과 약속은 본인에게 직접 물어봐 주세요.";
const LIMIT_TEXT = "이 세션의 질문을 모두 썼어요. 더 궁금한 건 이메일로 물어봐 주세요.";
const LABELS = { user: "YOU", assistant: "DOCKY·AI", system: "SYSTEM" } as const;

type StoredChat = { v: 1; conversationId: string; messages: UIMessage[]; quota: QuotaState };

function readStoredChat(): StoredChat | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredChat> | null;
    if (
      parsed?.v === 1 &&
      typeof parsed.conversationId === "string" &&
      Array.isArray(parsed.messages) &&
      typeof parsed.quota === "object" &&
      parsed.quota !== null
    ) {
      return parsed as StoredChat;
    }
  } catch {
    /* unreadable storage counts as empty */
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }

  return null;
}

function writeStoredChat(value: StoredChat) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function messageText(message: UIMessage): string {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}

/** 서버가 보낸 `{ error }` 문구가 있으면 그것을, 없으면 프록시 실패 문구 */
function errorText(error: Error): string {
  try {
    const parsed: unknown = JSON.parse(error.message);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "error" in parsed &&
      typeof parsed.error === "string"
    ) {
      return parsed.error;
    }
  } catch {
    /* not a server message */
  }

  return UNAVAILABLE_MESSAGE;
}

export function AskDocky() {
  const conversationRef = useRef("");
  const transcriptRef = useRef<HTMLOListElement>(null);
  const [quota, setQuota] = useState<QuotaState>(initialQuota);
  const [input, setInput] = useState("");
  const [restored, setRestored] = useState(false);
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: () => ({ "x-twin-conversation": conversationRef.current }),
        fetch: async (url, init) => {
          const response = await globalThis.fetch(url, init);
          setQuota((state) => applyQuotaResponse(state, response));

          return response;
        },
      }),
  );
  const { messages, sendMessage, setMessages, status, error } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";
  const active = messages.length > 0;

  // sessionStorage는 클라이언트에만 있으므로 마운트 후 복원한다(hydration 불일치 방지).
  useEffect(() => {
    const stored = readStoredChat();
    if (!stored) return;

    conversationRef.current = stored.conversationId;
    setMessages(stored.messages);
    setQuota(stored.quota);
    setRestored(true);
  }, [setMessages]);

  useEffect(() => {
    if (!active || busy) return;

    writeStoredChat({ v: 1, conversationId: conversationRef.current, messages, quota });
  }, [active, busy, messages, quota]);

  // 트랜스크립트 안에서만 최신 턴을 따라간다. 페이지는 스크롤하지 않는다.
  useEffect(() => {
    const transcript = transcriptRef.current;
    if (transcript) transcript.scrollTop = transcript.scrollHeight;
  }, [messages, status]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy || quota.exhausted) return;

    if (!conversationRef.current) conversationRef.current = newId();
    setInput("");
    setQuota(countLocalSend);
    void sendMessage({ text });
  }

  const { visible, srText } = describeQuota(quota);
  const statusText = busy
    ? "docky가 답하는 중"
    : error
      ? errorText(error)
      : active
        ? "답변 완료"
        : "";
  const lastAssistantId = messages.findLast((message) => message.role === "assistant")?.id;

  return (
    <section
      className="ask-docky"
      id="ask-docky"
      data-state={active ? "active" : "idle"}
      data-restored={restored || undefined}
      aria-labelledby="ask-docky-title"
    >
      <div className="ask-docky-head">
        <h2 className="ask-docky-title" id="ask-docky-title">
          ASK DOCKY <span className="ask-docky-kind">· AI TWIN</span>
        </h2>
        <p className="ask-docky-count">
          <span className="sr-only">{srText}</span>
          <span aria-hidden="true">{visible}</span>
        </p>
      </div>
      <div className="ask-docky-transcript-wrap">
        <ol className="ask-docky-transcript" aria-label="대화 기록" ref={transcriptRef}>
          {messages.map((message) => (
            <li className="ask-docky-turn" data-role={message.role} key={message.id}>
              <span className="ask-docky-turn-label">{LABELS[message.role]}</span>
              <div className="ask-docky-turn-body">
                {messageText(message)}
                {status === "streaming" && message.id === lastAssistantId ? (
                  <span className="ask-docky-caret" aria-hidden="true" />
                ) : null}
              </div>
            </li>
          ))}
          {status === "submitted" ? (
            <li className="ask-docky-turn is-pending" data-role="assistant">
              <span className="ask-docky-turn-label">{LABELS.assistant}</span>
              <div className="ask-docky-turn-body">…</div>
            </li>
          ) : null}
          {error ? (
            <li className="ask-docky-turn" data-role="system">
              <span className="ask-docky-turn-label">{LABELS.system}</span>
              <div className="ask-docky-turn-body">{errorText(error)}</div>
            </li>
          ) : null}
        </ol>
      </div>
      <form className="ask-docky-form" onSubmit={onSubmit}>
        <input
          className="ask-docky-input"
          type="text"
          aria-label="docky에게 질문"
          placeholder={quota.exhausted ? "" : active ? PLACEHOLDER_ACTIVE : PLACEHOLDER_IDLE}
          maxLength={2000}
          autoComplete="off"
          value={input}
          disabled={quota.exhausted}
          onChange={(event) => setInput(event.target.value)}
        />
        <button
          className="ask-docky-send"
          type="submit"
          aria-label="질문 보내기"
          aria-disabled={busy || quota.exhausted}
          disabled={quota.exhausted}
        >
          →
        </button>
      </form>
      {quota.exhausted ? (
        <p className="ask-docky-limit">
          {LIMIT_TEXT}{" "}
          <a href={EMAIL_HREF}>
            이메일로 연락하기 <span aria-hidden="true">↗</span>
          </a>
        </p>
      ) : (
        <p className="ask-docky-caption">{CAPTION}</p>
      )}
      <p className="ask-docky-status sr-only" aria-live="polite">
        {statusText}
      </p>
    </section>
  );
}
