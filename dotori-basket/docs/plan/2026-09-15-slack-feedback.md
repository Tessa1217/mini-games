# 슬랙 피드백 반영 — 진행 리듬 · 눈 피로 · 피버 · 까마귀 · 특별 스테이지

> **상태: 검토 대기.** 착수하지 않았다. 독립 검증 2회를 거쳐 지적을 전부 반영한 상태다.
> 계획 문서는 `docs/` 100줄 제한의 예외다(`2026-09-15-scaffold.md` 와 동일).

## Context

`mini-games.kwonyj.workers.dev` 배포본을 팀 채널에 공유했고 피드백이 왔다.

| 출처 | 내용 |
|---|---|
| 김수현 | "9까지 갔는데 집중했더니 **눈이 이상해요**" / "**스테이지 미션을 좀 줄이면** 좋을거같아요" |
| 권유진 | 피버 타임 · 다람쥐→고양이 · 장애물 추가(까마귀) · "중간중간 **특별 스테이지**" |
| 권유진 (검토 필요) | 광고 보고 retry · 보상(작가냥 연결) → **이번 범위 밖** |

확정: ①난이도 곡선도 함께 완만하게(시간 대비 난이도 현행 유지) ②고양이 에셋은 사용자가
직접 제작해 전달 ③까마귀·특별 스테이지까지 전부 ④레벨당 5단계 → **3단계**

독립 검증 2회(Critical 11 · Warning 23)를 전부 원본 대조 후 반영했다. **초안의 까마귀
속도 변형 · 눈 피로 처방 · 상태 게이트 통합안은 폐기하고 다시 짰다.**

---

## 작업 0 — 선행: phase 어휘 정리 ⭐⭐

피버·보너스를 넣기 **전에** 반드시 먼저 한다. 초안은 「`isPlayable()` 헬퍼 하나로 세 곳을
묶자」였는데 **그 자체가 작업 5를 깨뜨린다.** phase 를 읽는 곳은 3곳이 아니라 **7곳**이고,
의미가 셋으로 갈린다.

### 0-a. 판정자 — "지금 플레이 중인가"

```
components/Game.tsx:32      enabled: () => phase.ref.current === 'playing'   입력
hooks/useGameLoop.ts:105    if (phase.ref.current !== 'playing') return      낙하·페인트
```
→ `isPlayable(phase)` 로 묶는다. `'bonus'` 포함.

### 0-b. ⚠️ `useGameLoop.ts:105` 는 **의미가 다르다** — 통합하면 안 되는 것이 섞여 있다

게이트 **바로 아래 3줄**이 레시피 타이머다.

```ts
if (phase.ref.current !== 'playing') return   // :105
c.timeLeft -= dt                              // :107
if (c.timeLeft <= 0) { session.timedOut(now); return }   // :110  ← HP −1
```

`isPlayable()` 에 `'bonus'` 를 넣는 순간 보너스가 이 게이트를 통과하고, 보너스 15초를
`timeLeft` 에 태우면 `:110` 이 발화한다. **§5 가 "절대 타면 안 된다"고 한 경로를 작업 0 이
강제 배선하는 구조였다.** 계획서가 "별도 경로"라고만 하고 특정하지 못한 지점이 바로 여기다.

```ts
if (!isPlayable(phase.ref.current)) return
…
c.timeLeft -= dt
if (c.timeLeft <= 0) {
  isBonus(phase.ref.current) ? session.bonusEnded() : session.timedOut(now)
  return
}
```

### 0-c. 목적지 하드코딩 4곳 — `isPlayable()` 로는 잡히지 않는다

```
hooks/usePhase.ts:21   togglePause     'bonus' 는 어느 분기에도 안 걸림 → 보너스 중 일시정지 불가
hooks/usePhase.ts:25   pauseIfPlaying  onHidden 이 'bonus' 를 무시 → 불변식 9 붕괴
components/Game.tsx:29 resume = go('playing')   보너스 중 일시정지 후 재개하면 'playing' 에 착지
components/Game.tsx:37 p === 'paused' || p === 'unlock'
```

