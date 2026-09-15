/**
 * 도토리 숲 바구니 — 공용 타입
 *
 * 이 디렉터리(game/)는 React를 import하지 않는다. → docs/arch/structure.md
 * 값의 근거는 docs/ 에 있다. 여기에는 계약(단위·범위·필수 여부)만 적는다.
 */

// ── 아이템 ────────────────────────────────────────────────
// → docs/rules/items.md

export type FruitId =
  | 'apple' | 'tangerine' | 'banana' | 'strawberry' | 'grape' | 'watermelon'
  | 'pear' | 'cherry' | 'lemon' | 'pineapple' | 'peach'
  | 'blueberry' | 'avocado' | 'kiwi' | 'grapefruit'

/** 레시피에 절대 등장하지 않는다 — 받으면 항상 오답 */
export type ObstacleId = 'stone' | 'twig'

export type ItemId = FruitId | ObstacleId

export interface ItemDef {
  id: ItemId
  /** 한국어 표시명 (HUD·접근성 라벨) */
  label: string
  kind: 'fruit' | 'obstacle'
  /** true면 레시피 생성에서 제외 */
  neverInRecipe: boolean
  /** 이 레벨부터 스폰 대상 */
  unlockLevel: number
  /** Phase 2 (무게 → 속도 가중) 용. 현재 미사용 */
  weight: number
  /** HUD 대표색. 스프라이트 채색이 아니다 → docs/art/color.md */
  color: string
  /**
   * 스프라이트 경로. **컴포넌트에서 경로를 조립하지 않는다** —
   * 하드코딩 목록을 쓰다가 아트가 없는 과일이 액박으로 나온 적이 있다.
   */
  sprite: string
  /** 에셋 교체 전 플레이스홀더 */
  placeholder: string
}

// ── 밸런싱 ────────────────────────────────────────────────
// 값은 전부 config/ 에 모여 있다. 시스템 코드에 리터럴을 남기지 않는다.

/** → docs/art/layout.md */
export interface LaneConfig {
  count: number
  /** 논리 좌표계. 실제 화면은 scale만 적용한다 */
  logicalWidth: number
  logicalHeight: number
  /** 판정선 y (논리 px). 이 선을 넘는 프레임에 1회만 판정 */
  catchLineY: number
}

/** → docs/rules/lane.md */
export interface MovementConfig {
  /** ⭐ 기울기 연출 길이(ms). **위치 보간이 아니다** — 시각 위치 === 논리 위치 */
  snapTiltMs: number
  /** ⭐ 최소 이동 간격(ms). 탭·홀드·키보드가 **모두** 이 게이트를 통과한다 */
  moveCooldownMs: number
  /** 홀드 후 연속 이동 시작까지(ms) */
  holdInitialDelayMs: number
  /** auto-repeat 간격(ms) */
  holdRepeatMs: number
}

/** → docs/rules/hp-score.md */
export interface HpConfig {
  max: number
  /** 피격 후 무적(초). 데미지만 무효 — 획득은 정상, 콤보는 오르지 않는다 */
  invulnerableSec: number
  /** 레벨업 회복량 (max 초과 불가). 0 = 회복 없음 */
  healOnLevelUp: number
  /** 정답을 놓쳤을 때 HP 감소량. 0 = 무페널티 */
  missPenaltyHp: number
  /** 정답을 놓쳤을 때 콤보를 끊을지 */
  missResetsCombo: boolean
}

/** → docs/rules/hp-score.md */
export interface ScoringConfig {
  /** 정답 1개 기본 점수 (콤보 배율이 곱해진다) */
  correctCatch: number
  /** 완성 보너스 = 이 값 × 레시피 길이 */
  recipeCompletePerItem: number
  /** 연속 정답 몇 회마다 배율이 오르는지 */
  comboStep: number
  comboIncrement: number
  comboMax: number
}

