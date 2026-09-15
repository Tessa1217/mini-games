# 도토리 숲 바구니

레인 5개에 떨어지는 과일을 **레시피 순서대로** 받는 게임. 세로 360 × 640, 웹뷰 탑재 전제.
문서 지도는 `docs/README.md`.

## 🔴 깨면 게임이 망가지는 것

| # | 규칙 | 어기면 | 근거 |
|---|---|---|---|
| 1 | **시각 위치 === 논리 위치.** 위치 보간 금지 | 스프라이트가 논리 레인보다 뒤처져 판정이 눈과 어긋난다 | `rules/lane.md` |
| 2 | **이동 쿨다운은 탭·홀드·키보드 공통 게이트** | 탭 연타(70~100ms)가 홀드 주기보다 빨라 난이도 노브가 무력화된다 | `rules/lane.md` |
| 3 | **밀도는 `spawnIntervalSec`이 만든다.** `maxOnScreen`은 난이도 축이 아니라 안전 상한 | 자연 밀도보다 낮게 잡으면 스폰 간격 설정이 통째로 죽는다 | `rules/spawner.md` |
| 4 | **스폰 지터 없이는 동시통과 상한이 죽은 가드다** | 균일 케이던스에서는 상한에 구조적으로 도달하지 못한다 | `rules/spawner.md` |
| 5 | **`spawnIntervalSec` 하한 0.267초** (= `crossWindowSec`×2 ÷ `simultaneousCrossLimit`) | 그 아래는 스포너가 막아 죽은 설정이 된다 | `history/rev6-derived.md` |
| 6 | **레시피 제한시간은 고정값.** 최소소요에서 역산하지 않는다 | 스폰 난수가 패배를 결정한다 | `rules/recipe.md` |
| 7 | **난이도 축은 낙하 속도.** 개수가 아니다 | 레인이 5개라 개수가 늘어도 피할 자리가 남는다 | `history/rev7-speed.md` |
| 8 | **`ACTIVE_FRUIT_CAP = 8`** — 해금분을 전부 풀에 넣지 않는다 | 16종이 동시에 떨어지면 "찾기"가 "훑기"가 된다 | `rules/items.md` |
| 9 | **키보드 5규칙** — `event.code` · `e.repeat` 무시 · `blur`/`visibilitychange` 리셋 · 숨김 시 자동 일시정지 | 한글 입력에서 키가 안 먹고, 앱 전환 중 판이 진행된다 | `rules/input.md` |
| 10 | **framer-motion은 연출 전용.** RAF가 쓰는 노드의 `transform`을 공유 금지 | 매 프레임 transform 경합 | `arch/stack.md` |
| 11 | **60fps로 변하는 값을 state에 두지 않는다** | 로드맵이 "P0부터 강제 — 나중엔 전면 수정"으로 지정한 최상위 리스크 | `arch/stack.md` |
| 12 | **쿨다운·리피트는 루프 누적시간으로.** `setTimeout`/`setInterval` 금지 | 벽시계는 프레임과 어긋난다 | `arch/stack.md` |
| 13 | **정적 export는 상대 경로** (`assetPrefix: './'`) | 웹뷰 로컬 로딩 실패 | `arch/webview.md` |
| 14 | **`catchLineY`를 바꾸면 `baseFallSpeedPxPerSec`를 같은 비율로 보정** | 낙하 시간이 달라져 밸런스 전체가 틀어진다 | `art/layout.md` |
| 15 | **모든 아이템에 림(테두리).** 대비는 채우기색이 아니라 림이 정한다 | 흑백 변환 시 배경에 먹힌다(최악 1.05:1 → 3.10:1) | `art/silhouette.md` |
| 16 | **다람쥐 정렬은 몸 축 35.9%** (바운딩 박스 중심 아님) | 꼬리가 박스 중심을 끌어당겨 바구니가 11.5px 치우친다 | `art/sprites.md` |
| 17 | **`el.hidden` 토글 시 `[hidden]{display:none!important}` 필요** | `display:flex`가 특이도로 이겨 오버레이가 안 사라진다 | `history/rev6-runtime.md` |
| 18 | **`reset()`/초기화에 `performance.now()`를 넘긴다.** 0 기준 금지 | 기아 방지가 즉시 참이 되어 첫 스폰이 항상 강제 정답 | `history/rev6-runtime.md` |
| 19 | **획득 처리 순서 = `checkLevelUp()` → `newRecipe()`** | 새 레시피가 옛 레벨의 길이·제한시간으로 생성된다 | `rules/state-machine.md` |
| 20 | **밸런스 리터럴 금지.** 유일 출처는 `game/config/` | 튜닝 지점이 흩어져 플레이테스트가 무의미해진다 | `arch/tuning-api.md` |
| 21 | **`BALANCE.levels`를 직접 읽지 않는다** — `tuning.ts` 경유 (그 파일만 예외) | 외삽이 여러 곳에 생긴다 | `arch/tuning-api.md` |
| 22 | **`localStorage`는 try/catch** | 시크릿 모드에서는 접근 자체가 throw한다 | `rules/hp-score.md` |

새 불변식을 발견하면 **고치고 끝내지 말고** ① 해당 문서에 `⭐` ② `history/`에 경위 기록
③ 이 표에 한 줄 추가. 그게 이 파일의 존재 이유다.

## 무엇을 건드릴 때 무엇을 읽나

| 건드리는 것 | 읽을 문서 |
|---|---|
| `game/config/items.ts` | `rules/items.md` + `art/sprites.md` ← 에셋과 얽혀 예외 |
| `game/config/` 그 외 | `rules/` 중 해당 파일 1개 |
| `game/tuning.ts` | `arch/tuning-api.md` · `rules/balance-policy.md` |
| `game/systems/` | `rules/spawner.md` · `rules/recipe.md` · `rules/hp-score.md` |
| `game/types.ts` | 변경 전 `grep -rln`으로 영향 매핑 + `arch/tuning-api.md` |
| `components/` · `app/` | `art/layout.md` · `art/screen-specs.md` · `art/a11y.md` · `rules/state-machine.md` |
| `game/engine/` | `arch/stack.md` (고정 타임스텝 · 노드 풀) |
| `input/` | `rules/input.md` |
| `platform/` | `arch/webview.md` |
| 에셋 | `art/pipeline.md` · `art/sprites.md` · `art/color.md` |
| `prototype/index.html` | **동결됨** — 원칙적으로 건드리지 않는다 |
| `*.test.ts` | 대상 시스템의 `rules/` 문서 |
| 밸런스 수치 | `rules/balance-policy.md` + `history/` 최신 rev |

## 작업 절차

- **밸런스 수정** — `game/config/*` 만 고친다. Next 앱이 `import { BALANCE }`로 읽으므로
  단일 출처가 성립한다. `prototype/`은 동결된 참조 구현이라 옛 값을 들고 있다 — **거기서 뽑은
  수치를 현행으로 쓰지 않는다.**
- 수정 후 **실행해서 표를 뽑아** 보고한다(레벨별 낙하·밀도·정답간격·최소소요·제한시간·회피여유).
  추정치로 보고하지 않는다.
- **`game/` 수정** — Vitest 필수. 경계값(레벨 0·음수·소수·`NaN`·`Infinity`)을 포함한다.
- **UI 수정** — 브라우저로 확인하고 `art/a11y.md` 체크리스트를 돌린다.
- **⚠️ 봇 플레이 수치를 근거로 쓰지 않는다** — 낙하 2.5초에 100ms 폴링 봇은 회피 판단에
  4틱뿐이라 사람보다 현저히 불리하다. 체감 난이도는 사람이 판정한다.
