'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { BALANCE } from '@/game/config'
import { createLoop } from '@/game/engine/loop'
import { createPool, type Pooled } from '@/game/engine/pool'
import { type Falling, planSpawn, nextSpawnDelaySec, fallSpeedPxPerSec } from '@/game/systems/spawner'
import { isWarning } from '@/game/systems/recipe'
import { onHidden } from '@/platform/visibility'
import { createFallingNode, paintFallingSprite, moveFalling } from '@/components/stage/fallingNode'
import { paintTimer } from '@/components/recipe/timerNode'
import { CROSS_Y, DESPAWN_Y, LANE_W, SPAWN_Y, squirrelX } from '@/components/stage/geometry'
import type { GameSession, MutableState } from './useGameSession'
import type { PhaseControl } from './usePhase'
import type { GameInput } from '@/input/useGameInput'

const TILT_DEG = 11
const BLINK_MS = 90
const RETRY_SEC = 0.08        // 스폰 규칙에 막혔을 때의 짧은 재시도

/** ★ 시각 위치 === 논리 위치. 보간하지 않는다 — rules/lane.md */
function paintSquirrel(el: HTMLElement, c: MutableState, dt: number, now: number) {
  const rot = c.tilt * TILT_DEG
  c.tilt *= Math.max(0, 1 - dt * (1000 / BALANCE.movement.snapTiltMs) / 10)
  const blinking = now < c.hp.invulnerableUntil && Math.floor(now / BLINK_MS) % 2
  el.style.opacity = blinking ? '0.35' : '1'
  el.style.transform = `translate3d(${squirrelX(c.lane)}px,0,0) rotate(${rot.toFixed(2)}deg)`
}

function trySpawn(c: MutableState, pool: ReturnType<typeof createPool<Falling>>, now: number) {
  const target = c.recipe[c.idx]
  if (!target) return
  const r = planSpawn({
    level: c.level, nowMs: now, live: pool.live.map((p) => p.data),
    target, playerLane: c.lane, lastCorrectSpawnMs: c.lastCorrectSpawnMs, spawnY: SPAWN_Y,
  })
  if (!r.ok) { c.spawnIn = RETRY_SEC; return }

  const item = pool.acquire({ def: r.def, lane: r.lane, y: SPAWN_Y, crossAt: r.crossAt })
  paintFallingSprite(item.el, r.def)
  moveFalling(item.el, r.lane, SPAWN_Y)
  if (r.isCorrect) c.lastCorrectSpawnMs = now
  c.spawnIn = nextSpawnDelaySec(c.level)
}

/** 낙하 + 통과 판정. 판정은 **y 임계선을 지나는 순간**에만 일어난다 */
function stepFalling(
  c: MutableState,
  pool: ReturnType<typeof createPool<Falling>>,
  session: GameSession,
  dt: number,
  now: number,
) {
  const v = fallSpeedPxPerSec(c.level)
  for (const item of pool.live.slice() as Pooled<Falling>[]) {
    const f = item.data
    const prevY = f.y
    f.y += v * dt
    moveFalling(item.el, f.lane, f.y)

    if (prevY <= CROSS_Y && f.y > CROSS_Y) {
      if (f.lane === c.lane) {
        session.caught(f.def, now)
        pool.release(item)
        continue
      }
      session.missed(f.def)
    }
    if (f.y > DESPAWN_Y) pool.release(item)
  }
}

/**
 * 매 프레임 무엇을 하나. 루프가 만지는 DOM 의 ref 를 여기서 만들어 내준다 —
 * **소유자를 한 곳에 모아야** 누가 DOM 을 직접 쓰는지 추적된다.
 *
 * ⚠️ effect 의존성은 **빈 배열이다.** 매 렌더 바뀌는 값은 ref 로 넘긴다 —
 * 콜백을 의존성에 넣었다가 HUD 갱신마다 루프가 재생성돼 아이템 풀이 비워진 적이 있다.
 */
export function useGameLoop(deps: { session: GameSession; input: GameInput; phase: PhaseControl }) {
  const live = useRef(deps)
  live.current = deps

  const items = useRef<HTMLDivElement>(null)
  const laneHighlight = useRef<HTMLDivElement>(null)
  const squirrel = useRef<HTMLDivElement>(null)
  const timer = useRef<HTMLDivElement>(null)
  const timerFill = useRef<HTMLElement>(null)
  const clear = useRef<() => void>(() => {})

  useEffect(() => {
    const layer = items.current
    if (!layer) return
    const pool = createPool<Falling>(layer, createFallingNode)

    const step = (dt: number, now: number) => {
      const { session, input, phase } = live.current
      const c = session.state.current
      input.pump(now)

      if (squirrel.current) paintSquirrel(squirrel.current, c, dt, now)
      if (laneHighlight.current) {
        laneHighlight.current.style.transform = `translate3d(${c.lane * LANE_W}px,0,0)`
      }
      if (phase.ref.current !== 'playing') return

      c.timeLeft -= dt
      paintTimer(timer.current, timerFill.current,
        Math.max(0, c.timeLeft / c.timeMax), isWarning(c.timeLeft, c.timeMax))
      if (c.timeLeft <= 0) { session.timedOut(now); return }

      c.spawnIn -= dt
      if (c.spawnIn <= 0) trySpawn(c, pool, now)

      stepFalling(c, pool, session, dt, now)
    }

    clear.current = () => pool.clear()
    const loop = createLoop(step)
    loop.start()
    const off = onHidden(() => live.current.phase.pauseIfPlaying())

    return () => { loop.stop(); off(); pool.clear() }
  }, [])

  /** 다시하기 — 남아 있던 낙하물이 새 판으로 따라오면 안 된다 */
  const clearItems = useCallback(() => clear.current(), [])

  return useMemo(
    () => ({ items, laneHighlight, squirrel, timer, timerFill, clearItems }),
    [clearItems],
  )
}
