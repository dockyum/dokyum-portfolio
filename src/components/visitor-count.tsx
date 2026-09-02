"use client";

import { useEffect, useState } from "react";

function isValidVisitorCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      try {
        const response = await fetch("/api/visitors", { method: "POST" });

        if (!response.ok) {
          if (!cancelled) {
            setCount(null);
          }
          return;
        }

        const data: unknown = await response.json();
        const nextCount =
          typeof data === "object" && data !== null && "count" in data
            ? data.count
            : null;

        if (isValidVisitorCount(nextCount)) {
          if (!cancelled) {
            setCount(nextCount);
          }
          return;
        }
      } catch {
        // Fall through to the documented unavailable state.
      }

      if (!cancelled) {
        setCount(null);
      }
    }

    void loadCount();

    return () => {
      cancelled = true;
    };
  }, []);

  return <span>{count === null ? "—" : String(count).padStart(6, "0")}</span>;
}
