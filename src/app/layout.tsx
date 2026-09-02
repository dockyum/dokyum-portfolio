import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource-variable/inter/wght.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/roboto-condensed/wght.css";
import "pretendard/dist/web/variable/pretendardvariable.css";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { resolveSiteUrl } from "@/lib/site-url";

import "./globals.css";

const siteUrl = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "dokyum kim — Product Portfolio",
    template: "%s — dokyum kim",
  },
  description:
    "제품 밖의 병목까지 발견하고, 사업이 흐르도록 제품과 운영을 다시 설계하는 dokyum kim의 포트폴리오입니다.",
  authors: [{ name: "dokyum kim" }],
  creator: "dokyum kim",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    locale: "ko_KR",
    type: "website",
    title: "dokyum kim — Product Portfolio",
    description: "제품 밖의 병목까지, 사업이 흐르도록 다시 설계합니다.",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "DOKYUM KIM — Building Beyond the Product",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "dokyum kim — Product Portfolio",
    description: "제품 밖의 병목까지, 사업이 흐르도록 다시 설계합니다.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
