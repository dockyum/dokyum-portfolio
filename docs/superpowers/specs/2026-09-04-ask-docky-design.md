# Ask docky — 랜딩 AI 트윈 채팅 설계

**작성:** 2026-09-04

**상태:** 승인된 방향(2026-09-04 브레인스토밍에서 구조·트리거·채팅 섹션·환경 섹션 승인), 구현 전

**연관 문서**

- 디자인 시스템: `docs/superpowers/specs/2026-09-02-portfolio-v2-design.md`
- 교차 저장소 계약(SSOT): ai-twin 저장소 `docs/superpowers/specs/2026-09-04-portfolio-proxy-contract.md`

## 0. 한 줄 요약

랜딩 우하단의 뫼비우스 띠를 누르면 프로젝트 카드 아래 채팅 섹션으로 내려가고, 방문자가 docky에 대해 묻는 첫 메시지와 함께 인터뷰 기록 형식의 AI 채팅으로 확장된다. 답은 ai-twin이 만들고, 세션당 8회 한도도 ai-twin이 강제한다. 포트폴리오는 브라우저 세션을 식별해 넘기고 남은 횟수를 보여 준다.

## 1. 문제와 가설

- 문제: 방문자는 만나기 전에 docky에 대한 의심이 남아 있고, 미팅은 비용이 커서 잡히지 않는다.
- 가설: 방문자가 궁금한 것을 AI에게 바로 물을 수 있으면 미팅 전환율이 오른다.
- 이 릴리스는 가설을 시험할 기능을 만든다. 전환 측정(채팅 사용 → 이메일 클릭)은 범위 밖이며 다음 릴리스에서 이벤트 로그로 다룬다.
- 1차 행동은 여전히 이메일이다. 한도 도달 상태가 이메일 CTA로 이어진다.

## 2. 범위

포함:

- 랜딩 우하단 트리거(뫼비우스 띠)
- 카드 아래 채팅 섹션: 컴팩트 입력 → 확장 트랜스크립트
- 포트폴리오 프록시 `POST /api/chat`: 세션 쿠키 발급, ai-twin 전달, 스트림 반환
- 남은 횟수 표시, 한도 도달·오류 상태
- sessionStorage 복원
- 단위·E2E 테스트, `.env.example`·README 갱신
- ai-twin 저장소에 계약 문서 PR

제외:

- 8회 한도 강제(ai-twin 담당)
- 추천 질문 칩, 전환 이벤트 측정
- 랜딩 외 페이지의 트리거
- 소유자 모드, 포트폴리오 측 대화 저장(DB 없음)
- 트윈 답의 마크다운 렌더링(평문만)

## 3. 사용자 흐름

1. 랜딩에서 우하단 도형을 본다. 도형은 느리게 회전한다.
2. 도형을 누르면 `#ask-docky`로 부드럽게 스크롤하고 입력창에 포커스가 간다.
3. "docky에 대해 물어보세요." 입력창에 질문을 치고 Enter를 누르면 섹션이 트랜스크립트로 확장되고 답이 스트리밍된다.
4. 카운터가 `1 / 8`로 바뀐다. 이어서 묻는다.
5. 8회를 다 쓰면 입력이 닫히고 이메일 CTA가 나온다.

## 4. 배치

- 랜딩(`/`) 전용. `main.landing-page` 안에서 `.landing-hero` 다음에 `section.ask-docky#ask-docky`가 온다.
- 트리거 버튼도 `main` 안에 둔다. 모바일 메뉴가 열리면 기존 `body:has(.site-mobile-menu:not([hidden])) main { visibility: hidden }` 규칙으로 함께 숨는다.
- 히어로가 `min-height: 100svh`이므로 섹션은 첫 화면 아래에 있다. 도형 없이 스크롤로도 도달한다.
- `TWIN_API_URL`이 비어 있으면 `page.tsx`(서버 컴포넌트)가 트리거와 섹션을 렌더하지 않는다. ai-twin이 연결되기 전의 프로덕션 랜딩은 지금과 같다.

