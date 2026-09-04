# dokyum kim — Product Portfolio

제품 밖의 병목까지 찾아, 사업이 성장하는 구조를 만드는 dokyum kim의 포트폴리오입니다.

Live site: https://dokyum-portfolio.vercel.app

## Stack

- Next.js 16.3.3 (native App Router)
- React 19.2.6
- TypeScript 5.9
- pnpm 11
- Upstash Redis for the anonymous visitor counter

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## Environment variables

`.env.local`에 다음 값을 설정합니다.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical URL과 소셜 메타데이터에 사용할 사이트 주소 |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST 인증 토큰 |
| `TWIN_API_URL` | ai-twin 호스트. 비우면 랜딩의 Ask docky 채팅이 렌더되지 않습니다 |
| `TWIN_PROXY_SECRET` | 선택. ai-twin 프록시 호출을 식별하는 공유 시크릿 |

`NEXT_PUBLIC_SITE_URL`이 없으면 Vercel의 `VERCEL_PROJECT_PRODUCTION_URL`을 사용하고, 그 값도 없으면 `http://localhost:3000`을 사용합니다.

## Routes

- `/` — 포트폴리오 홈
- `/career` — 경력 및 타임라인
- `/work/snode`
- `/work/coffeeting`
- `/work/matching-admin`
- `/work/moum`
- `/work/butlerlee`
- `/work/touchpoint`
- `/api/visitors` — 익명 방문자 수 API
- `/api/chat` — ai-twin 프록시 (랜딩 Ask docky 채팅)
- `/dokyum-kim-portfolio.pdf` — 포트폴리오 PDF

## Verification

```bash
pnpm verify
```

## Privacy

이 저장소에는 이력서와 전화번호를 포함하지 않습니다.