세 번째가 파괴적이다. `'playing'` 인데 `c.recipe` 가 비어 있으면 `trySpawn` 이 매 프레임
조기 return 해 **아무것도 안 떨어지고**, `timeLeft` 소진 시 HP −1 을 맞는 좀비 상태가 된다.

→ 일시정지에서 **돌아갈 phase 를 상태로 보관**한다(`resumeTo` ref). 문제는 비교가 아니라
**리터럴 목적지**다. 불변식은 이렇게 적는다:
**「일시정지 복귀 지점을 `'playing'` 리터럴로 쓰지 않는다」**

---

## 작업 1 — 진행 리듬 (수치)

### 1-a. `config/levelUp.ts` — `recipesPerLevel: 5 → 3`

**신규 결정이 아니라 문서와의 재정렬이다.** `rules/levels.md:19` 는 이미
「레시피 **3개** 완성마다 +1 ⚠️」(⚠️ = 미검증)이고 코드만 rev6 에서 5로 올라가 있었다.

### 1-b. `config/levels.ts` — 7행 → 12행

현행 7행을 시간축에 맞춰 선형 보간(새 Lv m ↔ 옛 Lv `1+(m-1)×6/11`). 검증에서 12행 전부
독립 재계산해 일치 확인.

```ts
{ level:  1, recipeLength: 3, correctSpawnRatio: 0.70, spawnIntervalSec: 0.89, maxOnScreen: 6, obstacleDropRate: 0.00, fallSpeedMultiplier: 1.00 },
{ level:  2, recipeLength: 3, correctSpawnRatio: 0.67, spawnIntervalSec: 0.80, maxOnScreen: 6, obstacleDropRate: 0.00, fallSpeedMultiplier: 1.12 },
{ level:  3, recipeLength: 3, correctSpawnRatio: 0.63, spawnIntervalSec: 0.72, maxOnScreen: 6, obstacleDropRate: 0.04, fallSpeedMultiplier: 1.24 },
{ level:  4, recipeLength: 4, correctSpawnRatio: 0.60, spawnIntervalSec: 0.65, maxOnScreen: 6, obstacleDropRate: 0.05, fallSpeedMultiplier: 1.37 },
{ level:  5, recipeLength: 4, correctSpawnRatio: 0.57, spawnIntervalSec: 0.59, maxOnScreen: 6, obstacleDropRate: 0.07, fallSpeedMultiplier: 1.51 },
{ level:  6, recipeLength: 4, correctSpawnRatio: 0.54, spawnIntervalSec: 0.54, maxOnScreen: 7, obstacleDropRate: 0.08, fallSpeedMultiplier: 1.65 },
{ level:  7, recipeLength: 4, correctSpawnRatio: 0.52, spawnIntervalSec: 0.50, maxOnScreen: 7, obstacleDropRate: 0.10, fallSpeedMultiplier: 1.80 },
{ level:  8, recipeLength: 5, correctSpawnRatio: 0.50, spawnIntervalSec: 0.46, maxOnScreen: 7, obstacleDropRate: 0.11, fallSpeedMultiplier: 1.95 },
{ level:  9, recipeLength: 5, correctSpawnRatio: 0.48, spawnIntervalSec: 0.43, maxOnScreen: 7, obstacleDropRate: 0.13, fallSpeedMultiplier: 2.11 },
{ level: 10, recipeLength: 5, correctSpawnRatio: 0.45, spawnIntervalSec: 0.40, maxOnScreen: 7, obstacleDropRate: 0.15, fallSpeedMultiplier: 2.27 },
{ level: 11, recipeLength: 5, correctSpawnRatio: 0.44, spawnIntervalSec: 0.37, maxOnScreen: 7, obstacleDropRate: 0.16, fallSpeedMultiplier: 2.45 },
{ level: 12, recipeLength: 6, correctSpawnRatio: 0.42, spawnIntervalSec: 0.34, maxOnScreen: 8, obstacleDropRate: 0.18, fallSpeedMultiplier: 2.63 },
```

```
현행 ×5  Lv1~7  200.8초   |  신규 ×3  Lv1~12  205.2초   → 시간축 난이도 동일
```