## 5. 컴포넌트와 파일

| 파일 | 역할 |
| --- | --- |
| `src/app/api/chat/route.ts` | 프록시 라우트. 세션 쿠키, 본문 검사, 업스트림 전달, 스트림 반환, 오류 계약 |
| `src/chat/session.ts` | `resolveChatSession(cookieValue)` → `{ id, setCookie }`. 쿠키 이름·속성 상수 |
| `src/chat/proxy.ts` | `forwardChat(...)` 순수 함수. 업스트림 요청 조립·전달·응답 헤더 선별. `fetch`를 주입받아 테스트한다 |
| `src/chat/quota.ts` | 카운터 규칙. 헤더 파싱, 로컬 폴백, `exhausted` 판정. 클라이언트와 테스트가 함께 쓰는 순수 함수 |
| `src/components/landing/ask-docky.tsx` | 채팅 섹션(클라이언트). `useChat` + 커스텀 `fetch`로 헤더 읽기 + sessionStorage 복원 |
| `src/components/landing/ask-docky-trigger.tsx` | 트리거 버튼(클라이언트). 스크롤·포커스·IntersectionObserver 숨김 |
| `src/components/landing/mobius-mark.tsx` | 뫼비우스 띠 SVG. 프레젠테이션 전용 |
| `src/app/page.tsx` | `TWIN_API_URL`이 있을 때 두 컴포넌트 삽입 |
| `src/app/globals.css` | `.ask-docky*` 스타일, 모션, 모바일 |
| `.env.example`, `README.md` | `TWIN_API_URL`, `TWIN_PROXY_SECRET` 문서화 |
| `e2e/ask-docky.spec.ts` | 채팅 흐름 E2E |

의존성 추가: `ai`(v7), `@ai-sdk/react`(v4). ai-twin과 메이저를 맞춰 UI message 스트림 프로토콜을 동일하게 유지한다.

## 6. 프록시 API 계약 — `POST /api/chat`

### 요청

- 본문: `{ "messages": UIMessage[] }` (Vercel AI SDK v6 UI message 형식). 스키마 검증은 ai-twin이 한다. 프록시는 JSON 파싱 실패 → 400, 본문 64KB 초과 → 413만 거른다.
- 헤더: `content-type: application/json`. `x-twin-conversation`은 클라이언트가 만든 대화 UUID v4(선택). 값이 `^[A-Za-z0-9-]{1,64}$`에 맞지 않으면 전달하지 않는다.
- 쿠키: `dk_chat_session_v1`. 값은 UUID v4. 없거나 형식이 틀리면 새로 발급해 응답에 `Set-Cookie`를 붙인다. 속성: `httpOnly`, `sameSite=lax`, `secure`(프로덕션), `path=/`, 만료 없음(브라우저 세션 쿠키). 첫 채팅 요청에서만 생기므로 채팅하지 않은 방문자에게는 쿠키가 없다.

### 처리

1. `TWIN_API_URL` 미설정 → 503 `{ "error": "트윈이 아직 연결되지 않았어요." }`
2. 업스트림 `fetch(TWIN_API_URL + "/api/chat", { method: "POST" })`. 헤더: `content-type: application/json`, `x-twin-session: <세션 id>`, `x-twin-conversation`(유효할 때), `authorization: Bearer <TWIN_PROXY_SECRET>`(설정 시). `signal`은 들어온 요청의 `signal`을 그대로 넘겨 방문자가 이탈하면 트윈 생성도 멈춘다.
3. 업스트림 연결 실패(throw) → 502 `{ "error": "지금은 대화할 수 없어요. 잠시 후 다시 시도해 주세요." }`. 클라이언트 중단(AbortError)이면 499 빈 응답.

### 응답

