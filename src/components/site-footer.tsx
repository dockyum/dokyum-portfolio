import { VisitorCount } from "./visitor-count";

export const footerLinks = {
  pdf: { href: "/dokyum-kim-portfolio.pdf", label: "PDF" },
  contact: { href: "mailto:snfltptkd91@gmail.com", label: "CONTACT" },
} as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} DOKYUM KIM</p>
      <p className="site-visitor">
        <span>VISITORS</span> <VisitorCount />
      </p>
      <nav className="site-footer-links" aria-label="포트폴리오 PDF와 연락처">
        <a href={footerLinks.pdf.href} download>
          {footerLinks.pdf.label} <span aria-hidden="true">↓</span>
        </a>
        <a href={footerLinks.contact.href}>
          {footerLinks.contact.label} <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </footer>
  );
}