**방해물 `unlockLevel` 은 3 유지.** `rev6-density.md` Q8 이 「Lv4 → **Lv3**」을 명시적 결정으로
기록하고 있어 반올림 오차로 뒤집지 않는다. 다만 보간값(0.006)으로는 레벨당 0.13개라
해금 카드가 무의미해지므로 Lv3~4 만 곡선에서 살짝 올려 **0.04 / 0.05** 로 둔다
(Lv3 레벨당 0.90개, Lv4 까지 누적 1.8개). 단조증가는 유지된다.

> ⚠️ 그래도 Lv3 한 레벨만 보면 방해물을 볼 확률이 약 60% 다. 해금 카드의 «조심하세요» 는
> 「이제부터 나옵니다」 예고로 읽히므로 수용한다 — 이 수치를 문서에 남긴다.

> 부수 효과: 과일 해금(Lv1~12)과 테이블 끝이 맞는다. 지금은 **Lv8~12 가 통째로 외삽**이다.

### 1-c. `config/endless.ts` — `fromLevel: 8 → 13`, 델타 ×0.6

```
correctSpawnRatioDeltaPerLevel -0.01 → -0.006   spawnIntervalDeltaPerLevel -0.006 → -0.0036
obstacleDropRateDeltaPerLevel   0.01 →  0.006   fallSpeedDeltaPerLevel      0.10  →  0.06
```
`spawnIntervalMinSec: 0.27` · `fallSpeedMax: 3.85` 유지 — 상한의 근거가 다르다.

### 1-d. `config/recipe.ts` — `limitSec: 30 → 20`

⚠️ **정직하게: 20초는 타이머를 작동시키지 않는다.** rev6 단위(「정답을 몇 번 지나칠 수
있나」)로 30초 = 18.6~27.4회, 20초 = 10.8~17.5회, 타임아웃이 실제로 나던 지점은 4.9회다.
그래도 넣는 이유는 「**조금은** 줄여도 될 것 같다」가 그 정도를 요구하기 때문이다.
위협으로 만들려면 8~10초대인데 불변식 6·rev7 을 뒤집는 별건이다.

> 초안의 근거였던 「rev6 스윕」은 **봇 플레이**다(`rev6-density.md:50`). CLAUDE.md 가 금지한
> 근거라 걷어냈다.

**부수** — 20초에서는 `isWarning` 의 `warnRatio(0.2 → 4초)` 가 `warnSecondsMax(5초)` 에
항상 져서 **죽은 노브**가 된다. 두 노브가 같은 것을 두 번 말하지 않도록 `recipe.md` 에
지배 관계를 명시한다(`rules/recipe.md:41` 의 「잔여 25% 또는 4초」 서술도 config 와 이미 다르다).

### 1-e. 깨지는 테스트 2건

| 파일 | 단언 | 조치 |
|---|---|---|
| `game/tuning.test.ts:8` | `tuningForLevel(7).fallSpeedMultiplier ≈ 2.63` | Lv12 기준으로 교체 |
| `game/tuning.test.ts:25` | `[8,12,19,50,1000]` 을 「표 밖」으로 순회 | `fromLevel:13` 이후로 교체. 안 고치면 통과하되 **외삽을 더 이상 테스트하지 않는다** |

검증에서 나머지 테스트는 신규 표에서 전부 통과함을 확인했다(최소소요 < 제한시간: Lv1 6.31 /
Lv7 5.24 / Lv100 6.05).

---

## 작업 2 — 눈 피로 (김수현)

⚠️ **작업 1은 눈 피로를 고치지 않는다.** 시간축 난이도를 일부러 동일하게 뒀기 때문이다.

### 2-a. ⭐ 먼저 물어본다

코드로 확정할 수 없다. **방향키를 오래 누를 때 / 피격 직후 / 상시** — 한 줄 질문이
12행 표를 만드는 것보다 싸다.

### 2-b. 주파수가 특정되는 후보 2건 — 1순위

시각 피로가 가장 강하게 보고되는 3~10Hz 대역에 **둘 다 들어간다.**

