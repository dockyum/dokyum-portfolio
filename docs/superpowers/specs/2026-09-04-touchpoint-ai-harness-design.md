# Touchpoint AI 하네스 설계 (Touchpoint 페이지 서사 전환 + 시스템 구조 다이어그램)

**날짜:** 2026-09-04

**상태:** 설계 승인, 스펙 검토 대기

**대상 독자:** 채용 담당자, PO/PM 리더, 창업자. 한국어 우선.

**관련 스펙:** `2026-09-02-portfolio-v2-design.md` (전역 디자인 시스템, 상세 페이지 템플릿, 테스트 전략은 그대로 따른다)

## 1. 목적

포트폴리오의 Touchpoint 상세 페이지를 "제품 기능 소개"에서 **"AI 에이전트 하네스를 설계해 1인이 0→1 제품을 구축·운영한 사례"**로 바꾼다. 포트폴리오 전체 구조에서 Touchpoint가 맡아야 할 역할은 "AI를 잘 쓴다"는 사실이 구체적 시스템으로 드러나는 것이다.

핵심 산출물은 두 가지다.

1. Touchpoint 서사(랜딩 카드 문구, 히어로, 4챕터, 메트릭)를 AI 시스템 구축 중심으로 재작성한다.
2. Hermes와 Claude Code로 구성한 하네스(hooks, rules, skills, agents, 게이트, 운영 루프)를 **데이터 기반 인라인 SVG 다이어그램**으로 그려 상세 페이지 안에 "시스템 구조" 챕터로 넣고, 클릭하면 전체 화면으로 커지며 드래그로 이동·줌할 수 있게 한다.

## 2. 성공 기준

- `/work/touchpoint`의 h1과 첫 화면만 읽어도 "AI 하네스 위에서 1인이 제품을 구축·운영했다"가 전달된다.
- 랜딩 카드와 GNB 드롭다운의 Touchpoint 한 줄(`activeLine`)이 같은 메시지를 담는다.
- 다이어그램에 실제 hook, skill, agent 파일명이 그대로 적혀 있고, 모든 수치는 2026-09-03 기준 Touchpoint 저장소 실측치와 일치한다.
- 다이어그램은 인라인에서 전체가 보이고, 클릭(모바일은 탭)하면 전체 화면 뷰어가 열리며, 마우스와 터치 드래그로 이동하고 휠·핀치·버튼·키보드로 줌할 수 있다.
- 시장 트랙션(매출, 사용자 수, 예약 수)은 여전히 어떤 형태로도 주장하지 않는다. 기존 "시장 반응과 성장성은 아직 검증 전" 문장을 유지한다.
- 키보드, 스크린리더, `prefers-reduced-motion`, 320px 이상 모든 뷰포트에서 동작하고 가로 페이지 오버플로가 없다.
- `pnpm verify`(lint, unit, build, e2e)가 통과한다.

## 3. 범위

### 포함

- `src/content/projects.ts`의 Touchpoint 항목 재작성과 `Project` 타입 확장(`metricsNote`, `system`).
- 새 데이터 파일 `src/content/harness.ts`(다이어그램 데이터 + 검증 함수).
- 새 컴포넌트 `harness-diagram.tsx`(서버, SVG 렌더)와 `harness-viewer.tsx`(클라이언트, 확대 뷰어).
- `project-detail.tsx`에 조건부 "시스템 구조" 챕터와 메트릭 각주 렌더 추가.
- `globals.css`에 다이어그램·뷰어 스타일 추가. 색과 폰트는 기존 토큰만 사용.
- 단위 테스트, E2E 테스트 추가 및 기존 테스트 2건의 의도된 갱신.

### 제외

- 다이어그램의 PNG/SVG 다운로드나 별도 공유 라우트. 공유는 페이지 URL과 `#system` 앵커로 한다.
- 다른 다섯 프로젝트의 서사나 레이아웃 변경.
- 랜딩 페이지 구조, GNB, Career 페이지 레이아웃 변경. 단, Career의 독립 프로젝트 요약은 Touchpoint `summary`를 재사용하므로 문구가 함께 바뀐다. 이는 의도된 전파다.
- 새 의존성 추가. 다이어그램과 뷰어는 React와 브라우저 표준 API만 쓴다.
- Touchpoint 저장소 자체의 변경.

## 4. Touchpoint 서사 (확정 문구)

모든 문구는 `src/content/projects.ts`의 Touchpoint 항목에 그대로 들어간다. 구현 중 문구를 바꿔야 하면 이 스펙을 먼저 고친다.

### 4.1 필드

