import type { HarnessDiagram } from "./harness";

export type CaseMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  /** Grid columns (out of 12) the figure occupies inside a media grid. */
  span?: number;
  /** object-position used when the hero has to be cropped. */
  position?: string;
};

export type CaseFact = { label: string; value: string };

export type CaseGroup = { title: string; items: readonly string[] };

export type CaseChapter = {
  /** Anchor id for deep links (e.g. "system" → /work/touchpoint#system). */
  id?: string;
  label: string;
  title: string;
  lead?: string;
  body?: readonly string[];
  quotes?: readonly string[];
  groups?: readonly CaseGroup[];
  media?: readonly CaseMedia[];
  /** Interactive harness diagram rendered after the body (click to enlarge, drag, zoom). */
  diagram?: HarnessDiagram;
};

export type CaseOutcome = {
  title: string;
  detail?: readonly string[];
  note?: string;
  shift?: { from: CaseFact; to: CaseFact };
  media?: readonly CaseMedia[];
};

export type CaseTakeaway = { title: string; body: readonly string[] };

export type CaseStudy = {
  /** One-line description of the product itself. */
  tagline: string;
  /** What the project solved, in one sentence. */
  headline: string;
  /** 책임 · 핵심 의사결정 · 성과 · 협업 인원 */
  facts: readonly CaseFact[];
  hero: CaseMedia;
  chapters: readonly CaseChapter[];
  outcome: CaseOutcome;
  takeaways: readonly CaseTakeaway[];
  expansion?: CaseChapter;
};