| 위치 | 현상 | 주파수 |
|---|---|---|
| `useGameLoop.ts:102` | 레인 하이라이트가 보간 없이 순간이동. 72×640px = **화면의 1/5**, `rgba(255,255,255,.28)`. 홀드 시 `holdRepeatMs:120` | **8.3Hz** 대면적 휘도 이동 |
| `useGameLoop.ts:25` | 피격 무적 중 `opacity` 를 `BLINK_MS:90` 마다 토글 → 180ms 구형파를 82×104px 에 0.8초 | **5.6Hz** 점멸 |

- 하이라이트: 순간이동은 불변식 1이 요구하므로 유지, **대비를 `.28 → .16`** 낮추고 상단
  페이드를 키워 면적당 휘도 변화를 줄인다
- 점멸: 구형파를 부드러운 감쇠로 바꾸거나 주기 180ms → 300ms(3.3Hz).
  `prefers-reduced-motion` 에서는 점멸 대신 테두리 색만

### 2-c. 이미 스펙에 있는데 구현 안 된 것

`art/screen-specs.md:15-17` 은 「현재 타깃만 **1.16배 확대**, 지난 항목 0.16, **남은 항목
0.38**, 은은한 펄스」를 규정한다. 현 구현은 확대도 펄스도 없고 **남은 항목 딤이 아예 없다**.
새 컴포넌트 없이 CSS 로만 되는 개선이다.

### 2-d. 타깃 칩은 보류

초안의 근거가 부풀려져 있었다. 시선 왕복은 「초당 2~4회」가 아니라 정답간격 기준
**최대 1.2회/초**다(0.81~1.27초). 판정선 바로 위는 낙하물이 판정되는 픽셀이라 가림 문제도
생긴다. 2-b·2-c 먼저 하고 그래도 부족하면 그때 검토한다.

### 2-e. `prefers-reduced-motion` — **구현**

`art/a11y.md` 에 항목이 **이미 있다**(미체크). 문서가 아니라 구현이 gap 이다.

---

## 작업 3 — 피버 타임

```
config/fever.ts        ⚠️ BALANCE 9키 밖 — items 처럼 별도 export (BalanceConfig 는 고정 9키)
game/systems/fever.ts  순수
hooks/useGameSession.ts  MutableState 에 feverLeft·feverArmed 추가 + fresh() 초기화
```

### ⭐ 3-a. 잔여 시간은 **dt 누적**. 절대 시각을 쓰지 않는다

루프는 일시정지·해금 카드 중에도 멈추지 않는다(게이트에서 return 할 뿐). `feverUntil` 을
벽시계로 두면 해금 카드 동안 **37% 가 증발**하고 앱 전환하면 전부 증발한다.
`feverLeft -= dt` 는 `timeLeft`·`spawnIn` 과 같은 시간축이고 불변식 12와도 맞는다.

> `durationSec` 은 **시뮬레이션 초**다. 30fps 미만 환경에서는 벽시계로 더 길어진다
> (타이머도 같이 늘어나므로 게임 내적으로는 일관). config 주석에 남긴다.

### 3-b. 재발동 방지는 **`armed` 래치 하나만**

초안은 래치 + 콤보 리셋을 둘 다 넣었는데 중복이고, 콤보 리셋은 `scoreMultiplier 2 ×
comboMultiplier 2.5 = ×5 → ×1` 절벽을 만든다. **플레이어 실수가 아닌데 벌점처럼 느껴진다.**
→ 래치만 두고 콤보는 유지한다.

### 3-c. `triggerCombo: 9` — 상·하한을 모두 기록

`comboMultiplier = min(2.5, 1 + floor(combo/3)×0.5)` → **콤보 9 에서 `comboMax` 포화** ✅

| 하한 위험 | 콤보는 정답을 **놓치기만 해도** 리셋된다. rev6 는 「오답을 피하느라 정답을 그냥 보낸다」를 설계 전제로 삼으므로, 휴식이 가장 필요한 고레벨에서 가장 안 올 수 있다 |
|---|---|
| **상한 위험** | 무실수 기준 콤보 9 까지 ≈ 10.3초, 피버 6초 → **가동률 최대 35%**. 플레이의 1/3 이 "실수할 수 없는 구간"이 된다 |

