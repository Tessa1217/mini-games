# components/ · hooks/ — 화면

## 여기서 읽을 문서

`docs/arch/components.md` **가 먼저다.** 파일을 새로 만들기 전에 읽는다.
그다음 화면 사양은 `docs/art/layout.md` · `docs/art/screen-specs.md` · `docs/art/a11y.md`,
전환 규칙은 `docs/rules/state-machine.md`.

게임 규칙 자체를 고치는 것이라면 여기가 아니라 `game/` 이다.

## 세 줄 요약

1. **한 파일 = 한 책임.** "이 파일은 ___ 다"에 '그리고'가 들어가면 쪼갠다
2. **로직은 `hooks/` 로.** 컴포넌트에 남는 것은 JSX 와 그 배치뿐
3. **매 프레임 바뀌는 값은 state 에 두지 않는다.** ref + DOM 직접 조작

## 손대기 전에

| 고치려는 것 | 파일 |
|---|---|
| 낙하·스폰·판정 타이밍 | `hooks/useGameLoop.ts` |
| 점수·HP·레시피 진행 | `hooks/useGameSession.ts` (규칙 자체는 `game/systems/`) |
| 화면 전환 순서 | `hooks/usePhase.ts` · `components/screens/ScreenLayer.tsx` |
| 무대 좌표·크기 | `components/stage/geometry.ts` |
| 밸런스 수치 | **여기가 아니다** — `game/config/` |