| 필드 | 값 |
| --- | --- |
| `category` | `0→1 PRODUCT · AI SYSTEM BUILD` |
| `activeLine` | `AI 에이전트 하네스로 1인이 0→1 제품을 구축·운영합니다` |
| `heroOutcome` | `혼자서 팀처럼 일하도록, 에이전트 하네스를 설계해 0→1 제품을 구축했습니다` |
| `role` | `Founding Product Builder · PO · AI 시스템 설계 · 개발` |
| `period` | `2026–NOW` (유지) |
| `team` | `사람 1 · Hermes(PM 리뷰 에이전트) · Claude Code(구현 에이전트)` |
| `summary` | `기획, 디자인, 개발, 운영을 1인이 감당하기 위해 Hermes와 Claude Code로 PM 리뷰, 구현, 검수, 배포, 에러 트리아지가 순환하는 에이전트 하네스를 만들고, 그 위에서 유료 미팅 링크 제품 Touchpoint를 0→1로 구축한 프로젝트입니다.` |
| `verifiedMetrics` | `hooks 16 · rules 12 · skills 20 · agents 8` / `7개월 1,009 커밋 · PR 827건 머지 · 릴리스 47회` / `테스트 파일 528개 · 마이그레이션 103건 · 위키 57페이지` |
| `metricsNote` | `2026.09.03 Touchpoint 저장소 실측. 시장 성과가 아니라 시스템 규모입니다.` |
| `media` | 유지 (포스터 히어로, 로고, alt, accent `#ff6b5f`) |

수치는 `src/content/harness.ts`의 `harnessCounts` 상수(6.2절)에서 온다. 근거(2026-09-03, `/Users/dockyum/Workspace/touchpoint` 기준): `.claude/hooks/*.sh` 16개, `.claude/rules/*.md` 12개, `.claude/skills/*/` 20개, `.claude/agents/*.md` 8개, `git rev-list --count HEAD` 1,009, squash 머지 제목의 `(#NNN)` 827건, `touchpoint-v*` 태그 47개, 첫 커밋 2026-02-24, 테스트 파일 528개, `supabase/migrations/*.sql` 103개, `docs/wiki/**/*.md` 57개.

### 4.2 챕터 본문

**overview** (히어로 요약)

1. Touchpoint는 창작자와 전문가가 제안, 요청, 일정, 결제를 하나의 프로필 링크에서 관리하는 유료 미팅 제품입니다. 기획, 디자인, 개발, 운영을 혼자 맡았고 결제, 인증, 다국어, DB처럼 실수 비용이 큰 영역이 처음부터 포함돼 있었습니다.
2. 그래서 이 프로젝트의 진짜 병목은 기능이 아니라 1인의 처리량과 품질 일관성이었습니다. AI 코딩 도구를 쓰는 것을 넘어, 사람 한 명과 에이전트들이 팀처럼 돌아가는 시스템을 만드는 일이 제품 구축의 절반이었습니다.

**problem** (01 문제와 맥락)

1. AI 에이전트를 그냥 쓰면 같은 실패가 반복됐습니다. 세션이 바뀌면 이전 결정과 맥락이 사라졌고, "고쳤다"는 보고가 재현과 검증 없이 올라왔으며, 계획 단계의 수락 기준이 완료 시점에는 유실됐습니다.
2. 병렬 세션이 같은 Linear 이슈를 중복으로 잡거나, 검수를 건너뛴 채 머지가 이뤄지거나, 결제와 DB 같은 보호 영역에 수정이 들어가는 일도 있었습니다. 규칙을 문서로 적어 두는 것만으로는 막히지 않았습니다.

**judgment** (02 핵심 판단)

1. 프롬프트를 더 잘 쓰는 문제가 아니라 시스템 설계 문제로 정의했습니다. 원칙은 세 가지였습니다. 검수 품질은 에이전트가 맡고 까먹음 차단은 훅이 맡는다. 규칙은 문서가 아니라 hook과 CI로 강제한다. 사람은 시각 품질과 제품 결정만 판단한다.
2. 역할도 나눴습니다. Hermes는 Linear를 상시 감시하며 PM과 도메인 관점의 리뷰를 맡고, Claude Code는 리뷰를 통과한 이슈만 worktree에서 구현합니다. 두 축은 Linear의 상태와 hermes 라벨로 분리해 서로의 판단을 덮어쓰지 않게 했습니다.

**system** (03 시스템 구조, 다이어그램 챕터 도입문)

1. Linear 이슈에서 시작해 Hermes 리뷰, Claude Code 구현, 사람 검수, 배포를 지나 프로덕션 에러가 다시 Linear로 돌아오는 순환 구조입니다. 각 단계에 실제 hook, skill, agent 이름을 그대로 적었습니다.

**execution** (04 실행과 운영 변화)

1. 세션 시작 시 위키 색인을 주입하고, Linear에서 claim되지 않은 이슈는 worktree 생성 자체를 막았습니다. 착수 시점에 Linear 수락 기준을 체크리스트로 내려받고, 편집마다 lint 자동 수정과 보호 영역 차단, 콘솔 로그와 DB 마이그레이션 경고가 붙습니다.
2. 완료 직전에는 review-inspector가 수락 기준을 코드와 대조하고, quality-evaluator가 만든 에이전트와 다른 컨텍스트에서 품질을 채점하며, 머지 시점의 pre-merge-gate가 체크리스트, DB 검수, 품질 평가, 위키 갱신 네 가지를 커밋 SHA와 결합해 하드 차단합니다. 시각 변경만 admin 검수함에서 사람이 승인하고, 나머지는 자동으로 Done 처리됩니다.
3. 운영도 루프에 넣었습니다. 프로덕션 에러는 매일 fingerprint로 묶여 보수적 임계를 넘을 때만 Linear 이슈로 자동 생성되고, Hermes 리뷰를 거쳐 다시 구현 파이프라인으로 들어옵니다. 반복되는 실패는 그때마다 규칙이 아니라 훅으로 승격했습니다. 중복 배정을 막는 claim 훅, 재검수 토큰 비용을 없앤 머지 시점 게이트 재구조화가 그 예입니다.

