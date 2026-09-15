import { BALANCE } from './balance'
import type { LevelTuning } from '../types'

/** 레벨 오름차순 정렬본. 테이블 작성 순서에 의존하지 않기 위해 모듈 로드 시 1회 정렬한다 */
const LEVELS: readonly LevelTuning[] = [...BALANCE.levels].sort(
  (a, b) => a.level - b.level,
)

if (LEVELS.length === 0) {
  throw new Error('BALANCE.levels가 비어 있다 — 최소 1개 레벨이 필요하다')
}

/**
 * 레벨 번호를 실제 난이도 수치로 변환한다.
 * 테이블에 정의된 레벨은 그대로, endless.fromLevel 이상은 외삽한다.
 * 시스템 코드는 항상 이 함수만 호출하고 BALANCE.levels를 직접 읽지 않는다.
 *
 * 반환은 항상 **복사본**이다 — 호출자가 변형해도 BALANCE가 오염되지 않는다.
 */
export function tuningForLevel(level: number): LevelTuning {
  const wanted = normalizeLevel(level)
  const { endless } = BALANCE

  const exact = LEVELS.find((entry) => entry.level === wanted)
  if (exact) return { ...exact, level: wanted }

  if (wanted >= endless.fromLevel) {
    // endless 구간 — fromLevel 직전 레벨을 기준점으로 외삽
    const baseLevel = endless.fromLevel - 1
    return {
      ...extrapolate(nearestAtOrBelow(baseLevel), wanted - baseLevel),
      level: wanted,
    }
  }

  // 테이블에 구멍이 있는 경우(튜너가 행을 지웠을 때).
  // Lv1으로 무음 폴백하면 "레벨 3이 왜 이렇게 쉽지?"를 추적할 수 없으므로
  // 가장 가까운 하위 레벨을 쓴다.
  return { ...nearestAtOrBelow(wanted), level: wanted }
}

/**
 * 현재 레벨의 레시피 제한시간(초).
 *
 * 고정 상수가 아니라 **완주에 실제로 걸리는 시간 + 여유**로 역산한다.
 * 이래야 스폰 간격·정답비율·낙하속도를 손댈 때 타이머가 따라 움직인다.
 */
export function recipeTimeLimitSec(_level: number): number {
  return BALANCE.recipe.limitSec
}

/** 정답 과일 하나가 나오는 평균 간격(초) */
export function correctGapSec(level: number): number {
  const t = tuningForLevel(level)
  return t.spawnIntervalSec / t.correctSpawnRatio
}

/**
 * 레시피 하나를 끝내는 데 필요한 **최소 시간(초)**.
 * 정답 과일이 평균 간격으로 나온다고 볼 때의 값이며, 마지막 하나가 판정선까지
 * 내려오는 시간을 포함한다. 운이 나쁘면 이보다 길어진다 — 그 차이를 흡수하는 게 slack이다.
 */
export function recipeMinCompletionSec(level: number): number {
  const t = tuningForLevel(level)
  const { spawner, lane } = BALANCE
  const fallSec = lane.catchLineY / (spawner.baseFallSpeedPxPerSec * t.fallSpeedMultiplier)
  return t.recipeLength * correctGapSec(level) + fallSec
}

// ── 내부 ────────────────────────────────────────────────

/** 레벨은 1 이상의 정수로 정규화한다 (0·음수·소수·NaN 방어) */
function normalizeLevel(level: number): number {
  if (!Number.isFinite(level)) return LEVELS[0].level
  return Math.max(1, Math.floor(level))
}

function nearestAtOrBelow(level: number): LevelTuning {
  let found = LEVELS[0]
  for (const entry of LEVELS) {
    if (entry.level > level) break
    found = entry
  }
  return found
}

function extrapolate(base: LevelTuning, steps: number): LevelTuning {
  const { endless } = BALANCE
  return {
    level: base.level + steps,
    recipeLength: endless.recipeLength,
    maxOnScreen: endless.maxOnScreen,
    correctSpawnRatio: clamp(
      base.correctSpawnRatio + endless.correctSpawnRatioDeltaPerLevel * steps,
      endless.correctSpawnRatioMin,
      1,
    ),
    spawnIntervalSec: Math.max(
      endless.spawnIntervalMinSec,
      base.spawnIntervalSec + endless.spawnIntervalDeltaPerLevel * steps,
    ),
    obstacleDropRate: clamp(
      base.obstacleDropRate + endless.obstacleDropRateDeltaPerLevel * steps,
      0,
      endless.obstacleDropRateMax,
    ),
    fallSpeedMultiplier: clamp(
      base.fallSpeedMultiplier + endless.fallSpeedDeltaPerLevel * steps,
      0,
      endless.fallSpeedMax,
    ),
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
