/**
 * 도토리 숲 바구니 — 공용 타입
 *
 * 이 디렉터리(game/)는 React를 import하지 않는다.
 * 규칙 로직을 프레임워크와 분리해두면 단위 테스트가 쉽고,
 * 나중에 렌더를 Canvas로 바꾸거나 다른 환경에 이식할 때 그대로 쓸 수 있다.
 */

// ────────────────────────────────────────────────────────────
// 아이템
// ────────────────────────────────────────────────────────────

/** 레시피에 등장할 수 있는 과일 */
export type FruitId =
  | 'apple' | 'tangerine' | 'banana' | 'strawberry' | 'grape' | 'watermelon'
  | 'pear' | 'cherry' | 'lemon' | 'pineapple' | 'peach'
  | 'blueberry' | 'avocado' | 'kiwi' | 'grapefruit' | 'apple_cut'

/** 레시피에 절대 등장하지 않는 방해물 — 받으면 항상 오답 */
export type ObstacleId = 'stone' | 'twig'

export type ItemId = FruitId | ObstacleId

export interface ItemDef {
  id: ItemId
  /** 한국어 표시명 (HUD·접근성 라벨) */
  label: string
  kind: 'fruit' | 'obstacle'
  /**
   * true면 레시피 생성에서 제외된다.
   * 방해물의 구현은 사실상 이 플래그 하나가 전부다 — 받으면 항상 오답 판정을 탄다.
   */
  neverInRecipe: boolean
  /** 이 레벨부터 스폰 대상에 포함된다 */
  unlockLevel: number
  /** Phase 2 (무게 → 이동속도 가중치) 용. 현재 미사용 */
  weight: number
  /** 플레이스홀더 렌더용 색 (에셋 교체 전까지) */
  color: string
  /** 플레이스홀더 렌더용 이모지 (에셋 교체 전까지) */
  placeholder: string
}

// ────────────────────────────────────────────────────────────
// 밸런싱 — 아래 인터페이스의 값은 전부 config/balance.ts 한 곳에 모여 있다.
//          코드를 고치지 않고 숫자만 바꿔 플레이테스트할 수 있게 하는 것이 목적.
// ────────────────────────────────────────────────────────────

export interface LaneConfig {
  /** 레인 수. 레벨이 올라도 바뀌지 않는다 (조작 감각 유지) */
  count: number
  /** 논리 좌표계 크기 — 실제 화면은 여기에 scale만 적용한다 */
  logicalWidth: number
  logicalHeight: number
  /** 바구니 판정선의 y (논리 좌표). 과일이 이 선을 넘는 프레임에 1회만 판정 */
  catchLineY: number
}

export interface MovementConfig {
  /**
   * ★ 불변식: 시각 위치 === 논리 위치. 레인 이동은 **위치 보간을 하지 않는다.**
   * 다람쥐(바구니 포함)는 새 레인으로 즉시 스냅하고, 연출은 제자리 기울기/스쿼시로만 준다.
   * 이 값은 그 기울기 애니메이션의 지속시간(ms)일 뿐 위치와 무관하다.
   *
   * 위치를 보간하면 홀드 연속 이동 중 스프라이트가 논리 레인보다 뒤처져서
   * "눈에는 바구니가 과일 밑에 있는데 놓침 판정"이 난다 (레인 폭 = 화면의 20%).
   */
  snapTiltMs: number
  /**
   * ★ 입력 종류와 무관한 최소 이동 간격(ms).
   * 탭·홀드·키보드가 **모두 이 게이트를 통과**한다. 이게 없으면 탭 연타(70~100ms)가
   * holdRepeatMs보다 빨라서 난이도 노브가 최적 플레이에서 무력화된다.
   * 쿨다운 중 입력은 1개까지만 버퍼링한다.
   */
  moveCooldownMs: number
  /** 버튼/키를 누르고 있을 때 연속 이동이 시작되기까지의 딜레이(ms) */
  holdInitialDelayMs: number
  /**
   * auto-repeat 간격(ms).
   * 해석은 **A안(표준 키 리피트)**: 누르는 즉시 1회 이동 → holdInitialDelayMs 대기
   * → 이후 이 값 주기. 거리 d레인 소요시간 = d === 1 ? 0
   *   : holdInitialDelayMs + (d - 2) × holdRepeatMs
   */
  holdRepeatMs: number
}

