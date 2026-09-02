"use client";

import { useEffect, useState } from "react";

function isValidVisitorCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

let inFlightVisitorCountRequest: Promise<number | null> | null = null;

async function requestVisitorCount(): Promise<number | null> {
  const response = await fetch("/api/visitors", { method: "POST" });

  if (!response.ok) {
    return null;
  }

  const data: unknown = await response.json();
  const nextCount =
    typeof data === "object" && data !== null && "count" in data ? data.count : null;

  return isValidVisitorCount(nextCount) ? nextCount : null;
}

function getVisitorCount(): Promise<number | null> {
  if (inFlightVisitorCountRequest) {
    return inFlightVisitorCountRequest;
  }

  const sharedRequest = requestVisitorCount().finally(() => {
    if (inFlightVisitorCountRequest === sharedRequest) {
      inFlightVisitorCountRequest = null;
    }
  });
  inFlightVisitorCountRequest = sharedRequest;

  return inFlightVisitorCountRequest;
}

export function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      try {
        const nextCount = await getVisitorCount();

        if (!cancelled) {
          setCount(nextCount);
        }
      } catch {
        if (!cancelled) {
          setCount(null);
        }
      }
    }

    void loadCount();

    return () => {
      cancelled = true;
    };
  }, []);

  return <span>{count === null ? "—" : String(count).padStart(6, "0")}</span>;
}
