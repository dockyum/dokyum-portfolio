import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "./site-url";

describe("resolveSiteUrl", () => {
  it("prefers the explicit public site URL", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com",
        VERCEL_PROJECT_PRODUCTION_URL: "ignored.vercel.app",
      }),
    ).toEqual(new URL("https://portfolio.example.com"));
  });

  it("uses the Vercel production hostname when explicit URL is absent", () => {
    expect(
      resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "dokyum-portfolio.vercel.app" }),
    ).toEqual(new URL("https://dokyum-portfolio.vercel.app"));
  });

  it("falls back to local development", () => {
    expect(resolveSiteUrl({})).toEqual(new URL("http://localhost:3000"));
  });
});