export interface HpConfig {
  max: number
  /**
   * 피격 후 무적 시간(초). 연쇄 사망 방지.
   * **범위 정의**: 데미지만 무효다. 무적 중에도 정답 획득은 정상 동작하고,
   * 추가 오답은 소멸하되 데미지가 0이다. 다만 무적 중에는 콤보가 오르지 않는다
   * — 일부러 오답을 먹고 무적으로 밀집 구간을 관통하는 전략을 막기 위함.
   */
  invulnerableSec: number
  /**
   * 레벨업 시 회복량 (max 초과 불가).
   * **기본 0** — 난이도 축이 전부 상한에 걸리는 Lv19 이후에는 난이도가 정적이 되어,
   * 회복이 있으면 숙련자 세션이 원리적으로 끝나지 않는다.
   * "HP가 다 닳으면 game over"가 유일한 종료 조건이므로 회복을 두지 않는다.
   */
  healOnLevelUp: number
  /**
   * 정답 과일을 놓쳤을 때의 HP 감소량. **기본 0**(놓침 무페널티).
   * 동시 낙하 구조에서 "오답을 피하느라 정답을 못 받는" 것은 정상 플레이의 일부다.
   * 전역 압박은 레시피 제한시간이 담당한다.
   */
  missPenaltyHp: number
  /**
   * 정답 과일을 놓쳤을 때 콤보를 끊을지. **기본 true**.
   * HP는 오답 전용, 놓침은 점수 손해 — 두 실수의 성격을 분리한다.
   * 이게 없으면 "받으러 갈 이유"가 제한시간밖에 남지 않는다.
   */
  missResetsCombo: boolean
}

export interface ScoringConfig {
  /** 정답 1개 획득 시 기본 점수 (콤보 배율이 곱해짐) */
  correctCatch: number
  /** 레시피 완성 보너스 = 이 값 × 레시피 길이 */
  recipeCompletePerItem: number
  /** 연속 정답 몇 회마다 배율이 오르는지 */
  comboStep: number
  /** comboStep 도달 시 배율 증가량 */
  comboIncrement: number
  /** 배율 상한 */
  comboMax: number
}

export interface RecipeConfig {
  /**
   * 레시피 제한시간(초). **고정값**이다.
   *
   * rev.6까지는 «최소소요 + 여유»로 역산했으나, 그러면 스폰이 운 나쁘게 몰릴 때
   * **정답이 안 나와서 지는** 판이 생긴다. 실력이 아니라 난수가 결정하는 패배다.
   * 30초는 최소소요(5.4~6.3초)의 5배라 정상 플레이에서는 걸리지 않는다 —
   * 타이머는 §4 원래 의도대로 **안 받고 버티는 회피 플레이만** 차단한다.
   *
   * 난이도는 타이머가 아니라 **낙하 속도**가 담당한다(`fallSpeedMultiplier`).
   */
  limitSec: number
  /** 잔여 비율이 이 값 이하면 경고 상태 */
  warnRatio: number
  /** 또는 잔여 시간이 이 값(초) 이하면 경고 상태 */
  warnSecondsMax: number
  /** 만료 시 HP 감소량. 0으로 두면 "레시피 재생성만" 동작이 된다 */
  expirePenaltyHp: number
  /** 레시피 생성 시 같은 과일이 연속으로 나오지 않게 할 구간 길이 */
  noRepeatWindow: number
}