**outcome** (05 성과와 학습)

1. 이 시스템 위에서 7개월 동안 1,009개 커밋과 827건의 PR, 47회의 릴리스를 혼자 운영했고, 결제, 인증, 다국어, 채팅, 음성 통화, 어드민까지 제품 전 범위를 구축했습니다. 다만 시장 반응과 성장성은 아직 검증 전입니다.
2. 배운 것은 두 가지입니다. 강제 지점은 턴 종료가 아니라 머지 같은 비가역 경계에 둬야 비용이 새지 않는다는 것, 그리고 사람의 판단이 꼭 필요한 곳만 남기고 나머지를 시스템에 넘겨야 1인이 팀의 속도를 낼 수 있다는 것입니다. 결제 규제가 제품 범위와 시장 선택을 바꿀 수 있다는 점을 확인하고 글로벌 결제 구조로 전환한 학습도 이 순환 덕에 빠르게 다음 검증 순서로 이어졌습니다.

### 4.3 챕터 순서와 번호

Touchpoint만 5챕터다. 번호는 `01 문제와 맥락`, `02 핵심 판단`, `03 시스템 구조`, `04 실행과 운영 변화`, `05 성과와 학습`. 다른 프로젝트는 기존 4챕터와 번호를 유지한다. 시스템 챕터의 섹션 id는 `system`이며 `/work/touchpoint#system`으로 링크할 수 있다.

## 5. 다이어그램 내용

### 5.1 형식

- 인라인 SVG, `viewBox="0 0 1600 1000"`, `preserveAspectRatio="xMidYMid meet"`.
- 상단 56px는 레인 헤더 띠. 본문 영역은 y 56–800. 지식 계층 띠는 y 840–1000. 본문과 지식 띠 사이 여백(y 800–840)은 루프 화살표 통로다.
- 다섯 레인의 x 구간: INTAKE 0–270, HERMES 270–560, CLAUDE CODE 560–980, HUMAN 980–1240, SHIP & OPERATE 1240–1600. 레인 경계는 얇은 세로 규칙선(`--grid`)으로 표시한다.
- 텍스트 크기(viewBox 단위): 노드 제목 20px Pretendard 600, 파일명 라벨 12.5px Geist Mono, 설명 13px Pretendard `--muted`. 레인 헤더는 12px Geist Mono 대문자.
- 노드 안의 줄바꿈은 데이터에 배열로 미리 적는다. 런타임 텍스트 측정은 하지 않는다.

### 5.2 노드 종류와 표기

| kind | 모양 | 용도 |
| --- | --- | --- |
| `source` | 얇은 테두리 사각형 | 이슈 입력원 |
| `store` | 이중 테두리 사각형 | Linear, 프로덕션 같은 상태 저장소 |
| `stage` | 사각형 | 파이프라인 단계 |
| `agent` | 모서리 둥근 사각형(`rx=14`) | LLM 에이전트 |
| `gate` | 사각형 + 왼쪽 세로 마커(Touchpoint accent `#ff6b5f`, 6px) | 하드 차단 게이트 |
| `human` | 사각형 + 좌상단 사람 픽토그램(원 + 어깨 호) | 사람 판단 |
| `knowledge` | 지식 띠 안의 낮은 사각형 | 모든 세션이 읽는 공통 계층 |

엣지 종류: `flow`(실선 화살표, 기본 흐름), `branch`(점선 화살표, 조건 분기, 라벨 필수), `loop`(굵은 실선, 프로덕션 에러가 Linear로 돌아가는 단 하나의 엣지). 화살촉은 `<marker>`로 그리고 id는 `variant` 접두어를 붙인다.

### 5.3 노드 인벤토리

**INTAKE 레인**

| id | kind | 제목 | 라벨(mono) | 설명 |
| --- | --- | --- | --- | --- |
| `linear` | store | Linear · TOU 이슈 | `TOU-1 … TOU-264` | 단일 백로그. 상태 = 개발 수명주기 |
| `source-human` | source | 사람 요청 | `docky` | 제품 결정 · 기능 요청 |
| `source-triage` | source | 에러 자동 이슈 | `error-triage cron` | prod 에러 → 이슈 (루프 도착점) |
| `source-handoff` | source | 세션 핸드오프 | `후속 작업 이슈` | 다음 세션에 넘길 일 |

**HERMES 레인** (헤더 부제: `PM 리뷰 · 상시 에이전트 · 서버`)

| id | kind | 제목 | 라벨 | 설명 |
| --- | --- | --- | --- | --- |
| `hermes` | agent | Hermes | `Linear 상시 감시` | PM · 도메인 리뷰, 코멘트, 라벨 |
| `label-flow` | stage | 라벨 흐름 | `hermes:needs-review → reviewed → ready-for-dev` | 분기: `needs-ceo` · `blocked` |
| `gate-ready` | gate | 착수 게이트 | `hermes:ready-for-dev` | 아니면 구현 착수 불가 |

**CLAUDE CODE 레인** (헤더 부제: `구현 · 세션 = worktree`), 위에서 아래로