→ `triggerCombo` 와 `durationSec` 을 **함께 플레이테스트 대상으로 명시**하고 상한 35% 를
비교 기준으로 남긴다.

### 3-d. `SpawnContext.fever` 는 **optional** — 필수면 `spawner.test.ts:7` 의 `base` 가 타입 에러

연출은 CSS 클래스 토글. 불변식 10 — framer-motion 을 RAF 노드에 쓰지 않는다.

---

## 작업 4 — 까마귀 (속도 변형 없음)

슬랙의 요구는 「장애물 추가하기 (까마귀?)」 — **방해물 한 종**이다. 초안은 낙하 속도 1.3배를
얹었는데 **세 건이 동시에 걸렸다.**

| | 문제 |
|---|---|
| `spawner.ts:89-94` | `crossAt` 이 `pickDef` **보다 먼저** 레벨 속도로 계산된다. 아이템별 배율은 기록된 통과 시각을 거짓으로 만들어, 뒤이은 스폰의 동시통과 카운트가 **통과시키면 안 되는 것을 통과시킨다**(불변식 4 붕괴) |
| `endless.ts:15` | `fallSpeedMax: 3.85` 는 레벨 배율에만 clamp. 무한 구간 3.85×1.3 → 회피여유 **0.02초**. 물리적 회피 불가인데 기존 테스트는 **초록으로 통과한다** |
| 계획 자체 | §2 가 「회피여유 압축이 원인」이라 해놓고 회피여유를 23% 더 압축한다 |

### 4-a. 스프라이트 (손으로 그린 SVG 1장)

- 옆모습 · 한쪽 날개를 위로 편 형태 · 뾰족한 부리. 돌멩이(납작한 각진 덩어리) ·
  나뭇가지(긴 대각선)와 안 겹친다
- **림은 SVG 안에 밝은 stroke 로 넣는다** — 몸이 검은색이라 `#46200E` 가 먹힌다.
  ⚠️ CSS 클래스로도 가능은 하다(`paintFallingSprite` 에서 양방향 토글하면 풀 재사용 문제
  없음). **구조적 불가능이 아니라 구현 선택**임을 `history/` 에 정확히 적는다
- `game/types.ts:17` `ObstacleId = 'stone' | 'twig'` 에 `'crow'` 추가 ← 초안 누락
- `items.ts` 에 `unlockLevel: 7`

### 4-b. ⚠️ 등장 빈도를 정하는 것은 `weight` 가 아니다

`pickDef`(`spawner.ts:73`)는 **균등추첨**이다 — `def.weight` 는 코드베이스 전체에서 **읽히지
않는다**(`types.ts:30` 「Phase 2 용. 현재 미사용」). 따라서:

- 방해물 **총량**(`obstacleDropRate`)은 3종이 돼도 안 변한다
- 종별 지분만 50% → **33.3%, 기존 2종이 각 −33%**
- 까마귀 `weight` 를 어떻게 적든 **아무 효과가 없다** — 표기 일관성용이다

→ 이 사실을 계획에 못 박고 −33% 를 수용한다. 가중추첨이 필요하면 별건.

### 4-c. 레인 스왑 기각 — 근거를 정정한다

초안은 「스포너의 **네 규칙을 전부** 다시 설계해야 한다」고 했는데 **과장이었다.**
`crossLimitOk`(`spawner.ts:40-44`)는 `lane` 을 보지 않는다(시각 기반). `starvation` 도 무관,
`reachability` 는 정답에만 적용돼 방해물은 해당 없음. **실제로 깨지는 것은 `laneGap` 하나다.**
결론은 유지하되 잘못된 근거를 `history/` 에 고착시키지 않는다.

---

## 작업 5 — 특별 스테이지

**4레벨마다**(Lv4·8·12 완료 시), 약 70초에 한 번.

