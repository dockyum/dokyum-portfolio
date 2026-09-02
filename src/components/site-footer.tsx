import { VisitorCount } from "./visitor-count";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} DOKYUM KIM</p>
      <p className="site-visitor">
        <span>VISITORS</span> <VisitorCount />
      </p>
      <a href="mailto:snfltptkd91@gmail.com">EMAIL ↗</a>
    </footer>
  );
}
