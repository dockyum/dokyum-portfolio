export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-wordmark" href="/" aria-label="Dokyum Kim 홈">
        DOKYUM KIM
      </a>
      <nav className="site-actions" aria-label="주요 링크">
        <a className="site-pdf-link" href="/dokyum-kim-portfolio.pdf" download>
          포트폴리오 PDF
        </a>
        <a className="site-email-link" href="mailto:snfltptkd91@gmail.com">
          이메일로 연락하기
          <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}