- 업스트림 상태 코드와 본문 스트림을 변환 없이 그대로 돌려준다.
- 전달하는 업스트림 헤더: `content-type`, `x-vercel-ai-ui-message-stream`, `x-twin-quota-limit`, `x-twin-quota-remaining`. 그 외는 버린다. `cache-control: no-store`를 추가한다.
- 새 세션이면 `Set-Cookie`를 붙인다. 429 같은 오류 응답에도 붙인다.
- `export const dynamic = "force-dynamic"`, `export const maxDuration = 60`.

## 7. ai-twin 측 계약(요약)

SSOT는 ai-twin 저장소의 `docs/superpowers/specs/2026-09-04-portfolio-proxy-contract.md`다. 포트폴리오가 기대하는 것:

- ai-twin이 세션당 8회 한도를 강제한다. 세션 = `x-twin-session` 값.
- 응답 헤더 `x-twin-quota-limit`, `x-twin-quota-remaining`(이번 요청을 센 뒤 남은 수). 200과 429 모두에 붙는다.
- 한도 초과 → 429 `{ "error": "<사용자 문구>" }`. 포트폴리오는 문구를 그대로 보여 준다.
- 선택: 양쪽에 `TWIN_PROXY_SECRET`이 있으면 `authorization: Bearer`로 프록시 호출을 식별한다.
- 헤더가 아직 없어도 포트폴리오는 동작한다(§10 로컬 카운트 폴백).

## 8. 트리거

### 마크업

```html
<button type="button" class="ask-docky-trigger" aria-label="docky에게 물어보기" aria-controls="ask-docky">
  <svg class="ask-docky-trigger-mark" aria-hidden="true">…뫼비우스 띠…</svg>
  <span class="ask-docky-trigger-label" aria-hidden="true">ASK DOCKY</span>
</button>
```

### 형태

- 56×56 타일. 프로젝트 카드와 같은 언어: 1px `ink` 테두리, 2px 라운드, `paper-raised` 배경. 격자 배경 위에서 선 그림이 묻히지 않게 한다.
- 타일 안에 잉크색 1px 선으로 그린 뫼비우스 띠 SVG(`vector-effect: non-scaling-stroke`). 두 갈래 띠가 한 번 꼬이며, 교차 지점에서 뒤로 지나는 띠는 끊어 그려 앞뒤를 보여 준다.
- 위치: `position: fixed; right: clamp(1rem, 3vw, 3rem); bottom: calc(1.25rem + env(safe-area-inset-bottom)); z-index: 90` (헤더 100, 모바일 메뉴 99보다 아래).

### 모션

- 띠 그룹이 24초 주기로 한 바퀴 회전한다(`rotate`, linear, infinite).
- 띠를 따라 signal-blue 짧은 dash가 6초 주기로 흐른다(`stroke-dashoffset`, linear, infinite).
- hover·focus-visible: 타일이 2px 떠오르고(`translateY(-2px)`), 왼쪽에 모노 라벨 `ASK DOCKY`가 나타난다(opacity·translateX, 0.3s). 모바일(≤767px)에서는 라벨을 숨긴다.
- reduced-motion: 기존 전역 규칙(`animation: none !important`, `transition: none !important`)으로 정지한다.

### 동작

- 클릭·Enter: `#ask-docky`를 `scrollIntoView({ behavior, block: "start" })`. `behavior`는 `prefers-reduced-motion: reduce`이면 `auto`, 아니면 `smooth`. 곧바로 입력창에 `focus({ preventScroll: true })`.
- `#ask-docky`가 뷰포트에 20% 이상 들어오면 `data-hidden="true"`로 사라진다(`opacity: 0; pointer-events: none`, 0.3s). 벗어나면 다시 보인다. `IntersectionObserver`가 없으면 항상 보인다.

### 디자인 시스템 예외