| id | kind | 제목 | 라벨 | 설명 |
| --- | --- | --- | --- | --- |
| `session-start` | stage | 세션 시작 | `session-start-wiki-query.sh` · `session-start-worktree-check.sh` | 위키 색인 주입 |
| `claim` | gate | Claim 게이트 | `pre-worktree-linear-claim.sh` | In Progress + `hermes:delegated` 아니면 worktree 차단 |
| `plan` | stage | 계획 | `/dev-checklist start` · `touchpoint-graph` | Linear AC down-sync (AC-001…) · graphify 코드 그래프 |
| `build` | stage | 구현 (TDD) | `protect-files` · `enforce-worktree` · `checklist-nudge` → `post-edit-lint-fix` · `console-warn` · `db-review` | 편집마다 훅 + ast-grep 규칙 9 |
| `review-agents` | agent | 검수 에이전트 | `review-inspector` · `quality-evaluator` · `database-reviewer` · `security-auditor` | AC 대조 · 4기준 채점 · 마이그레이션 · 보호 영역 |
| `merge-gate` | gate | 머지 게이트 | `pre-merge-gate.sh` | checklist PASSED · db-review PASS · quality-eval PASS · wiki ingest. head SHA 결합, 미충족 시 `gh pr merge` 거부 |
| `stop` | stage | 세션 종료 | `stop-validate.sh` · `stop-post-merge-cleanup.sh` | tsc · vitest · build (3회 재시도) · worktree 정리 |

**HUMAN 레인** (헤더 부제: `사람 검수`)

| id | kind | 제목 | 라벨 | 설명 |
| --- | --- | --- | --- | --- |
| `admin-eval` | human | admin 검수함 | `/admin/eval` · `admin-eval-review` | 시각 UI/UX와 제품 판단만 사람이 approved |
| `done` | store | Linear Done | `auto-Done` | 비시각 변경은 자동, 시각 변경은 approved 후 |

**SHIP & OPERATE 레인** (헤더 부제: `배포 · 운영`)

| id | kind | 제목 | 라벨 | 설명 |
| --- | --- | --- | --- | --- |
| `ci` | stage | GitHub Actions | `ci` · `bug-test-gate` · `smoke-test` · `release` · `wiki-lint` | fix PR 회귀 테스트 강제 · CalVer 릴리스 |
| `vercel` | stage | Vercel | `develop = staging` · `main = prod` | promote는 CEO만 |
| `prod` | store | 프로덕션 | `error_logs` · `cron 15` | touchpoint.bio |
| `triage` | stage | error-triage cron | `fingerprint` · `fatal 1회 / error 3회` · `최대 10건` | Linear 이슈 자동 생성 |

**지식 계층 띠** (제목: `KNOWLEDGE LAYER · 모든 세션이 읽는 공통 계층`)

| id | 제목 | 라벨 | 설명 |
| --- | --- | --- | --- |
| `k-constitution` | CLAUDE.md · AGENTS.md | `프로젝트 헌법` | 규칙 우선순위 · 보호 영역 |
| `k-rules` | rules 12 | `.claude/rules` | git · testing · security · wiki-protocol … |
| `k-skills` | skills 20 | `.claude/skills` | dev-checklist · linear-hermes-workflow · prd-interview … |
| `k-agents` | agents 8 | `.claude/agents` | planner · review-inspector · quality-evaluator … |
| `k-wiki` | wiki 57p | `docs/wiki` | Query(세션 시작) · Ingest(머지 게이트) · Lint(주 1회) |
| `k-graph` | graphify | `graphify-out` | 코드 지식 그래프, Glob/Grep 전에 주입 |
| `k-ast` | ast-grep 9 | `.ast-grep/rules` | 디자인 시스템 · RSC 경계 강제 |

각주(지식 띠 아래 오른쪽 정렬, 12px mono `--muted`): `동일 하네스를 .codex/ 에 미러해 Codex CLI도 같은 규칙으로 동작합니다.`

### 5.4 엣지 인벤토리

| from | to | kind | 라벨 |
| --- | --- | --- | --- |
| `source-human` | `linear` | flow | |
| `source-triage` | `linear` | flow | |
| `source-handoff` | `linear` | flow | |
| `linear` | `hermes` | flow | |
| `hermes` | `label-flow` | flow | |
| `label-flow` | `gate-ready` | flow | |
| `label-flow` | `source-human` | branch | `needs-ceo` |
| `gate-ready` | `claim` | flow | |
| `session-start` | `claim` | flow | |
| `claim` | `plan` | flow | |
| `plan` | `build` | flow | |
| `build` | `review-agents` | flow | |
| `review-agents` | `merge-gate` | flow | |
| `merge-gate` | `stop` | flow | |
| `merge-gate` | `admin-eval` | branch | `시각 UI/UX` |
| `merge-gate` | `done` | branch | `비시각 · auto-Done` |
| `admin-eval` | `done` | flow | `approved` |
| `admin-eval` | `build` | branch | `changes_requested` |
| `merge-gate` | `ci` | flow | |
| `ci` | `vercel` | flow | |
| `vercel` | `prod` | flow | |
| `prod` | `triage` | flow | |
| `triage` | `source-triage` | loop | `prod 에러 → Linear` |

