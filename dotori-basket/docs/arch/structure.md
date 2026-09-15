# 디렉터리 구조

```
dotori-basket/
├── CLAUDE.md                 불변식 · 라우팅 · 작업 절차
├── tsconfig.json             include: game/**/*.ts
├── docs/                     README.md 가 지도
│   ├── rules/ arch/ art/ history/ plan/
├── game/                     ★ React 무관 순수 로직
│   ├── CLAUDE.md             game/ 작업 시 읽을 범위를 좁힌다
│   ├── types.ts              계약만 (단위·범위·필수)
│   ├── tuning.ts             레벨 파생 함수 — BALANCE.levels 의 유일한 정당 소비자
│   └── config/               값만
│       ├── index.ts          BALANCE 9키 조립
│       ├── lane · movement · hp · scoring · recipe · spawner · levelUp · levels · endless
│       └── items.ts          ⚠️ BalanceConfig 멤버가 아니다 — 별도 export
├── app/                      layout.tsx · page.tsx
├── components/               ★ 마크업과 스타일만 — arch/components.md
│   ├── CLAUDE.md             읽을 범위를 좁힌다
│   ├── Game.tsx              조립만 한다
│   ├── stage/                무대 (geometry.ts · fallingNode.ts 는 DOM 직접 조작 헬퍼)
│   ├── hud/ recipe/ controls/
│   └── screens/              오버레이 6종 + ScreenLayer 가 phase 분기를 혼자 진다
├── hooks/                    ★ React 와 게임을 잇는 배선. JSX 를 두지 않는다
│   ├── useGameSession.ts     한 판의 상태
│   ├── useGameLoop.ts        매 프레임 무엇을 하나 (+ 루프가 만지는 ref 소유)
│   └── usePhase · useViewportFit · useAssetPreload · useDebugBridge
├── input/ platform/ storage/
├── public/assets/            ★ 배포되는 것만 여기
│   ├── items/                아이템 스프라이트 17종 — 보유 현황이 한눈에 (계보는 확장자가 말한다)
│   └── scene/                다람쥐 · 배경
├── assets/generated/         SpriteCook 원본 5.2MB — public/ 밖. 실측 기준용이라 배포하지 않는다
├── prototype/                동결된 참조 구현 (index.html · README.md)
└── archive/prompts/          보존용 기록 — 에셋 생성 금지 확정 전 문서
```

## 층이 셋인 이유

`game/` 순수 규칙 → `hooks/` 배선 → `components/` 마크업. 경계는 `arch/components.md`.

`game/`이 React를 import하지 않는 것이 핵심이다. 규칙 로직을 프레임워크와 분리하면
단위 테스트가 쉽고, 렌더를 Canvas로 바꾸거나 다른 환경에 이식할 때 그대로 쓸 수 있다.
