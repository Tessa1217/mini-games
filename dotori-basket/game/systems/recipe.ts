import type { ItemDef } from '../types'
import { BALANCE } from '../config'
import { activeFruits } from '../config/items'
import { tuningForLevel } from '../tuning'

/** 레시피 한 벌을 만든다. 직전 `noRepeatWindow`개와 같은 과일은 피한다. */
export function createRecipe(level: number, rand: () => number = Math.random): ItemDef[] {
  const { recipeLength } = tuningForLevel(level)
  const pool = activeFruits(level)
  if (pool.length === 0) throw new Error('활성 과일 풀이 비어 있다')

  const out: ItemDef[] = []
  const window = BALANCE.recipe.noRepeatWindow
  for (let i = 0; i < recipeLength; i++) {
    const banned = new Set(out.slice(Math.max(0, i - window)).map((f) => f.id))
    const allowed = pool.filter((f) => !banned.has(f.id))
    const from = allowed.length > 0 ? allowed : pool
    out.push(from[Math.floor(rand() * from.length)]!)
  }
  return out
}

/** 레시피 제한시간(초). 고정값이다 — 역산하면 스폰 난수가 패배를 결정한다. */
export function recipeTimeLimitSec(): number {
  return BALANCE.recipe.limitSec
}

/** 잔여 시간이 경고 상태인지 */
export function isWarning(remainSec: number, totalSec: number): boolean {
  const { warnRatio, warnSecondsMax } = BALANCE.recipe
  return remainSec / totalSec <= warnRatio || remainSec <= warnSecondsMax
}