v2 스펙 §7 "시퀀스 이후 ambient 애니메이션 없음"과 §14 "지속 애니메이션 도입 금지"에 대한 명시적 예외를 둔다. 조건: 56px 벡터 요소 하나, `transform`·`stroke-dashoffset`만 사용(레이아웃·페인트 비용 없음), reduced-motion에서 정지, 채팅 섹션이 보이면 숨김. 그 외 요소의 ambient 애니메이션 금지는 유지한다.

## 9. 채팅 섹션

### 상태

- `idle`(컴팩트): 메시지 0개. 헤더 행 + 입력 + 캡션만.
- `active`(확장): 메시지 1개 이상. 입력 위에 트랜스크립트.
- 겹치는 상태: `pending`(전송 후 첫 토큰 전), `streaming`, `error`, `exhausted`.

### 마크업 골격

```html
<section class="ask-docky" id="ask-docky" data-state="idle|active" aria-labelledby="ask-docky-title">
  <div class="ask-docky-head">
    <h2 class="ask-docky-title" id="ask-docky-title">ASK DOCKY <span class="ask-docky-kind">· AI TWIN</span></h2>
    <p class="ask-docky-count"><span class="sr-only">질문 8개 중 0개 사용</span><span aria-hidden="true">0 / 8</span></p>
  </div>
  <div class="ask-docky-transcript-wrap">
    <ol class="ask-docky-transcript" aria-label="대화 기록">
      <li class="ask-docky-turn" data-role="user"><span class="ask-docky-turn-label">YOU</span><div class="ask-docky-turn-body">…</div></li>
      <li class="ask-docky-turn" data-role="assistant"><span class="ask-docky-turn-label">DOCKY·AI</span><div class="ask-docky-turn-body">…<span class="ask-docky-caret" /></div></li>
      <li class="ask-docky-turn" data-role="system"><span class="ask-docky-turn-label">SYSTEM</span><div class="ask-docky-turn-body">오류 문구</div></li>
    </ol>
  </div>
  <form class="ask-docky-form">
    <input class="ask-docky-input" aria-label="docky에게 질문" placeholder="docky에 대해 물어보세요." maxlength="2000" />
    <button class="ask-docky-send" type="submit" aria-label="질문 보내기">→</button>
  </form>
  <p class="ask-docky-caption">docky의 기록을 학습한 AI 트윈이 답합니다. 확답과 약속은 본인에게 직접 물어봐 주세요.</p>
  <p class="ask-docky-limit">이 세션의 질문을 모두 썼어요. 더 궁금한 건 이메일로 물어봐 주세요. <a href="mailto:snfltptkd91@gmail.com">이메일로 연락하기 ↗</a></p>
  <p class="ask-docky-status sr-only" aria-live="polite">docky가 답하는 중</p>
</section>
```

### 데스크톱 레이아웃

컴팩트:

```text
──────────────────────────────────────────────────────────────
ASK DOCKY · AI TWIN                                      0 / 8

docky에 대해 물어보세요.                                     →
──────────────────────────────────────────────────────────────
docky의 기록을 학습한 AI 트윈이 답합니다. 확답과 약속은 본인에게 직접 물어봐 주세요.
```

확장:

```text
ASK DOCKY · AI TWIN                                      1 / 8
──────────────────────────────────────────────────────────────
YOU         커피팅에서 CPO로 무엇을 했나요?
──────────────────────────────────────────────────────────────
DOCKY·AI    커피팅에서는 … ▌
──────────────────────────────────────────────────────────────
이어서 물어보세요.                                           →
──────────────────────────────────────────────────────────────
```