`loop` 엣지는 `triage` 아래에서 y 820 통로로 내려가 왼쪽으로 달린 뒤 `source-triage` 아래로 올라온다. 지식 띠에서 나가는 엣지는 없다. 띠의 위치 자체가 "밑에서 받친다"는 의미다.

### 5.5 범례

다이어그램 우상단 헤더 띠 안에 네 항목: `하드 차단 게이트`(accent 마커), `에이전트`(둥근 사각형), `사람`(픽토그램), `조건 분기`(점선). 범례 텍스트는 12px mono.

### 5.6 스크린리더용 단계 목록

`HarnessDiagram.steps`에 순서대로 열두 문장을 둔다. 뷰어가 `<ol class="sr-only">`로 렌더한다.

1. 사람 요청, 에러 자동 이슈, 세션 핸드오프가 Linear 이슈로 모입니다.
2. Hermes가 Linear를 상시 감시하며 PM과 도메인 리뷰를 하고 hermes 라벨을 붙입니다.
3. ready-for-dev 라벨이 없는 이슈는 구현을 시작할 수 없습니다.
4. Claude Code 세션이 시작되면 위키 색인이 주입되고 worktree 상태를 확인합니다.
5. Linear에서 claim되지 않은 이슈는 worktree 생성이 차단됩니다.
6. 착수 시점에 Linear 수락 기준을 체크리스트로 내려받고 코드 그래프를 읽습니다.
7. 구현 중 편집마다 보호 영역 차단, lint 자동 수정, 콘솔 로그와 DB 마이그레이션 경고가 붙습니다.
8. review-inspector, quality-evaluator, database-reviewer, security-auditor가 검수합니다.
9. 머지 시점에 pre-merge-gate가 체크리스트, DB 검수, 품질 평가, 위키 갱신을 커밋 SHA와 결합해 하드 차단합니다.
10. 시각 UI/UX 변경만 admin 검수함에서 사람이 승인하고, 나머지는 자동으로 Done 처리됩니다.
11. GitHub Actions와 Vercel을 거쳐 배포되고, 프로덕션 에러는 error-triage cron이 매일 수집합니다.
12. 임계를 넘은 에러는 Linear 이슈로 자동 생성되어 다시 첫 단계로 돌아갑니다.

## 6. 애플리케이션 구조

### 6.1 파일

```
src/content/harness.ts                    타입, touchpointHarness 데이터, validateHarnessDiagram()
src/content/harness.test.ts               데이터 검증 테스트
src/content/projects.ts                   Project 타입 확장 + Touchpoint 항목 재작성
src/components/work/harness-diagram.tsx   서버 컴포넌트: HarnessDiagram → <svg>
src/components/work/harness-diagram.test.tsx
src/components/work/harness-viewer.tsx    클라이언트 컴포넌트: 힌트 버튼, <dialog>, 이동·줌
src/components/work/harness-viewer.test.tsx
src/components/work/project-detail.tsx    system 챕터 삽입, metricsNote 렌더
src/components/work/project-detail.test.tsx (갱신)
src/content/projects.test.ts              (갱신)
src/app/globals.css                       .work-system-*, .harness-* 스타일
e2e/portfolio.spec.ts                     Touchpoint 다이어그램 시나리오 추가
```

### 6.2 타입

```ts
export type HarnessNodeKind = "source" | "store" | "stage" | "agent" | "gate" | "human" | "knowledge";
export type HarnessEdgeKind = "flow" | "branch" | "loop";

export type HarnessLane = { id: string; title: string; subtitle: string; x: number; width: number };
export type HarnessNode = {
  id: string;
  lane: string;            // lane id 또는 "band"
  kind: HarnessNodeKind;
  title: string;
  label: readonly string[];  // mono 줄
  detail: readonly string[]; // 설명 줄
  x: number; y: number; width: number; height: number;
};
export type HarnessEdge = { from: string; to: string; kind: HarnessEdgeKind; label?: string; path?: string };
export type HarnessDiagram = {
  id: string;                       // "touchpoint-harness"
  title: string;                    // SVG <title>
  description: string;              // SVG <desc>
  viewBox: { width: number; height: number };
  lanes: readonly HarnessLane[];
  band: { title: string; y: number; height: number };
  nodes: readonly HarnessNode[];
  edges: readonly HarnessEdge[];
  legend: readonly { kind: "gate" | "agent" | "human" | "branch"; label: string }[];
  footnote: string;
  steps: readonly string[];
};

export function validateHarnessDiagram(diagram: HarnessDiagram): string[]; // 오류 메시지 배열, 비어 있으면 유효

export const harnessCounts = {
  hooks: 16, rules: 12, skills: 20, agents: 8, wikiPages: 57, astGrepRules: 9,
} as const;
```

`harnessCounts`는 수치의 단일 출처다. 지식 띠 노드 제목(`rules 12`, `skills 20` 등)과 `projects.ts`의 첫 번째·세 번째 메트릭 문자열은 이 상수로부터 템플릿 리터럴로 만든다. 숫자를 두 곳에 손으로 적지 않는다.

`Project`에 추가되는 필드:

```ts
metricsNote?: string;
system?: { title: string; intro: readonly string[]; diagram: HarnessDiagram };
```

`projects.ts`는 `harness.ts`를 import한다. 반대 방향 import는 금지한다.