| | 일반 | 보너스 |
|---|---|---|
| 목표 | 레시피 순서대로 | 떨어지는 과일 **전부** |
| 방해물 | HP −1 | **콤보만** 리셋 |
| 시간 | 20초 | 15초 |
| 점수 | 기본 | ×1.5 |

### ⭐ 5-a. 보너스에는 레시피가 없다 — **세 곳**에 파급된다

초안은 「분기 지점은 `caught()` 한 곳」이라 했는데 틀렸다.

| 위치 | 현재 동작 | 필요한 것 |
|---|---|---|
| `useGameLoop.ts:31` | `const target = c.recipe[c.idx]; if (!target) return` → **아무것도 안 떨어진다**(15초 빈 화면). `spawnIn` 재설정도 없어 매 프레임 재호출 | 보너스 분기 |
| `spawner.ts` `pickDef` | `ctx.target` 을 3곳에서 쓴다(기아 강제정답 · 정답 분기 · `others` 필터) | `SpawnContext.target` 을 **optional** 로 하고 「target 없으면 `activeFruits` 균등추첨 + `isCorrect: true`」 분기 |
| `useGameSession.ts:95` | `target` 부재 → `correct=false` → **모든 획득이 오답, HP −1** | 보너스 분기 |

### 5-b. phase 를 3개로 쪼갠다

초안의 「`'bonus'` 하나로 통일」은 **진입 카드 / 진행 / 결과 카드를 구분할 자리가 없다.**
`ScreenLayer` 는 `switch (phase)` 단일 분기라 `case 'bonus'` 를 두면 카드가 15초 내내
스크림을 깔아 스테이지를 가린다.

```
'bonusIntro' → 'bonus' → 'bonusResult'      isPlayable() 에는 'bonus' 만 포함
```

### 5-c. 상태와 수치

- `config/bonus.ts` — ⚠️ `BALANCE` 9키 밖, `items`·`fever` 와 같이 별도 export
- `MutableState` 에 `bonusLeft` + `fresh()` 초기화 (없으면 다시하기 후에도 남는다)
- 종료는 `bonusEnded()` — **`timedOut()` 을 타지 않는다**(§0-b)

---

## 작업 6 — 고양이 수용 준비 (에셋은 사용자가 전달)

초안은 「diff 가 CSS 1줄 + 상수 2개」라고 했는데 과소평가였다.

1. **35.9% 가 세 곳이다** — `Stage.module.css:29` · `geometry.ts:13` ·
   **`TitleScreen.module.css:2`**(초안 누락). 한 곳만 빠지면 타이틀 히어로만 어긋난다
2. **스프라이트 경로가 4곳** — `useAssetPreload.ts:7` · `Stage.tsx:23` · `TitleScreen.tsx:12` ·
   `TutorialScreen.tsx:32` → 상수 하나로
3. **높이 104 는 JS 상수가 없다**(CSS 에만 두 번) → `PLAYER_H` 신설
4. **이름 중립화** — `SQUIRREL_*` → `PLAYER_*`, `.squirrel` → `.player`, alt 를 prop 으로
5. **교체 절차 문서화** — ⭐ **몸 축을 다시 잰다.** 35.9% 는 다람쥐 꼬리 실측값이다.
   CSS·JS 를 **함께** 갱신(한쪽만 고치면 레인마다 어긋난다)
6. **불변식 16** 의 수치·문구도 바뀐다

> 이름 "도토리 숲 바구니"와 HP 아이콘 도토리가 고양이와 어긋나는 문제는
> `open-questions.md` §17-5 가 이미 지적했다. 에셋이 오면 그때 결정한다.

---

## 작업 7 — 해금 카드 정지 시간

과일이 Lv1~12 전부에 있어 **모든 레벨업이 카드를 띄운다.**
표시 시간 = `bannerDurationSec × 1000 + 700`(`UnlockCard.tsx:30`).

| | 카드 | 레벨 하나 | 정지 비율 |
|---|---|---|---|
| 현행 | 2.2초 | 26.9~31.6초 | 7.6% |
| 신규 + `bannerDurationSec: 0.9` | 1.6초 | 15.7~18.9초 | **9.2%** |

