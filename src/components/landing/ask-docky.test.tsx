import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AskDocky } from "./ask-docky";

const STREAM_HEADERS = {
  "content-type": "text/event-stream",
  "x-vercel-ai-ui-message-stream": "v1",
};

function answer(text: string) {
  return [
    { type: "start", messageId: "a1" },
    { type: "text-start", id: "t1" },
    { type: "text-delta", id: "t1", delta: text },
    { type: "text-end", id: "t1" },
    { type: "finish" },
  ];
}

function sseResponse(chunks: object[], headers: Record<string, string> = {}) {
  const body = `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("")}data: [DONE]\n\n`;

  return new Response(body, { status: 200, headers: { ...STREAM_HEADERS, ...headers } });
}

const fetchMock = vi.fn();

function transcript() {
  return within(screen.getByRole("list", { name: "대화 기록" }));
}

async function ask(text: string) {
  await userEvent.type(screen.getByRole("textbox", { name: "docky에게 질문" }), `${text}{enter}`);
}

describe("AskDocky", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts compact with the idle placeholder, counter and caption", () => {
    render(<AskDocky />);

    expect(screen.getByRole("heading", { name: /ASK DOCKY/ })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("docky에 대해 물어보세요.")).toBeInTheDocument();
    expect(screen.getByText("0 / 8")).toBeInTheDocument();
    expect(screen.getByText("질문 8개 중 0개 사용")).toBeInTheDocument();
    expect(screen.getByText(/docky의 기록을 학습한 AI 트윈이 답합니다/)).toBeInTheDocument();
    expect(document.querySelector(".ask-docky")).toHaveAttribute("data-state", "idle");
  });

  it("expands on the first question, streams the answer and counts locally", async () => {
    fetchMock.mockResolvedValueOnce(sseResponse(answer("커피팅에서는 운영 병목부터 봤어요.")));
    render(<AskDocky />);

    await ask("커피팅에서 CPO로 무엇을 했나요?");

    expect(document.querySelector(".ask-docky")).toHaveAttribute("data-state", "active");
    expect(screen.getByText("커피팅에서 CPO로 무엇을 했나요?")).toBeInTheDocument();
    expect(await screen.findByText("커피팅에서는 운영 병목부터 봤어요.")).toBeInTheDocument();
    expect(screen.getByText("1 / 8")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("이어서 물어보세요.")).toBeInTheDocument();
    expect(screen.getAllByText("YOU")).toHaveLength(1);
    expect(screen.getAllByText("DOCKY·AI")).toHaveLength(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/chat");
    expect(new Headers(init.headers).get("x-twin-conversation")).toMatch(/^[0-9a-f-]{36}$/);
    await waitFor(() => expect(screen.getByText("답변 완료")).toBeInTheDocument());
  });

  it("takes the counter from the twin's quota headers", async () => {
    fetchMock.mockResolvedValueOnce(
      sseResponse(answer("답"), { "x-twin-quota-limit": "8", "x-twin-quota-remaining": "5" }),
    );
    render(<AskDocky />);

    await ask("질문");

    expect(await screen.findByText("3 / 8")).toBeInTheDocument();
  });

  it("closes the input and offers email when the twin answers 429", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "이 세션의 대화 한도에 닿았어요." }), {
        status: 429,
        headers: {
          "content-type": "application/json",
          "x-twin-quota-limit": "8",
          "x-twin-quota-remaining": "0",
        },
      }),
    );
    render(<AskDocky />);

    await ask("아홉 번째 질문");

    expect(await transcript().findByText("이 세션의 대화 한도에 닿았어요.")).toBeInTheDocument();
    expect(screen.getByText("8 / 8")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "docky에게 질문" })).toBeDisabled();
    expect(screen.getByText(/이 세션의 질문을 모두 썼어요/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /이메일로 연락하기/ })).toHaveAttribute(
      "href",
      "mailto:snfltptkd91@gmail.com",
    );
    expect(screen.queryByText(/docky의 기록을 학습한/)).not.toBeInTheDocument();
  });

  it("shows a system turn when the proxy fails and keeps the input open", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ error: "지금은 대화할 수 없어요. 잠시 후 다시 시도해 주세요." }, { status: 502 }),
    );
    render(<AskDocky />);

    await ask("질문");

    expect(
      await transcript().findByText("지금은 대화할 수 없어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(screen.getByText("SYSTEM")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "docky에게 질문" })).toBeEnabled();
    expect(screen.getByText("1 / 8")).toBeInTheDocument();
  });

  it("falls back to the generic message when the failure has no server text", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<AskDocky />);

    await ask("질문");

    expect(
      await transcript().findByText("지금은 대화할 수 없어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("ignores a second submit while an answer is in flight", async () => {
    let release: (response: Response) => void = () => {};
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        release = resolve;
      }),
    );
    render(<AskDocky />);

    await ask("첫 질문");
    await ask("둘째 질문");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("1 / 8")).toBeInTheDocument();
    expect(screen.getByText("docky가 답하는 중")).toBeInTheDocument();
    release(sseResponse(answer("답")));
    expect(await screen.findByText("답")).toBeInTheDocument();
  });

  it("persists the exchange and restores it on the next mount", async () => {
    fetchMock.mockResolvedValueOnce(sseResponse(answer("이전 답")));
    const first = render(<AskDocky />);
    await ask("이전 질문");
    await screen.findByText("이전 답");
    await waitFor(() =>
      expect(window.sessionStorage.getItem("dk_ask_docky_v1")).toContain("이전 답"),
    );
    first.unmount();

    render(<AskDocky />);

    expect(await screen.findByText("이전 답")).toBeInTheDocument();
    expect(screen.getByText("이전 질문")).toBeInTheDocument();
    expect(screen.getByText("1 / 8")).toBeInTheDocument();
    expect(document.querySelector(".ask-docky")).toHaveAttribute("data-state", "active");
    expect(document.querySelector(".ask-docky")).toHaveAttribute("data-restored", "true");
  });

  it("drops stale storage", () => {
    window.sessionStorage.setItem("dk_ask_docky_v1", '{"v":0}');
    render(<AskDocky />);

    expect(document.querySelector(".ask-docky")).toHaveAttribute("data-state", "idle");
    expect(window.sessionStorage.getItem("dk_ask_docky_v1")).toBeNull();
  });
});
