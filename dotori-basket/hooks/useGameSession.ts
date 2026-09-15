'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { ItemDef } from '@/game/types'
import { BALANCE } from '@/game/config'
import { createRecipe, recipeTimeLimitSec } from '@/game/systems/recipe'
import { catchScore, completionBonus, comboMultiplier } from '@/game/systems/scoring'
import { initialHp, applyDamage, isDead, type HpState } from '@/game/systems/hp'
import { shouldLevelUp, newlyUnlocked } from '@/game/systems/level'
import { loadBest, saveBest } from '@/storage/highScore'
import { clampLane } from '@/components/stage/geometry'

/** ★ 매 프레임 바뀌는 값. state 에 두면 60fps 리렌더가 된다 — arch/stack.md */
export interface MutableState {
  lane: number
  tilt: number
  hp: HpState
  score: number
  combo: number
  level: number
  recipe: ItemDef[]
  idx: number
  recipesInLevel: number
  timeLeft: number
  timeMax: number
  spawnIn: number
  lastCorrectSpawnMs: number
}

const fresh = (now: number): MutableState => ({
  lane: 2, tilt: 0, hp: initialHp(), score: 0, combo: 0, level: 1,
  recipe: [], idx: 0, recipesInLevel: 0, timeLeft: 0, timeMax: 1,
  spawnIn: 0.6,
  lastCorrectSpawnMs: now,   // ★ 0 을 넣으면 기아 방지가 즉시 참이 되어 첫 스폰이 항상 정답
})

/**
 * 한 판의 상태. **규칙 계산은 전부 `game/systems/` 가 한다** — 여기는 보관과 동기화만.
 * 화면 전환이 필요한 순간(해금·게임오버)은 콜백으로 밖에 넘긴다.
 */
export function useGameSession(on: {
  onUnlock: (level: number, items: ItemDef[]) => void
  onGameOver: () => void
}) {
  const onRef = useRef(on)
  onRef.current = on

  const state = useRef<MutableState>(fresh(0))
  const [hud, setHud] = useState({ hp: BALANCE.hp.max, score: 0, level: 1, combo: 1 })
  const [recipe, setRecipe] = useState<{ items: ItemDef[]; idx: number }>({ items: [], idx: 0 })
  const [best, setBest] = useState(0)

  const syncHud = useCallback(() => {
    const c = state.current
    setHud({ hp: c.hp.hp, score: c.score, level: c.level, combo: comboMultiplier(c.combo) })
  }, [])

  const syncRecipe = useCallback(() => {
    setRecipe({ items: state.current.recipe, idx: state.current.idx })
  }, [])

  const newRecipe = useCallback((now: number) => {
    const c = state.current
    c.recipe = createRecipe(c.level)
    c.idx = 0
    c.timeMax = recipeTimeLimitSec()
    c.timeLeft = c.timeMax
    c.lastCorrectSpawnMs = now
    syncRecipe()
  }, [syncRecipe])

  const endGame = useCallback(() => {
    const score = state.current.score
    const prev = loadBest()
    if (score > prev) { saveBest(score); setBest(score) } else setBest(prev)
    onRef.current.onGameOver()
  }, [])

  const reset = useCallback(() => {
    const now = performance.now()
    state.current = fresh(now)
    newRecipe(now)
    syncHud()
  }, [newRecipe, syncHud])

  const move = useCallback((dir: -1 | 0 | 1) => {
    const c = state.current
    const next = clampLane(c.lane + dir)
    if (next !== c.lane) { c.lane = next; c.tilt = dir }
  }, [])

  /** 정답 획득. ★ 레벨업이 먼저다 — 새 레시피가 새 레벨 기준으로 나와야 한다 */
  const caught = useCallback((def: ItemDef, now: number) => {
    const c = state.current
    const target = c.recipe[c.idx]
    const correct = def.kind === 'fruit' && target && def.id === target.id

    if (!correct) {
      const before = c.hp.hp
      c.hp = applyDamage(c.hp, 1, now)
      if (c.hp.hp !== before) c.combo = 0
      syncHud()
      if (isDead(c.hp)) endGame()
      return
    }

    c.combo += 1
    c.score += catchScore(c.combo)
    c.idx += 1

    if (c.idx < c.recipe.length) {
      syncRecipe()
      syncHud()
      return
    }

    c.score += completionBonus(c.recipe.length)
    c.recipesInLevel += 1
    let leveled = false
    if (shouldLevelUp(c.recipesInLevel)) { c.level += 1; c.recipesInLevel = 0; leveled = true }
    newRecipe(now)
    syncHud()
    if (!leveled) return

    const unlocked = newlyUnlocked(c.level)
    if (unlocked.length > 0) onRef.current.onUnlock(c.level, unlocked)
  }, [endGame, newRecipe, syncHud, syncRecipe])

  /** 정답을 놓쳐 지나갔다 */
  const missed = useCallback((def: ItemDef) => {
    const c = state.current
    const target = c.recipe[c.idx]
    if (!target || def.id !== target.id) return
    if (!BALANCE.hp.missResetsCombo || c.combo === 0) return
    c.combo = 0
    syncHud()
  }, [syncHud])

  /** 제한시간 소진 — 목숨이 깎이고 같은 레벨에서 레시피만 새로 나온다 */
  const timedOut = useCallback((now: number) => {
    const c = state.current
    c.hp = applyDamage(c.hp, BALANCE.recipe.expirePenaltyHp, now)
    c.combo = 0
    syncHud()
    if (isDead(c.hp)) { endGame(); return }
    newRecipe(now)
  }, [endGame, newRecipe, syncHud])

  /** 디버그 전용 — 레벨업까지 손으로 가는 비용이 커서 둔다 */
  const jumpToLevel = useCallback((level: number) => {
    const c = state.current
    c.level = level
    c.recipesInLevel = 0
    newRecipe(performance.now())
    syncHud()
    return newlyUnlocked(level)
  }, [newRecipe, syncHud])

  const readBest = useCallback(() => setBest(loadBest()), [])

  return useMemo(() => ({
    state, hud, recipe, best,
    reset, move, caught, missed, timedOut, jumpToLevel, readBest,
  }), [hud, recipe, best, reset, move, caught, missed, timedOut, jumpToLevel, readBest])
}

export type GameSession = ReturnType<typeof useGameSession>