- 섹션: 위 1px `rule`, 패딩 `clamp(2.5rem, 5vw, 5rem) clamp(1rem, 3vw, 3rem)`. runway meta와 같은 좌우 여백.
- 헤더 행: `h2`는 모노 0.68rem, signal-blue, 대문자. `· AI TWIN`은 muted. 카운터는 모노 0.72rem, 오른쪽 정렬.
- 입력: 박스 없이 아래 1px `ink` 룰만. Pretendard, `clamp(1.25rem, 2.2vw, 2rem)`, weight 600, `letter-spacing: -0.03em`, `min-height: 44px`, 최대 2,000자. `focus-visible`에서 아래 룰이 2px `focus` 파랑이 된다. 전송 버튼은 모노 `→`, 44×44, hover 시 signal-blue. 전송 중(`pending`·`streaming`)에는 제출을 막고 버튼을 `aria-disabled`로 흐리게 한다. 입력 자체는 계속 받는다.
- 캡션: muted 0.82rem, `word-break: keep-all`.
- 트랜스크립트: `.ask-docky-transcript-wrap`은 `display: grid; grid-template-rows: 0fr`에서 `1fr`로 0.6s `--ease-out` 전환(`overflow: hidden`). 첫 메시지에서 열리고, sessionStorage 복원 시에는 전환 없이 `1fr`로 시작한다. `.ask-docky-transcript`는 `max-height: min(60svh, 42rem); overflow-y: auto`. 메시지가 바뀔 때마다 마지막 턴으로 스크롤한다(reduced-motion이면 `auto`).
- 턴: `grid-template-columns: 7rem minmax(0, 1fr)`, 위아래 패딩 1.1rem, 턴 사이 1px `rule`. 라벨은 모노 0.68rem. `YOU`는 muted, `DOCKY·AI`는 signal-blue, `SYSTEM`은 muted. 본문은 Pretendard 1rem/1.7, `white-space: pre-wrap`, `word-break: keep-all`.
- `pending`: assistant 턴 본문이 `…`(muted). `streaming`: 본문 끝에 1px×1em signal-blue 캐럿이 1s 주기로 깜빡인다(reduced-motion에서는 정지, 표시 유지).
- `exhausted`: 입력·전송 버튼 `disabled`, 플레이스홀더는 비운다. `.ask-docky-limit`가 캡션 자리에 보이고 캡션은 숨는다. 이메일 링크는 헤더의 `site-email-link`와 같은 mailto다.
- `error`: `SYSTEM` 턴으로 오류 문구를 추가한다. 입력은 열어 두어 다시 보낼 수 있다.
- 플레이스홀더: `idle`은 "docky에 대해 물어보세요.", `active`는 "이어서 물어보세요.".

### 모바일(≤767px)

- 섹션 패딩 `3rem 1rem`.
- 턴은 1열. 라벨이 본문 위에 오고 사이 간격 0.35rem.
- 입력 글자 크기 1.25rem(iOS 자동 확대 방지, 16px 이상).
- 트리거는 56px 유지, 라벨 없음.

## 10. 카운터와 상태 유지

### 카운터 규칙(`src/chat/quota.ts`)

- `limit`: 응답 헤더 `x-twin-quota-limit`가 양의 정수면 그 값, 아니면 8.
- `used`: 헤더 `x-twin-quota-remaining`이 있으면 `limit - remaining`(0 미만은 0). 없으면 이 탭 세션에서 보낸 사용자 메시지 수(실패한 전송도 센다. ai-twin이 요청 시점에 세는 것과 맞춘 보수적 계산).
- `exhausted`: `used >= limit` 또는 마지막 응답이 429.
- 표시: `{used} / {limit}`. sr-only 문구는 "질문 {limit}개 중 {used}개 사용".

### 헤더 읽기

`DefaultChatTransport`에 커스텀 `fetch`를 넣어 응답을 가로챈다. 상태 코드와 헤더를 읽어 카운터 상태를 갱신한 뒤 `Response`를 그대로 돌려준다. 429는 `exhausted`로 표시하고 서버 문구를 `SYSTEM` 턴으로 보여 준다.

### sessionStorage

