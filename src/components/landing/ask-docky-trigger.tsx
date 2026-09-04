"use client";

import { useEffect, useState } from "react";

import { MobiusMark } from "./mobius-mark";

const TARGET_ID = "ask-docky";

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function AskDockyTrigger() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById(TARGET_ID);
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => setHidden(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.2 },
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  function open() {
    const target = document.getElementById(TARGET_ID);
    if (!target) return;

    target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    target.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      className="ask-docky-trigger"
      aria-label="docky에게 물어보기"
      aria-controls={TARGET_ID}
      data-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : 0}
      onClick={open}
    >
      <MobiusMark />
      <span className="ask-docky-trigger-label" aria-hidden="true">
        ASK DOCKY
      </span>
    </button>
  );
}