/** → docs/rules/recipe.md */
export interface RecipeConfig {
  /** ⭐ 제한시간(초). **고정값** — 역산하면 스폰 난수가 패배를 결정한다 */
  limitSec: number
  /** 잔여 비율이 이 값 이하면 경고 (0~1) */
  warnRatio: number
  /** 또는 잔여 시간이 이 값(초) 이하면 경고 */
  warnSecondsMax: number
  /** 만료 시 HP 감소량. 0이면 "재생성만" 동작 */
  expirePenaltyHp: number
  /** 같은 과일이 연속으로 나오지 않게 할 구간 길이 */
  noRepeatWindow: number
}

/** → docs/rules/spawner.md */
export interface SpawnerConfig {
  /** ⭐ 같은 시간대에 판정선을 통과할 수 있는 최대 수. 권장 = 레인 수 − 2 */
  simultaneousCrossLimit: number
  /** 위 제한의 통과 시각 윈도우(초, ±) */
  crossWindowSec: number
  /** ⭐ 스폰 간격 편차(0~1). 0이면 simultaneousCrossLimit이 죽은 가드가 된다 */
  spawnJitterRatio: number
  /** 같은 레인 최소 간격(논리 px) */
  sameLaneMinGapPx: number
  /** 이 시간(초) 동안 타깃이 안 나오면 다음 스폰을 강제로 정답으로 */
  starvationSec: number
  /** 정답 스폰 시 도달 가능성을 검사할지 */
  reachabilityCheck: boolean
  /** 낙하 속도 기준값(논리 px/초). fallSpeedMultiplier가 곱해진다 */
  baseFallSpeedPxPerSec: number
  /** 규칙 충돌 시 우선순위. 앞이 강하다 */
  rulePriority: readonly SpawnerRule[]
}

export type SpawnerRule = 'crossLimit' | 'laneGap' | 'starvation' | 'reachability'

/** → docs/history/rev6-levelup.md */
export interface LevelUpConfig {
  recipesPerLevel: number
  /** 배너 노출(초). 이 동안 루프와 레시피 타이머는 정지 */
  bannerDurationSec: number
}

/** 레벨별 난이도 — 다섯 축을 독립 조절한다 → docs/rules/levels.md */
export interface LevelTuning {
  level: number
  recipeLength: number
  /** 타깃 과일을 뽑을 확률(0~1). 낮출수록 오답 밀도가 오른다 */
  correctSpawnRatio: number
  /** ⭐ 스폰 간격(초) — **전역 케이던스**(레인별이 아니다). 밀도 ≈ 낙하시간 ÷ 이 값 */
  spawnIntervalSec: number
  /** ⭐ 화면 동시 존재 **안전 상한**. 난이도 축이 아니다 */
  maxOnScreen: number
  /** 방해물 스폰 확률(0~1) */
  obstacleDropRate: number
  /** baseFallSpeedPxPerSec에 곱해지는 배율 */
  fallSpeedMultiplier: number
}

/** 테이블 마지막 레벨 이후의 무한 진행 → docs/history/rev7-speed.md */
export interface EndlessTuning {
  fromLevel: number
  recipeLength: number
  maxOnScreen: number
  correctSpawnRatioDeltaPerLevel: number
  correctSpawnRatioMin: number
  spawnIntervalDeltaPerLevel: number
  spawnIntervalMinSec: number
  obstacleDropRateDeltaPerLevel: number
  obstacleDropRateMax: number
  fallSpeedDeltaPerLevel: number
  fallSpeedMax: number
}

export interface BalanceConfig {
  lane: LaneConfig
  movement: MovementConfig
  hp: HpConfig
  scoring: ScoringConfig
  recipe: RecipeConfig
  spawner: SpawnerConfig
  levelUp: LevelUpConfig
  levels: LevelTuning[]
  endless: EndlessTuning
}

// ── 런타임 상태 (구현 시 확장) ────────────────────────────

export type GamePhase = 'boot' | 'title' | 'playing' | 'paused' | 'levelUp' | 'gameOver'

/** 판정은 순수 함수로 두고 이 값만 돌려준다 */
export type CatchResult = 'correct' | 'wrong' | 'miss'
