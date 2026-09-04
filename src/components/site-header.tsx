"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { getProjectsByKind } from "@/content/projects";

const workProjects = getProjectsByKind("career");
const WORK_CLOSE_DELAY = 150;

const globalLinks = {
  career: { href: "/career", label: "CAREER" },
  pdf: { href: "/dokyum-kim-portfolio.pdf", label: "PDF" },
  email: { href: "mailto:snfltptkd91@gmail.com", label: "CONTACT" },
} as const;

type ProjectLinksProps = {
  pathname: string;
};

function ProjectLinks({ pathname }: ProjectLinksProps) {
  return (
    <ul className="site-project-links">
      {workProjects.map((project, index) => (
        <li key={project.slug}>
          <Link
            className="site-project-link"
            href={project.route}
            aria-current={pathname === project.route ? "page" : undefined}
          >
            <span className="site-project-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="site-project-name">{project.name}</span>
            <span className="site-project-period">{project.period ?? ""}</span>
            <span className="site-project-outcome">{project.activeLine}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

type GlobalLinksProps = {
  pathname: string;
};

function GlobalLinks({ pathname }: GlobalLinksProps) {
  return (
    <>
      <Link
        className="site-career-link"
        href={globalLinks.career.href}
        aria-current={pathname === globalLinks.career.href ? "page" : undefined}
      >
        {globalLinks.career.label}
      </Link>
      <a className="site-pdf-link" href={globalLinks.pdf.href} download>
        {globalLinks.pdf.label}
      </a>
      <a className="site-email-link" href={globalLinks.email.href}>
        {globalLinks.email.label}
        <span aria-hidden="true">↗</span>
      </a>
    </>
  );
}

export function SiteHeader() {
  const [workOpen, setWorkOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const workTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const workCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workOpenedByHover = useRef(false);
  const pathname = usePathname();

  function cancelWorkClose() {
    if (workCloseTimer.current === null) return;
    clearTimeout(workCloseTimer.current);
    workCloseTimer.current = null;
  }

  function closeWork() {
    workOpenedByHover.current = false;
    setWorkOpen(false);
  }

  // Hover opens Work for mouse users only; touch and keyboard keep the click toggle.
  function openWorkFromPointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    cancelWorkClose();
    workOpenedByHover.current = true;
    setWorkOpen(true);
  }

  function closeWorkFromPointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    cancelWorkClose();
    workCloseTimer.current = setTimeout(() => {
      workCloseTimer.current = null;
      closeWork();
    }, WORK_CLOSE_DELAY);
  }

  function toggleWork() {
    // A click on a trigger the mouse already hovered open should not snap the menu shut.
    if (workOpenedByHover.current) {
      setWorkOpen(true);
      return;
    }
    setWorkOpen((open) => !open);
  }

  useEffect(() => cancelWorkClose, []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (mobileOpen) {
        setMobileOpen(false);
        mobileTriggerRef.current?.focus();
      } else if (workOpen) {
        closeWork();
        workTriggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [mobileOpen, workOpen]);

  useEffect(() => {
    closeWork();
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="site-header">
      <Link className="site-wordmark" href="/" aria-label="Dokyum Kim 홈">
        DOKYUM KIM
      </Link>

      <nav className="site-actions" aria-label="주요 링크">
        <div
          className="site-work-navigation"
          onPointerEnter={openWorkFromPointer}
          onPointerLeave={closeWorkFromPointer}
        >
          <button
            ref={workTriggerRef}
            className="site-work-trigger"
            type="button"
            aria-label="프로젝트 메뉴"
            aria-expanded={workOpen}
            aria-controls="work-menu"
            onClick={toggleWork}
          >
            WORK
          </button>
          <div id="work-menu" className="site-work-menu" hidden={!workOpen}>
            <ProjectLinks pathname={pathname} />
          </div>
        </div>
        <GlobalLinks pathname={pathname} />
      </nav>

      <button
        ref={mobileTriggerRef}
        className="site-menu-trigger"
        type="button"
        aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
        onClick={() => setMobileOpen((open) => !open)}
      >
        MENU
      </button>

      <div id="mobile-menu" className="site-mobile-menu" hidden={!mobileOpen}>
        <nav aria-label="모바일 메뉴">
          <ProjectLinks pathname={pathname} />
          <div className="site-mobile-actions">
            <GlobalLinks pathname={pathname} />
          </div>
        </nav>
      </div>
    </header>
  );
}
