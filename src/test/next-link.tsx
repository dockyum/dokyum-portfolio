import type { AnchorHTMLAttributes } from "react";

type MockLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | { pathname?: string };
};

export default function MockLink({ href, ...props }: MockLinkProps) {
  const resolvedHref = typeof href === "string" ? href : (href.pathname ?? "");

  return <a href={resolvedHref} {...props} />;
}