export interface SpawnerConfig {
  /**
   * ★ 핵심 제약 — 회피 가능성 보장.
   * "화면에 몇 개 떠 있는지"가 아니라 "같은 시간대에 판정선을 통과하는 수"를 제한한다.
   * 시차만 있으면 화면이 아무리 빽빽해도 순서대로 피할 수 있으므로,
   * 이렇게 하면 밀도(체감 난이도)와 공정성을 동시에 얻는다.
   * 권장값 = 레인 수 - 2 (회피용 레인 2개 확보)
   */
  simultaneousCrossLimit: number
  /** 위 제한을 적용할 통과 시각 윈도우(초, ±) */
  crossWindowSec: number
  /**
   * 스폰 간격에 주는 무작위 편차 비율(0~1).
   * 실제 간격 = spawnIntervalSec × (1 ± spawnJitterRatio).
   * **필수**: 완전 균일한 케이던스에서는 크로싱도 균일하게 배치되어
   * simultaneousCrossLimit이 구조적으로 도달 불가능해진다(= 죽은 가드).
   * 지터가 있어야 뭉치는 구간이 생기고 그때 상한이 실제 가드로 작동한다.
   * 리듬이 기계적으로 들리지 않게 하는 효과도 겸한다.
   */
  spawnJitterRatio: number
  /** 같은 레인의 직전 과일이 이만큼(논리 px) 내려가기 전엔 다음 과일 금지 */
  sameLaneMinGapPx: number
  /** 이 시간(초) 동안 현재 타깃 과일이 스폰되지 않으면 다음 스폰을 강제로 정답으로 */
  starvationSec: number
  /**
   * 정답 스폰 시 "현재 레인에서 그 레인까지 제때 갈 수 있는가"를 검사할지.
   * 거리 × holdRepeatMs < 낙하 잔여시간
   */
  reachabilityCheck: boolean
  /** 낙하 속도 기준값(논리 px/초). 레벨별 fallSpeedMultiplier가 곱해진다 */
  baseFallSpeedPxPerSec: number
  /**
   * 규칙 충돌 시 우선순위. 앞에 있을수록 강하다.
   * 기아 강제 스폰이 다른 규칙을 만족하는 레인을 못 찾으면 스폰을 1틱 미루고
   * 기아 타이머는 계속 진행한다 (규칙을 어기지 않는다).
   */
  rulePriority: readonly SpawnerRule[]
}

/** 스포너 규칙 식별자 — 충돌 시 우선순위 결정에 쓴다 */
export type SpawnerRule =
  | 'crossLimit'
  | 'laneGap'
  | 'starvation'
  | 'reachability'

export interface LevelUpConfig {
  /** 레시피 몇 개를 완성하면 레벨업하는지 */
  recipesPerLevel: number
  /** 해금 배너 노출 시간(초). 이 동안 루프와 레시피 타이머는 정지 */
  bannerDurationSec: number
}

/** 레벨별 난이도. 다섯 축을 독립적으로 조절한다 */
export interface LevelTuning {
  level: number
  /** 레시피 길이 */
  recipeLength: number
  /** 스폰 시 현재 타깃 과일을 뽑을 확률(0~1). 낮출수록 오답 밀도가 올라간다 */
  correctSpawnRatio: number
  /**
   * 스폰 간격(초) — **전역 케이던스**다(레인별이 아니라 전체에서 이 주기로 1개).
   * 레인은 규칙을 만족하는 후보 중에서 고른다.
   * ★ 체감 밀도를 만드는 실질 노브: 밀도 ≈ 낙하시간 / 이 값.
   *   낙하 속도와 같은 비율로 줄이면 밀도가 제자리걸음이 되므로, **속도보다 빠르게** 줄인다.
   */
  spawnIntervalSec: number
  /**
   * 화면 동시 존재 **안전 상한**. 난이도 축이 아니다.
   * 체감 밀도는 spawnIntervalSec이 만든다 (밀도 ≈ 낙하시간 / 스폰간격).
   * 이 값은 자연 밀도보다 넉넉히 위에 두어, 지터가 누적된 이상 구간만 잡는다.
   * 자연 밀도보다 낮게 잡으면 스폰 간격 설정을 무력화하므로 주의.
   */
  maxOnScreen: number
  /** 방해물이 스폰될 확률(0~1) */
  obstacleDropRate: number
  /** baseFallSpeedPxPerSec에 곱해지는 배율 */
  fallSpeedMultiplier: number
}

/** 테이블에 정의된 마지막 레벨 이후의 무한 진행 규칙 */
export interface EndlessTuning {
  /** 이 레벨부터 아래 델타가 매 레벨 적용된다 */
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

// ────────────────────────────────────────────────────────────
// 런타임 상태 (구현 시 확장)
// ────────────────────────────────────────────────────────────

export type GamePhase =
  | 'boot'
  | 'title'
  | 'playing'
  | 'paused'
  | 'levelUp'
  | 'gameOver'

/** 획득 판정 결과 — 판정은 순수 함수로 두고 이 값만 돌려준다 */
export type CatchResult = 'correct' | 'wrong' | 'miss'
