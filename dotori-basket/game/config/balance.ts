import type { BalanceConfig } from '../types'

/**
 * ★ 밸런싱 단일 지점 ★
 *
 * 게임의 모든 튜닝 값은 이 파일 하나에 있다. 코드를 고치지 않고 숫자만 바꿔
 * 플레이테스트할 수 있게 하는 것이 목적이므로, 새 수치가 생기면 여기에 추가하고
 * 시스템 코드에는 리터럴을 절대 남기지 않는다.
 *
 * 아래 값은 전부 **초안**이다. 실제로 플레이해보며 조정하는 것을 전제로 한다.
 */
export const BALANCE: BalanceConfig = {
  // ── 레인 / 좌표계 ──────────────────────────────────────
  lane: {
    count: 5,            // 레벨이 올라도 바뀌지 않는다 (조작 감각 유지)
    logicalWidth: 360,
    logicalHeight: 640,
    catchLineY: 500,     // 낙하 거리 500px (하단 68px는 컨트롤 바 — DESIGN.md §2)
  },

  // ── 이동 ───────────────────────────────────────────────
  // 끝에서 끝(4칸, A안) = 250 + 2×120 = 490ms.
  // moveCooldownMs가 "경로 판단"의 실질 난이도를 결정한다 — 탭·홀드·키보드 공통 게이트.
  // 줄이면 회피가 쉬워져 단순 받기 게임에 가까워지고, 늘리면 판단 비중이 커진다.
  movement: {
    snapTiltMs: 90,          // 제자리 기울기 연출 길이. 위치 보간 아님(불변식: 시각=논리)
    moveCooldownMs: 120,     // 탭 연타로 우회 불가
    holdInitialDelayMs: 250,
    holdRepeatMs: 120,
  },

  // ── HP ─────────────────────────────────────────────────
  hp: {
    max: 3,
    invulnerableSec: 0.8,    // 데미지만 무효 · 정답 획득은 정상 · 무적 중 콤보 정지
    healOnLevelUp: 0,        // Lv19 이후 난이도가 정적이라 회복이 있으면 세션이 안 끝난다
    missPenaltyHp: 0,        // 놓침에 HP는 깎지 않는다 — 레인이 5개라 원래 다 받을 수 없다
    missResetsCombo: true,   // 대신 콤보가 끊긴다. HP는 오답 전용, 놓침은 점수 손해로 성격 분리
  },

  // ── 점수 ───────────────────────────────────────────────
  scoring: {
    correctCatch: 10,
    recipeCompletePerItem: 50,
    comboStep: 3,        // 정답 3개마다 +0.5. 5개였을 때는 ×3.0에 20개 연속이 필요해 사실상 도달 불가였다
    comboIncrement: 0.5,
    comboMax: 2.5,       // 정답 9개면 최대치 — 실제로 닿을 수 있는 목표
  },

  // ── 레시피 / 제한시간 ──────────────────────────────────
  // 제한시간은 "정상 플레이에서는 거의 안 걸리고, 의도적으로 안 받을 때만 걸리는" 수준.
  // 상시 압박이 되면 '피하는 판단'이라는 이 게임의 핵심 재미가 죽는다.
  //   Lv1(길이2) = 2 × 8.0 = 16.0s
  //   Lv4(길이3) = 3 × 7.1 = 21.3s
  //   Lv7(길이5) = 5 × 6.2 = 31.0s
  // 주의: recipeLength가 뛰는 레벨(3·5·7)마다 총 시간이 점프했다가
  //       다음 레벨에 줄어드는 톱니 곡선이 된다. 단조 압박은 '항목당 시간'이 담당한다.
  recipe: {
    // 제한시간은 고정 30초다. 역산식(«최소소요 + 여유»)은 스폰이 운 나쁘게 몰릴 때
    // "정답이 안 나와서 지는" 판을 만들었다 — 실력이 아니라 난수가 정하는 패배였다.
    // 30초는 최소소요(5.4~6.3초)의 5배라 정상 플레이에서는 걸리지 않고,
    // 안 받고 버티는 회피 플레이만 막는다. 난이도는 낙하 속도가 담당한다.
    limitSec: 30,
    warnRatio: 0.2,
    warnSecondsMax: 5.0,
    expirePenaltyHp: 1,
    noRepeatWindow: 1,
  },

  // ── 스포너 ─────────────────────────────────────────────
  spawner: {
    // ★ 회피 가능성 보장의 핵심 — 항상 빈 레인 2개를 남긴다.
    // 밀도(maxOnScreen이 아니라 spawnIntervalSec)가 올라가도 시차만 있으면 순서대로 피할 수 있다.
    // 지터가 있어야 뭉치는 구간이 생기고 이 상한이 실제로 발동한다 (Lv6부터 발동 확인).
    simultaneousCrossLimit: 3,   // = lane.count - 2
    crossWindowSec: 0.4,         // ±0.4s → 윈도우 폭 0.8s
    spawnJitterRatio: 0.35,
    sameLaneMinGapPx: 175,       // 낙하거리 500px의 35%
    starvationSec: 4.0,
    reachabilityCheck: true,
    baseFallSpeedPxPerSec: 200,  // 배율 1.0에서 500px 낙하 = 2.5초
    // ↑ 처음 167(3.0초) → 250(2.0초)로 올렸다가 "Lv1치고 빠르다"는 판단으로 200으로 내렸다.
    //   3.0초로 두면 3개짜리 레시피에서 낙하시간만으로 제한시간의 1/3을 먹어 10초대가 안 나온다.
    rulePriority: ['crossLimit', 'laneGap', 'starvation', 'reachability'],
  },

  // ── 레벨업 ─────────────────────────────────────────────
  levelUp: {
    recipesPerLevel: 5,
    // ⚠️ 12(레벨당 약 74초, "레벨당 1~2분")로 뒀다가 5로 내렸다.
    //    HP 3은 실패 3번이면 끝이므로, Lv7까지 72개를 채우려면 레시피 성공률 96%가 필요하다 —
    //    사실상 아무도 Lv4 이상을 보지 못한다. 5개면 필요 성공률 90%, Lv7까지 약 2.7분이다.
    //    "레벨당 1~2분"과 "HP 3으로 Lv7 도달"은 동시에 성립하지 않는다 (§14-5).
    bannerDurationSec: 1.5,
  },

  // ── 레벨별 난이도 (다섯 축) ────────────────────────────
  // correctSpawnRatio ↓ = '오답 밀도' 축
  // spawnIntervalSec ↓  = '체감 밀도' 축  (★ 속도보다 빠르게 줄여야 밀도가 실제로 오른다)
  // obstacleDropRate ↑  = '방해물' 축
  // fallSpeedMultiplier ↑ = '속도' 축
  // maxOnScreen은 난이도 축이 아니라 안전 상한이다 (자연 밀도보다 넉넉히 위).
  //
  // 결과 밀도(= 낙하시간 / 스폰간격): Lv1 2.00 → Lv7 3.99 → Lv19 4.70
  levels: [
    // ★ 난이도 축을 '개수'에서 '속도'로 옮겼다.
    //   레인이 5개라 화면에 몇 개가 더 떠도 피할 자리가 남는다 — 밀도는 난이도로 잘 안 바뀐다.
    //   그래서 밀도(= 낙하시간 ÷ 스폰간격)는 **2.80으로 고정**하고, 낙하 속도만 크게 올린다.
    //
    //   체감을 만드는 값은 '끝에서 끝까지 피하고 남는 시간' = 낙하시간 − 4칸×moveCooldownMs:
    //     Lv1 2.02초  →  Lv4 0.97초  →  Lv7 0.47초
    //   낙하시간 자체는 2.50초 → 0.95초 (이전 표 대비 Lv7에서 37% 빠르다).
    { level: 1, recipeLength: 3, correctSpawnRatio: 0.70, spawnIntervalSec: 0.89, maxOnScreen: 6, obstacleDropRate: 0.00, fallSpeedMultiplier: 1.00 },
    { level: 2, recipeLength: 3, correctSpawnRatio: 0.64, spawnIntervalSec: 0.73, maxOnScreen: 6, obstacleDropRate: 0.00, fallSpeedMultiplier: 1.22 },
    { level: 3, recipeLength: 4, correctSpawnRatio: 0.58, spawnIntervalSec: 0.61, maxOnScreen: 6, obstacleDropRate: 0.06, fallSpeedMultiplier: 1.46 },
    { level: 4, recipeLength: 4, correctSpawnRatio: 0.53, spawnIntervalSec: 0.52, maxOnScreen: 7, obstacleDropRate: 0.09, fallSpeedMultiplier: 1.72 },
    { level: 5, recipeLength: 5, correctSpawnRatio: 0.49, spawnIntervalSec: 0.45, maxOnScreen: 7, obstacleDropRate: 0.12, fallSpeedMultiplier: 2.00 },
    { level: 6, recipeLength: 5, correctSpawnRatio: 0.45, spawnIntervalSec: 0.39, maxOnScreen: 7, obstacleDropRate: 0.15, fallSpeedMultiplier: 2.30 },
    { level: 7, recipeLength: 6, correctSpawnRatio: 0.42, spawnIntervalSec: 0.34, maxOnScreen: 8, obstacleDropRate: 0.18, fallSpeedMultiplier: 2.63 },
  ],

  // ── 8레벨 이후 무한 진행 ───────────────────────────────
  endless: {
    fromLevel: 8,
    recipeLength: 6,
    maxOnScreen: 9,
    correctSpawnRatioDeltaPerLevel: -0.01,
    correctSpawnRatioMin: 0.30,
    spawnIntervalDeltaPerLevel: -0.006,
    spawnIntervalMinSec: 0.27,    // 스포너 상한(0.267초)에 붙어 있다. 더 내려도 발동하지 않는다.
    // ⚠️ 그래서 Lv8 이후 밀도는 오히려 조금씩 내려간다(4.63 → 4.36) — 간격은 하한에 묶인 채
    //    낙하만 빨라져 화면 체류 시간이 줄기 때문이다. 회피 가능성 보장(빈 레인 2개)이
    //    간격의 하한을 정하므로 이건 맞바꿀 수 없다. 무한 구간의 난이도는 밀도가 아니라
    //    **속도 · 오답비율 · 방해물** 세 축이 담당한다.
    obstacleDropRateDeltaPerLevel: 0.01,
    obstacleDropRateMax: 0.26,
    fallSpeedDeltaPerLevel: 0.10,
    fallSpeedMax: 3.85,  // 낙하 0.65초 — 4칸 이동(0.48초) + 반응에 겨우 남는 수준이 상한이다
  },
}