⚠️ **현행 7.6% 로 돌아가지는 않는다.** 카드가 1.7배 자주 뜨는 게 원인이고 그건 의도된
보상감이라 9.2% 를 수용한다. 더 내리면 읽기가 어려워진다(Lv3 카드는 한글 33자 + 이미지 3장).

**부수 2건**
- `+ 700` 은 하드코딩 리터럴이라 **불변식 20 위반**이고, 0.9 로 내리면 총 시간의 44% 를
  차지해 노브 이름이 실제를 설명하지 못한다 → `config` 로 접는다
- `UnlockCard` 에 `role="dialog"`·`aria-live` 가 없어 스크린리더가 읽기 전에 사라진다.
  `a11y.md` 에 **「자동 해제 콘텐츠는 최소 시간 + 늦출 수단」(WCAG 2.2.1) 항목 자체가 없다**
  → 2-e 와 같은 파일이므로 묶어서 처리

---

## 문서

| 문서 | 갱신 |
|---|---|
| `rules/levels.md` | 12행 곡선 · ⚠️ 해제 · **해금 과일 열이 코드와 다름**(Lv3 을 배로 적었으나 실제는 수박) |
| `rules/balance-policy.md` | **「레벨업 빈도와 난이도 상승률은 별개 노브다」** — 설계 원칙이라 불변식 표가 아니라 여기 |
| `rules/recipe.md` | 제한시간 20초 · `warnRatio` 지배 관계 · **:17 「놓침은 콤보도 유지」가 코드(`missResetsCombo:true`)와 반대** · **:36-41 역산식 블록이 불변식 6과 충돌**(§3-c 논거가 이 동작에 의존하므로 반드시 정정) |
| `rules/items.md` | 까마귀 · 방해물 Lv3 유지 · Lv3 노출 확률 60% |
| `rules/state-machine.md` | `bonusIntro/bonus/bonusResult` · 피버 · **Lv6·7 이 「해금 없는 레벨」이라는 서술 정정** |
| `rules/spawner.md` | 밀도 표 레벨 인덱스 · **「최속 4칸 = 3×120 = 360ms」 오류**(4스텝이라 480ms) · 「다른 레인으로 돌린다」는 코드에 없는 경로 |
| `art/silhouette.md` | 까마귀 림 예외 |
| `art/layout.md` | **레시피 바가 무대 밖 하단이라는 현실 반영**(문서는 아직 무대 안 y44~96) |
| `art/a11y.md` | 대비 수치 정정(`--cream` 은 없는 토큰, 실제 `--paper`) · 자동 해제 항목 신설 |
| `art/pipeline.md` | 주인공 교체 절차 · 아이템 18종 |
| `arch/tuning-api.md` | 「8레벨 이후 외삽」 3곳 → 13 |
| `game/CLAUDE.md` | `BalanceConfig` 예외가 1건(`items`) → **3건**(`fever`·`bonus`) |
| `game/tuning.ts:42-47` | **docstring 이 불변식 6과 정면 충돌** — 「역산한다」고 적혀 있는데 코드는 고정값. `_level` 미사용 |
| `game/config/items.ts:4` | 「과일 16종 + 방해물 2종」 → 15 + 3 |
| `game/types.ts:181,184` | `GamePhase`·`CatchResult` 는 **소비자 0건인 죽은 타입**이고 `usePhase.Phase` 와 이미 갈라져 있다 → 삭제 |
| `docs/README.md:41-52` | `history/` 파일 열거에 `rev9` 한 줄 |
| `prototype/README.md` | stale 6건(자동 해제 2.2초 · 레시피 5개 · 제한시간 30초 · 회피여유 3개 · 해금 없는 레벨 · 밀도 2.80). `docs/plan/…:248` 에 동일 작업 선례 있음 |
| `history/rev9-slack-feedback.md` | **신설, 100줄 이내** — 회피여유 · 미션 축소의 함정 · 까마귀 3중 충돌 · 레인 스왑 기각(laneGap 1건) · 피버 가동률 상한 |
| `CLAUDE.md` | 불변식: 「일시정지 복귀 지점을 `'playing'` 리터럴로 쓰지 않는다」 · 16번 문구 |