### 6.3 컴포넌트 계약

**`HarnessDiagram({ diagram, variant })`** (서버)

- `variant: "inline" | "full"`. 모든 SVG 내부 id(`<title>`, `<desc>`, `<marker>`)에 `${diagram.id}-${variant}-` 접두어를 붙여 한 페이지에 두 번 렌더해도 충돌하지 않는다.
- 루트: `<svg role="img" aria-labelledby={titleId} aria-describedby={descId} viewBox=... class="harness-diagram harness-diagram-{variant}">`.
- 렌더 순서: 레인 배경과 헤더 → 지식 띠 → 엣지 → 노드 → 범례 → 각주. 엣지가 노드 아래에 깔리도록 노드를 나중에 그린다.
- 엣지 경로는 `path`가 있으면 그대로 쓴다. 없으면 두 노드의 중심 x가 같을 때(같은 레인의 위아래 노드) from 아래 변 중심에서 to 위 변 중심으로 수직 직선을, 그 외에는 from의 to 쪽 변 중심에서 출발해 두 변의 x 중간값에서 꺾이는 직교 경로(수평 → 수직 → 수평)를 만든다. 라벨은 경로 중간점 위에 `paper` 배경 사각형을 깔고 얹는다. 자동 경로가 다른 노드를 가로지르면 데이터에 `path`를 명시해 우회한다.
- 색은 CSS 클래스(`harness-node-{kind}`, `harness-edge-{kind}`)로 지정한다. 인라인 SVG이므로 `globals.css`의 토큰이 적용된다.

**`HarnessViewer({ title, inline, full, steps })`** (클라이언트, `"use client"`)

- `inline`과 `full`은 각각 `<HarnessDiagram variant="inline"/>`, `<HarnessDiagram variant="full"/>` 요소다. `ProjectDetail`이 만들어 넘긴다.
- 렌더 구조:

```
<figure class="work-system-figure">
  <button type="button" class="work-system-trigger" aria-haspopup="dialog" aria-expanded={open} aria-label="{title} 크게 보기">
    {inline}
    <span class="work-system-hint" aria-hidden="true">클릭해서 크게 보기</span>   ← (hover: none)에서는 CSS로 "탭해서 크게 보기"
  </button>
  <ol class="sr-only">{steps}</ol>
  <dialog class="work-system-dialog" aria-label="{title}">
    <div class="work-system-toolbar">
      <span class="work-system-dialog-title">{title}</span>
      <button aria-label="축소">−</button> <button aria-label="확대">+</button> <button>맞춤</button> <button aria-label="닫기">닫기</button>
    </div>
    <div class="work-system-stage" data-dragging={dragging}>
      <div class="work-system-canvas" style="transform: translate(x px, y px) scale(s)">{full}</div>
    </div>
    <p class="work-system-help">드래그로 이동 · 휠이나 두 손가락으로 확대 · Esc로 닫기</p>
  </dialog>
</figure>
```

- 힌트 문구는 CSS `content`가 아니라 두 개의 `<span>`을 두고 `@media (hover: none)`으로 하나만 보이게 한다. 테스트에서 텍스트를 확인할 수 있어야 한다.

### 6.4 `ProjectDetail` 변경

- `chapters` 상수를 함수 `buildChapters(project)`로 바꾼다. 반환은 `{ key, label }[]`이며 `project.system`이 있으면 `judgment` 뒤에 `{ key: "system", label: project.system.title }`을 넣는다.
- `system` 챕터 섹션은 id `system`을 갖고, 헤딩 그리드 아래에 `intro` 문단(`.work-story-body`)과 전체 폭(1/13 컬럼) `HarnessViewer`를 렌더한다.
- 메트릭 밴드는 `verifiedMetrics.length > 0`일 때 기존처럼 렌더하고, `metricsNote`가 있으면 목록 아래에 `<p class="work-metrics-note">`를 붙인다. 항목 라벨은 기존 `VERIFIED METRIC`을 그대로 쓴다. 저장소에서 센 수치이므로 검증된 값이 맞다.

## 7. 상호작용 상세

### 7.1 상태

뷰어의 클라이언트 상태는 `open: boolean`, `transform: { x: number; y: number; scale: number }`, `dragging: boolean` 세 가지다. 포인터 추적용 임시 값은 ref에 둔다.

### 7.2 열기와 닫기

- 트리거 클릭, Enter, Space → `dialog.showModal()`. `showModal`이 없으면 `dialog.setAttribute("open", "")`로 대체한다.
- 열릴 때 `document.body.style.overflow = "hidden"`(GNB 모바일 메뉴와 같은 방식), 닫힐 때 원복. 컴포넌트 언마운트 시에도 원복한다.
- 닫기: 닫기 버튼, Esc(네이티브 `cancel` 이벤트를 받아 상태 동기화), 툴바 밖 배경 클릭은 닫지 않는다(드래그와 충돌 방지).
- 닫힌 뒤 포커스는 트리거로 돌아온다(네이티브 dialog 동작, 대체 경로에서는 명시적으로 `focus()`).

### 7.3 초기 배율과 클램프

