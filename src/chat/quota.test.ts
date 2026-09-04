import { describe, expect, it } from "vitest";

import {
  applyQuotaResponse,
  countLocalSend,
  DEFAULT_QUESTION_LIMIT,
  describeQuota,
  initialQuota,
} from "./quota";

const response = (status: number, headers: Record<string, string> = {}) => ({
  status,
  headers: new Headers(headers),
});

describe("quota", () => {
  it("starts at zero of the default limit", () => {
    expect(initialQuota()).toEqual({ used: 0, limit: DEFAULT_QUESTION_LIMIT, exhausted: false });
    expect(DEFAULT_QUESTION_LIMIT).toBe(8);
  });

  it("counts local sends and exhausts at the limit", () => {
    let state = initialQuota();
    for (let i = 0; i < 7; i += 1) state = countLocalSend(state);

    expect(state).toEqual({ used: 7, limit: 8, exhausted: false });
    expect(countLocalSend(state)).toEqual({ used: 8, limit: 8, exhausted: true });
  });

  it("takes limit and remaining from the twin's headers", () => {
    const state = applyQuotaResponse(
      countLocalSend(initialQuota()),
      response(200, { "x-twin-quota-limit": "8", "x-twin-quota-remaining": "5" }),
    );

    expect(state).toEqual({ used: 3, limit: 8, exhausted: false });
  });

  it("keeps the local count when the headers are missing or malformed", () => {
    const local = countLocalSend(initialQuota());

    expect(applyQuotaResponse(local, response(200))).toEqual(local);
    expect(
      applyQuotaResponse(local, response(200, { "x-twin-quota-limit": "0", "x-twin-quota-remaining": "-1" })),
    ).toEqual(local);
  });

  it("exhausts on 429 and when nothing remains", () => {
    expect(applyQuotaResponse(initialQuota(), response(429, { "x-twin-quota-remaining": "0" }))).toEqual({
      used: 8,
      limit: 8,
      exhausted: true,
    });
    expect(applyQuotaResponse(initialQuota(), response(429))).toEqual({ used: 0, limit: 8, exhausted: true });
    expect(applyQuotaResponse(initialQuota(), response(200, { "x-twin-quota-remaining": "0" })).exhausted).toBe(true);
  });

  it("describes the counter for sighted and screen-reader users", () => {
    expect(describeQuota({ used: 3, limit: 8, exhausted: false })).toEqual({
      visible: "3 / 8",
      srText: "질문 8개 중 3개 사용",
    });
  });
});
