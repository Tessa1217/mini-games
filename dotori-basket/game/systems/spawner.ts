import type { ItemDef } from '../types'
import { BALANCE } from '../config'
import { activeFruits, unlockedObstacles } from '../config/items'
import { tuningForLevel } from '../tuning'

/** 낙하 중인 아이템 하나 */
export interface Falling {
  def: ItemDef
  lane: number
  y: number
  /** 판정선을 통과할 예정 시각(ms) */
  crossAt: number
}

export interface SpawnContext {
  level: number
  nowMs: number
  live: readonly Falling[]
  /** 현재 받아야 할 과일 */
  target: ItemDef
  playerLane: number
  /** 마지막으로 정답이 스폰된 시각(ms) */
  lastCorrectSpawnMs: number
  spawnY: number
  rand?: () => number
}

export type SpawnResult =
  | { ok: true; def: ItemDef; lane: number; crossAt: number; isCorrect: boolean }
  | { ok: false; reason: 'maxOnScreen' | 'crossLimit' | 'noLane' }

export function fallSpeedPxPerSec(level: number): number {
  return BALANCE.spawner.baseFallSpeedPxPerSec * tuningForLevel(level).fallSpeedMultiplier
}

/**
 * ⭐ 동시 통과 상한 — "화면에 몇 개 떠 있나"가 아니라 "같은 시간대에 판정선을 지나는 수"다.
 * 시차만 있으면 화면이 빽빽해도 순서대로 피할 수 있다. 이건 *언제* 스폰할지를 막는다.
 */
function crossLimitOk(live: readonly Falling[], crossAt: number): boolean {
  const windowMs = BALANCE.spawner.crossWindowSec * 1000
  const n = live.filter((o) => Math.abs(o.crossAt - crossAt) <= windowMs).length
  return n < BALANCE.spawner.simultaneousCrossLimit
}

/** 같은 레인의 직전 아이템이 충분히 내려갔는지 — *어디에* 스폰할지를 막는다 */
function laneGapOk(live: readonly Falling[], lane: number, spawnY: number): boolean {
  return !live.some(
    (o) => o.lane === lane && o.y - spawnY < BALANCE.spawner.sameLaneMinGapPx,
  )
}

/** 낙하 시간 안에 그 레인까지 갈 수 있는지 (정답에만 적용한다) */
function reachable(lane: number, playerLane: number, fallSec: number): boolean {
  if (!BALANCE.spawner.reachabilityCheck) return true
  const moves = Math.floor((fallSec * 1000) / BALANCE.movement.moveCooldownMs)
  return Math.abs(lane - playerLane) <= moves
}

/**
 * 무엇을 떨어뜨릴지 고른다. **카테고리를 1회 다항 추첨**한다 —
 * 순차로 뽑으면 두 번째 이후 확률이 조건부가 되어 설정값과 어긋난다.
 */
function pickDef(ctx: SpawnContext, rand: () => number): { def: ItemDef; isCorrect: boolean } {
  const t = tuningForLevel(ctx.level)
  const starving =
    (ctx.nowMs - ctx.lastCorrectSpawnMs) / 1000 >= BALANCE.spawner.starvationSec
  if (starving) return { def: ctx.target, isCorrect: true }

  const obstacles = unlockedObstacles(ctx.level)
  const r = rand()
  if (r < t.obstacleDropRate && obstacles.length > 0) {
    return { def: obstacles[Math.floor(rand() * obstacles.length)]!, isCorrect: false }
  }
  if (r < t.obstacleDropRate + t.correctSpawnRatio) {
    return { def: ctx.target, isCorrect: true }
  }
  const others = activeFruits(ctx.level).filter((f) => f.id !== ctx.target.id)
  if (others.length === 0) return { def: ctx.target, isCorrect: true }
  return { def: others[Math.floor(rand() * others.length)]!, isCorrect: false }
}

/** 규칙 우선순위: crossLimit → laneGap → starvation → reachability */
export function planSpawn(ctx: SpawnContext): SpawnResult {
  const rand = ctx.rand ?? Math.random
  const t = tuningForLevel(ctx.level)
  if (ctx.live.length >= t.maxOnScreen) return { ok: false, reason: 'maxOnScreen' }

  const speed = fallSpeedPxPerSec(ctx.level)
  const fallSec = (BALANCE.lane.catchLineY - ctx.spawnY) / speed
  const crossAt = ctx.nowMs + fallSec * 1000
  if (!crossLimitOk(ctx.live, crossAt)) return { ok: false, reason: 'crossLimit' }

  const { def, isCorrect } = pickDef(ctx, rand)

  let lanes: number[] = []
  for (let i = 0; i < BALANCE.lane.count; i++) {
    if (!laneGapOk(ctx.live, i, ctx.spawnY)) continue
    if (isCorrect && !reachable(i, ctx.playerLane, fallSec)) continue
    lanes.push(i)
  }
  // 도달 가능한 레인이 없으면 간격 조건만 본다 — 규칙을 어기지 않고 스폰을 살린다
  if (lanes.length === 0 && isCorrect) {
    for (let i = 0; i < BALANCE.lane.count; i++) {
      if (laneGapOk(ctx.live, i, ctx.spawnY)) lanes.push(i)
    }
  }
  if (lanes.length === 0) return { ok: false, reason: 'noLane' }

  return { ok: true, def, lane: lanes[Math.floor(rand() * lanes.length)]!, crossAt, isCorrect }
}

/** 다음 스폰까지의 간격(초). 지터가 없으면 동시 통과 상한이 죽은 가드가 된다. */
export function nextSpawnDelaySec(level: number, rand: () => number = Math.random): number {
  const { spawnIntervalSec } = tuningForLevel(level)
  const j = BALANCE.spawner.spawnJitterRatio
  return spawnIntervalSec * (1 + (rand() * 2 - 1) * j)
}