- 스테이지 크기 `(w, h)`, viewBox `(W, H)`일 때 `fit = min(w/W, h/H)`, `cover = max(w/W, h/H)`.
- 열릴 때와 "맞춤" 버튼: `scale = cover`, `x = 0`(INTAKE 레인이 왼쪽에 보이도록 왼쪽 정렬), `y = (h − H·scale) / 2`.
- 배율 범위: `0.5 × fit` 이상 `4 × fit` 이하.
- 이동 클램프: 다이어그램의 각 변이 스테이지 반대편 25% 지점을 넘어 밖으로 나가지 못한다. 즉 항상 다이어그램의 최소 25%가 보인다.
- 창 크기 변경(`resize`) 시 현재 배율을 유지하고 클램프만 다시 적용한다.

### 7.4 이동

- 스테이지에 `touch-action: none`. `pointerdown`에서 `setPointerCapture`, `pointermove`에서 델타만큼 `x, y` 갱신, `pointerup`/`pointercancel`에서 해제.
- 마우스 왼쪽 버튼만 드래그로 인식한다. 드래그 중 `data-dragging="true"`로 커서를 `grabbing`으로 바꾼다.
- 스테이지는 `tabIndex={0}`과 `aria-label="다이어그램 이동 영역"`을 가져 키보드로 도달할 수 있다. 다이얼로그가 열리면 초기 포커스는 닫기 버튼이 아니라 스테이지에 둔다.
- 키보드: 스테이지가 포커스를 가질 때 화살표 키로 40px 이동, `+`/`=`로 확대, `-`로 축소, `0`으로 맞춤.

### 7.5 줌

- 휠: `deltaY < 0`이면 1.1배 확대, 아니면 1/1.1 축소. 포인터 위치를 고정점으로 삼는다(줌 후 포인터 아래 지점이 그대로). 다이얼로그 안에서만 동작하므로 페이지 스크롤과 충돌하지 않는다. `preventDefault`한다.
- 핀치: 활성 포인터가 둘이면 두 점 거리의 비율로 배율을 바꾸고 중점을 고정점으로 삼는다.
- 버튼 `+`/`−`: 스테이지 중심을 고정점으로 1.25배씩.

### 7.6 감속 모션과 접근성

- `prefers-reduced-motion: reduce`이면 다이얼로그 열림 애니메이션과 transform 전환을 제거한다. 그 외에는 버튼 줌에만 `transform 0.2s var(--ease-out)`을 적용하고 드래그 중에는 전환을 끈다.
- 툴바 버튼은 44×44px 이상, 포커스 링은 전역 `--focus` 규칙을 따른다.
- 다이얼로그가 열리면 `aria-expanded="true"`. 트리거의 접근 가능한 이름은 `"{title} 크게 보기"`.
- 인라인 SVG의 `<title>`은 `"Touchpoint AI 하네스 시스템 구조"`, `<desc>`는 `description` 한 문장.

## 8. 스타일

- 새 클래스는 `.work-system-*`(챕터, 피겨, 트리거, 힌트, 다이얼로그, 툴바, 스테이지, 캔버스, 도움말)와 `.harness-*`(SVG 내부)로 한정한다.
- 인라인 피겨: 폭 100%, `aspect-ratio: 16 / 10`, `--paper-raised` 배경, `--rule` 1px 테두리, 모서리 최대 2px. 호버 시 힌트 칩이 `--ink` 배경 `--paper` 글자로 강조된다.
- 다이얼로그: 전체 뷰포트, `--paper` 배경, 툴바는 상단 고정 `--rule` 하단선. `::backdrop`은 `--ink` 80% 불투명.
- SVG 색: 노드 배경 `--paper-raised`, 테두리 `--ink` 1.5px, 제목 `--ink`, 라벨 `--signal-blue`, 설명 `--muted`, 레인 헤더 `--signal-blue`, 레인 배경은 홀수 레인만 `--paper-raised`로 아주 약한 교차 음영. `gate` 마커와 `loop` 엣지만 Touchpoint accent를 쓴다. 그 외 그라디언트, 그림자, 블러는 쓰지 않는다.
- 폰트는 SVG `font-family`에 토큰 변수를 그대로 쓴다(`var(--font-korean)`, `var(--font-mono)`).
- 페이지 body는 가로 오버플로가 없어야 하므로 피겨와 다이얼로그 모두 `max-width: 100%`, 스테이지는 `overflow: hidden`.

## 9. 실패 동작

- `validateHarnessDiagram`이 잡는 오류: 노드 id 중복, 존재하지 않는 lane, 엣지가 없는 노드 참조, 노드 사각형이 viewBox 밖이거나 자기 레인 x 구간 밖, `loop` 엣지가 정확히 하나가 아님, `branch` 엣지에 라벨 없음, `steps`가 12개가 아님, 지식 띠 노드 제목의 수치가 `harnessCounts`와 불일치. 테스트가 이 함수를 호출해 빈 배열을 요구한다.
- JS가 꺼져 있거나 hydration 전: 인라인 SVG는 서버 렌더로 보이고, 트리거 버튼은 동작하지 않는다. 다이얼로그는 `open` 속성이 없으므로 보이지 않는다.
- `showModal` 미지원: `open` 속성 대체. 포커스 복귀와 Esc 처리를 컴포넌트가 직접 한다.
- `matchMedia` 미지원(테스트 환경 포함): 감속 모션을 `false`로 간주한다.
- 데이터가 바뀌어 수치가 어긋나면 단위 테스트가 실패해 배포 전에 드러난다.

