import { NextRequest, NextResponse } from "next/server";

import { registerVisit } from "@/visitors/register-visit";
import { createRedisVisitorStore } from "@/visitors/redis-store";

const COOKIE = "dk_portfolio_visited_v1";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const result = await registerVisit(
      createRedisVisitorStore(),
      request.cookies.has(COOKIE),
    );
    const response = NextResponse.json({ count: result.count });

    if (result.setCookie) {
      response.cookies.set(COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 34_560_000,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ count: null }, { status: 503 });
  }
}