- 키 `dk_ask_docky_v1`, 값 `{ "v": 1, "conversationId": string, "messages": UIMessage[], "used": number, "limit": number, "exhausted": boolean }`.
- 응답이 끝나거나 실패할 때마다 저장한다. 마운트 시 읽어 메시지가 있으면 확장 상태로 시작한다. 파싱 실패나 버전 불일치는 무시하고 지운다.
- 대화 id는 첫 전송 때 `crypto.randomUUID()`로 만들고 저장한다. `useChat`의 `id`로도 쓴다.
- 서버 세션(쿠키)은 브라우저 세션, sessionStorage는 탭 단위다. 새 탭은 `0 / 8`로 시작하지만 첫 응답 헤더로 즉시 맞춰진다.

## 11. 접근성과 모션

- `section`은 `aria-labelledby`로 `h2`를 가리킨다. 트랜스크립트 `ol`은 `aria-label="대화 기록"`만 갖고 live region이 아니다(스트리밍 델타가 매번 읽히는 것을 막는다).
- sr-only 상태줄(`aria-live="polite"`): `pending`·`streaming`에 "docky가 답하는 중", 끝나면 "답변 완료", 오류면 오류 문구.
- 카운터는 sr-only 문구와 시각 문구를 나눈다.
- 모든 컨트롤은 키보드로 닿고 포커스가 보인다. 터치 타깃 44px 이상.
- reduced-motion: 전역 규칙이 애니메이션·전환을 끈다. JS는 `matchMedia("(prefers-reduced-motion: reduce)")`로 스크롤 `behavior`를 고른다.

## 12. 보안과 개인정보

- 포트폴리오는 대화를 서버에 저장하지 않는다. 브라우저 sessionStorage에만 둔다. 서버 로그에 메시지 본문을 남기지 않는다.
- 세션 쿠키 값은 무작위 UUID다. IP·User-Agent를 ai-twin에 전달하지 않는다.
- 트윈 URL과 시크릿은 서버 env에만 있다. 클라이언트 번들에 들어가지 않는다.
- 본문 64KB 상한. 메시지 길이(2,000자)와 스키마는 ai-twin이 검증한다.
- 방문자 텍스트 보관·30일 익명화는 ai-twin 정책을 따른다.
- 트윈 답은 텍스트 노드로만 렌더한다. HTML·마크다운을 해석하지 않는다.

## 13. 환경과 배포

- `TWIN_API_URL`: ai-twin 호스트(예: `https://<twin-host>`), 끝 슬래시 없이. 비어 있으면 기능이 렌더되지 않는다.
- `TWIN_PROXY_SECRET`: 선택. 설정하면 `authorization: Bearer`로 전달한다.
- Vercel: ai-twin 배포 후 Production·Preview에 `TWIN_API_URL`을 넣는다. iframe을 쓰지 않으므로 ai-twin의 `TWIN_ALLOWED_ORIGINS`는 이 경로와 무관하다.
- 로컬: main 체크아웃의 `.env.local`(Redis 값)을 복사하고 `TWIN_API_URL=http://localhost:3001`을 추가한다. ai-twin은 `PORT=3001 npm run dev`로 띄운다(`ANTHROPIC_API_KEY` 필요).
- Playwright `webServer.env`에 `TWIN_API_URL=http://127.0.0.1:9`를 넣어 섹션이 렌더되게 한다. 브라우저 흐름은 `page.route`로 `/api/chat`을 mock하고, 프록시 자체는 닿지 않는 업스트림으로 502 계약을 검증한다.

## 14. 테스트 전략

### 단위(Vitest)