## 10. 테스트

### 10.1 단위·컴포넌트 (Vitest + Testing Library)

- `harness.test.ts`: `validateHarnessDiagram(touchpointHarness)`가 빈 배열. 레인 5개, `loop` 엣지 1개, `steps` 12개, 지식 노드 제목이 `harnessCounts`의 값(`rules 12`, `skills 20`, `agents 8`, `wiki 57p`, `ast-grep 9`)을 담음, 각주에 `.codex/` 포함.
- `harness-diagram.test.tsx`: `role="img"`와 접근 가능한 이름, `pre-merge-gate.sh`와 `Hermes` 텍스트, `variant`가 다르면 marker id가 다름, `gate` 노드 수가 3(`gate-ready`, `claim`, `merge-gate`).
- `harness-viewer.test.tsx`: jsdom에 `HTMLDialogElement.prototype.showModal/close`를 폴리필한 뒤 트리거 클릭 → `aria-expanded="true"`와 dialog `open`; 닫기 버튼과 Esc(`cancel` 이벤트) → 닫힘과 트리거 포커스 복귀; 포인터 다운·무브·업 → 캔버스 `transform`의 translate 변화; 휠 → scale 변화와 범위 클램프; "맞춤" → cover 배율 복원; `document.body.style.overflow`가 열림/닫힘에 따라 바뀜; 힌트 텍스트 두 종류가 DOM에 존재.
- `project-detail.test.tsx` 갱신: Touchpoint는 챕터 5개이고 세 번째 헤딩이 `시스템 구조`이며 섹션 id가 `system`; Butlerlee는 여전히 4개; Touchpoint 메트릭 밴드가 렌더되고 각주에 `2026.09.03`이 있음; `성장성은 아직 검증 전` 유지.
- `projects.test.ts` 갱신: "unverified traction" 테스트를 "Touchpoint 메트릭은 시스템 실측치만"으로 바꾼다. 첫 항목이 `hooks ${harnessCounts.hooks}`로 시작하고 세 번째 항목에 `위키 ${harnessCounts.wikiPages}페이지`가 있으며, 어떤 항목도 `매출`, `사용자`, `예약`, `방문` 을 포함하지 않고, `metricsNote`가 있고 `outcome`에 `검증 전`이 있다. `activeLine`에 `AI`가 포함된다.

### 10.2 E2E (Playwright)

`e2e/portfolio.spec.ts`에 시나리오 하나를 추가한다.

1. `/work/touchpoint`로 이동, 감속 모션 에뮬레이션.
2. `시스템 구조` 헤딩과 `role="img"` 다이어그램이 보인다.
3. `크게 보기` 트리거를 클릭하면 `dialog[open]`이 보이고 툴바 `닫기` 버튼이 포커스 가능하다.
4. 스테이지 중앙에서 마우스 다운 → 120px 오른쪽 이동 → 업 후 캔버스 `transform`의 translate x가 이전보다 커진다.
5. `Escape`로 닫히고 트리거가 포커스를 가진다.
6. 390×844 뷰포트에서 같은 페이지의 `document.documentElement.scrollWidth`가 `clientWidth`를 넘지 않는다.

### 10.3 시각 점검

1440, 1024, 390 폭에서 아래를 확인한다.

- 인라인 다이어그램이 챕터 폭을 가득 채우고 힌트 칩이 보인다.
- 확대 뷰 초기 상태에서 INTAKE 레인이 왼쪽에 보이고 노드 텍스트가 잘리지 않는다.
- accent 색이 게이트 마커와 루프 엣지에만 쓰였다.
- 메트릭 밴드 각주가 읽히고 랜딩 카드·GNB의 Touchpoint 한 줄이 바뀌었다.

## 11. 브랜치와 배포

- 작업 브랜치 `dockyum/touchpoint-architecture-추가`(linked worktree)는 main `800be4c`에 fast-forward돼 있다.
- 구현 커밋은 이 브랜치에서 하고, `.claude/rules/git-workflow.md`대로 main 체크아웃에서 `git merge --ff-only`로 올린다. main을 되감는 명령은 쓰지 않는다.
- main push는 Vercel 프로덕션 배포로 이어진다. 머지는 `pnpm verify` 통과와 사용자 확인 후에만 한다.

## 12. 명시적 가정

- Hermes는 서버에서 상시 실행되는 독립 에이전트이며 Linear를 통해서만 Claude Code와 협업한다(사용자 확인, 2026-09-04).
- 다이어그램 수치는 2026-09-03 Touchpoint 저장소 스냅샷이며, 이후 저장소가 바뀌어도 포트폴리오는 각주의 날짜로 시점을 고정한다. 갱신은 별도 작업이다.
- Touchpoint 저장소의 파일명과 규칙 이름은 공개해도 되는 정보로 본다. 환경 변수 값, 키, 고객 데이터, Supabase 프로젝트 id는 다이어그램과 문구 어디에도 넣지 않는다.
- 기존 히어로 이미지(포스터)는 유지한다. 다이어그램은 본문 챕터에 산다.
- 스펙과 코드의 한국어 문구는 이 문서를 정본으로 한다.