---

## 검증

1. **Vitest** — `tuningForLevel` 12행 경계값 · 피버 dt 누적 · **보너스 종료가 HP 를 안 깎음** ·
   보너스에서 `target` 없이 스폰됨 · 까마귀가 레시피에 안 들어감
2. **수치표 실행** — 레벨별 낙하·정답간격·최소완주·제한시간 여유·**회피여유**. 추정치 금지
3. **브라우저** — `?dbg` 로 Lv1·4·8·12 / 피버 발동·종료 / 보너스 진입·종료 /
   **보너스 중 일시정지 후 재개가 `'bonus'` 로 돌아가는지**(§0-c) /
   **일시정지 4초 후 피버 잔여시간이 그대로인지**(§3-a) / 액박 0
4. ⚠️ **봇 플레이 수치를 근거로 쓰지 않는다**
5. 빌드 · 타입체크 · `wrangler deploy --dry-run`

---

## 별건 — 검증 중 발견된 기존 버그 (이 계획의 결함 아님)

- **일시정지 4초 후 재개 시 첫 스폰이 항상 강제 정답** — `lastCorrectSpawnMs` 가 절대 시각.
  불변식 18 이 `reset()` 에 대해 막은 것과 **같은 버그가 일시정지 경로에 남아 있다**
- **무적 중 오답을 받으면 콤보가 리셋되지 않는다** — `useGameSession.ts:99` 가 HP 변화로
  판정하는데 무적이면 HP 가 안 변한다
- **`loop.resetClock()` 호출처 0건** — `state-machine.md:37` 이 설명하는 메커니즘이 미배선.
  실제로 점프를 막는 건 `MAX_DT` 클램프라 결과가 같아 안 드러났다
- **vitest 5 업그레이드** — dev 전용 취약점 5건(critical 1)

---

## 검증 반영 — 4칸

| | 건수 | 내용 |
|---|---|---|
| **반영** | 31 | 1차 18건 + 2차 13건(게이트 3→7곳 · 타이머 분리 · `resumeTo` · 보너스 스폰 3곳 파급 · phase 3분할 · Lv3 0.04 · `weight` 미사용 · 래치만 · 가동률 상한 · `fever` 9키 밖 · 배너 착지점 9.2% · a11y 항목 신설 · 문서 10건) |
| **오탐 탈락** | 0 | 지적 전부 원본 대조로 사실 확인 |
| **참이지만 미반영** | 3 | 아래 |
| **사용자 승격** | 1 | 아래 |

### 기각 3건 — 검증 에이전트가 모르는 맥락

1. **「레시피 바를 `layout.md` 위치로 되돌려라」** — 하단 배치는 **사용자가 직접 요청한
   것**이다. 드리프트가 아니라 **문서가 안 따라온 것** → `layout.md` 를 고친다
2. **「"미션을 좀 줄이면"이 `recipesPerLevel` 인지 미확인」** — 사용자가 「5단계 → 3단계」로
   명시했다
3. **「림 예외는 CSS 로 하면 안 된다」(1차)** — 2차가 반박했고 2차가 맞다.
   양방향 토글하면 가능하다. SVG stroke 결론은 유지하되 **근거를 "구현 선택"으로 정정**

### 사용자 승격 — 제한시간 20초

1차 검증은 **「얻는 것 없이 사고 여지만 늘리니 빼라」**고 했다. 「조금은 줄여도 될 것
같다」는 지시가 있어 유지하지만, **20초가 타이머를 작동시키지 않는다**는 점은 §1-d 에
그대로 적었다. 진짜 압박은 8~10초대이고 불변식 6·rev7 을 뒤집는 별건이다.

---

## 이번 플랜 밖

광고 retry · 보상(작가냥) — 사용자 검토 예정 · 고양이 에셋 제작 · 게임 이름 변경 ·
까마귀 레인 스왑(기각) · 방해물 가중추첨 · 제한시간 8~10초대 재설계
