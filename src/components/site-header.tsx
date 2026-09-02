"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { projects } from "@/content/projects";

const globalLinks = {
  career: { href: "/career", label: "커리어" },
  pdf: { href: "/dokyum-kim-portfolio.pdf", label: "포트폴리오 PDF" },
  email: { href: "mailto:snfltptkd91@gmail.com", label: "이메일로 연락하기" },
} as const;

type ProjectLinksProps = {
  pathname: string;
};

function ProjectLinks({ pathname }: ProjectLinksProps) {
  return (
    <ul className="site-project-links">
      {projects.map((project, index) => (
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
  const pathname = usePathname();

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (mobileOpen) {
        setMobileOpen(false);
        mobileTriggerRef.current?.focus();
      } else if (workOpen) {
        setWorkOpen(false);
        workTriggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [mobileOpen, workOpen]);

  useEffect(() => {
    setWorkOpen(false);
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
        <div className="site-work-navigation">
          <button
            ref={workTriggerRef}
            className="site-work-trigger"
            type="button"
            aria-label="프로젝트 메뉴"
            aria-expanded={workOpen}
            aria-controls="work-menu"
            onClick={() => setWorkOpen((open) => !open)}
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