- `src/chat/session.test.ts`: 쿠키 없음 → 새 UUID·`setCookie: true`. 유효한 쿠키 → 같은 id·`setCookie: false`. 형식이 틀린 값 → 새 id.
- `src/chat/proxy.test.ts`: 업스트림 URL·헤더(세션, 대화, 선택 bearer) 조립. 유효하지 않은 대화 id 생략. `signal` 전달. 허용 헤더만 통과하고 `cache-control: no-store` 추가. 상태 코드 전파. 네트워크 throw → 502 계약. AbortError → 499.
- `src/chat/quota.test.ts`: 헤더 파싱, 폴백 계산, `exhausted` 판정.
- `src/app/api/chat/route.test.ts`: env 없음 → 503. JSON 아님 → 400. 64KB 초과 → 413. 첫 호출에 `Set-Cookie`. 쿠키 id를 `x-twin-session`으로 전달.
- `src/components/landing/ask-docky.test.tsx`: 컴팩트 렌더(제목·플레이스홀더·`0 / 8`·캡션). 전송 → 확장, `YOU` 턴, `…` → 스트리밍 본문. 헤더 기반 카운터. 429 → `exhausted`, CTA, 입력 비활성. 오류 → `SYSTEM` 턴. sessionStorage 복원 → 확장 시작·카운터. 전송 중 재제출 차단.
- `src/components/landing/ask-docky-trigger.test.tsx`: 라벨 있는 버튼 렌더. 클릭 → `#ask-docky`에 `scrollIntoView`, 입력 포커스. IntersectionObserver mock으로 `data-hidden` 토글.

### E2E(Playwright, `e2e/ask-docky.spec.ts`)

- 랜딩에 트리거가 보이고 `/career`에는 없다.
- 트리거 클릭 → 섹션이 뷰포트 안, 입력 포커스, 트리거 숨김.
- mock 스트림으로 전송 → 확장, 답 본문 표시, `1 / 8`.
- mock 429 + 한도 헤더 → `8 / 8`, 한도 문구, 이메일 링크 href, 입력 비활성.
- reduced-motion에서 트리거 `animation-duration`이 `0s`.
- 320px에서 섹션을 확장해도 가로 오버플로 없음.
- `request.post("/api/chat")`: 닿지 않는 업스트림 → 502, 오류 JSON, `set-cookie`에 `dk_chat_session_v1`.

### 시각 점검

데스크톱·모바일 스크린샷으로 확인한다: 격자 위 트리거 가독성, 섹션 리듬이 runway meta와 맞는지, 트랜스크립트 타입 역할, 한도 상태의 CTA 위계.

## 15. 수용 기준

1. 랜딩 우하단 트리거가 보이고, 누르면 채팅 섹션이 뷰포트에 들어오며 입력창에 포커스가 간다.
2. 첫 전송으로 섹션이 확장되고 답이 스트리밍된다(로컬에서 ai-twin 연결 시 실제 답, 테스트에서는 mock).
3. 카운터가 헤더 또는 로컬 카운트로 갱신되고, 429 또는 remaining 0에서 입력이 닫히고 이메일 CTA가 보인다.
4. 프록시가 세션 쿠키를 발급하고 `x-twin-session`·`x-twin-conversation`을 전달한다(단위 테스트).
5. `TWIN_API_URL`이 없는 프로덕션 랜딩은 지금과 동일하다.
6. `pnpm verify`(lint, unit, build, e2e)가 통과한다.
7. reduced-motion에서 트리거·캐럿·확장 애니메이션이 없다. 320px·390px에서 가로 오버플로가 없다.
8. ai-twin 저장소에 계약 문서 PR이 열려 있다.

## 16. 가정과 미결

- ai-twin 배포 URL은 미정이다. 배포 후 Vercel env에 넣는다.
- ai-twin의 한도 저장소와 헤더 구현은 ai-twin 세션에서 한다. 그 전까지 포트폴리오는 로컬 카운트로 표시한다.
- 세션 쿠키는 브라우저 종료로 끝난다. 브라우저의 탭 복원 설정에 따라 세션 쿠키가 살아남을 수 있다(브라우저 정책).
- 트윈 답은 평문이다. 마크다운 렌더링은 필요해지면 추가한다.
