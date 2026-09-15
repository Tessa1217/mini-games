# components/ 규약

> 한 파일에 화면 전체를 몰아 쓰면 **어디를 고쳐야 하는지 찾는 비용**이 가장 먼저 오른다.
> 367줄짜리 `Game.tsx` 하나가 상태·입력·루프·HUD·레시피·화면 전환을 전부 들고 있었다.

## ⭐ 1. 한 파일 = 한 책임

판정은 한 문장으로 한다 — **"이 파일은 ____ 다"에 '그리고'가 들어가면 쪼갠다.**

| | 예 |
|---|---|
| O | `Hud.tsx` 는 **체력·레벨·점수·일시정지 버튼을 그린다** |
| X | `Game.tsx` 는 루프를 돌리**고** HUD를 그리**고** 화면을 전환한다 |

## ⭐ 2. 로직은 `hooks/` 로 내린다

컴포넌트에 남는 것은 **JSX와, props 를 JSX로 옮기는 정도의 계산**뿐이다.
`useState`·`useRef`·`useEffect`가 얽히기 시작하면 그 순간 훅으로 뺀다.

```
hooks/useGameSession.ts   한 판의 상태 — 레시피·점수·HP·레벨. 규칙은 game/ 에 위임한다
hooks/useGameLoop.ts      매 프레임 무엇을 하나 (RAF · 스폰 · 낙하 · 판정)
hooks/usePhase.ts         어느 화면인가 (loading → title → playing → …)
hooks/useViewportFit.ts   화면 맞춤
hooks/useAssetPreload.ts  스프라이트 선반입
hooks/useDebugBridge.ts   ?dbg 테스트 훅
```

훅 하나도 같은 규칙을 받는다 — **이름이 두 가지 일을 말하면 쪼갠다.**

## 3. 경계 — 무엇이 어디 사는가

| 층 | 들어가는 것 | 금지 |
|---|---|---|
| `game/` | 순수 규칙. 입력→출력이 결정적이라 Vitest 로 검증된다 | React · DOM |
| `hooks/` | React 와 게임을 잇는 배선. 상태 보관, effect 수명, 루프 | JSX |
| `components/` | 마크업과 스타일 | 규칙 계산 · 직접 RAF |

“이 계산이 게임 규칙인가 화면 배선인가”가 애매하면 **`game/` 에 둔다** — 그쪽만 테스트가 있다.

## 4. 폴더는 화면 영역으로 가른다

```
components/
  Game.tsx        조립만 한다. 여기서 로직이 늘면 훅으로 내린다
  stage/          낙하 무대 — 배경 · 레인 · 아이템 레이어 · 다람쥐
  hud/            상단 정보
  recipe/         하단 레시피 바
  controls/       조작 버튼
  screens/        오버레이 화면들. ScreenLayer 가 phase 분기를 **혼자** 진다
```

## ⭐ 5. 60fps 값은 컴포넌트에 올리지 않는다

낙하물 좌표·다람쥐 위치·타이머 눈금은 **ref + DOM 직접 조작**이다(`arch/stack.md`).
HUD처럼 초당 몇 번 바뀌는 값만 state 로 올린다.

**루프 `useEffect` 의 의존성 배열은 비운다.** 매 렌더 바뀌는 값은 ref 로 넘긴다 —
의존성에 콜백을 넣었다가 HUD 갱신마다 루프가 재생성돼 **아이템 풀이 통째로 비워진** 적이 있다
(`history/rev6-runtime.md`).

## 6. CSS 모듈은 컴포넌트 옆에 둔다

`Hud.tsx` ↔ `Hud.module.css`. 공용 껍데기(`screens/screen.module.css`)만 예외다.

⚠️ **모듈이 다르면 후손 선택자가 안 걸린다.** `.tutActs .bigBtn` 처럼 두 파일에 걸친
선택자는 해시가 달라 조용히 죽는다 — 쪽 컴포넌트에 수식 클래스를 따로 준다.

## 7. 새 컴포넌트 체크리스트

- [ ] 이 파일을 '그리고' 없이 한 문장으로 말할 수 있다
- [ ] `useEffect` 가 2개 이상이면 훅으로 뺄 것이 없는지 봤다
- [ ] 매 프레임 바뀌는 값을 state 에 두지 않았다
- [ ] CSS 모듈이 컴포넌트와 같은 폴더에 있다
- [ ] 접근성은 `art/a11y.md` 체크리스트를 돌렸다
