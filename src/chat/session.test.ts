import { describe, expect, it } from "vitest";

import { CHAT_SESSION_COOKIE, resolveChatSession } from "./session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("resolveChatSession", () => {
  it("issues a new UUID and asks to set the cookie when there is none", () => {
    const session = resolveChatSession(undefined);

    expect(session.setCookie).toBe(true);
    expect(session.id).toMatch(UUID);
  });

  it("keeps a valid existing session id without re-setting the cookie", () => {
    const id = "6f1c2a4e-3b2d-4c7a-9e1f-0a1b2c3d4e5f";

    expect(resolveChatSession(id)).toEqual({ id, setCookie: false });
  });

  it("normalises the id to lower case", () => {
    expect(resolveChatSession("6F1C2A4E-3B2D-4C7A-9E1F-0A1B2C3D4E5F").id).toBe(
      "6f1c2a4e-3b2d-4c7a-9e1f-0a1b2c3d4e5f",
    );
  });

  it("replaces a malformed cookie value", () => {
    expect(resolveChatSession("not-a-uuid; evil", () => "generated")).toEqual({
      id: "generated",
      setCookie: true,
    });
  });

  it("names the cookie", () => {
    expect(CHAT_SESSION_COOKIE).toBe("dk_chat_session_v1");
  });
});
