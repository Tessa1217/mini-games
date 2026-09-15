import type { ItemDef } from '../types'
import { BALANCE } from '../config'
import { ITEMS } from '../config/items'

/** 이 레벨에서 새로 열리는 것 — 해금 카드에 띄운다 */
export function newlyUnlocked(level: number): ItemDef[] {
  return Object.values(ITEMS).filter((i) => i.unlockLevel === level)
}

/** 레시피를 몇 개 더 완성해야 다음 레벨인지 */
export function recipesUntilNextLevel(recipesDoneInLevel: number): number {
  return Math.max(0, BALANCE.levelUp.recipesPerLevel - recipesDoneInLevel)
}

export function shouldLevelUp(recipesDoneInLevel: number): boolean {
  return recipesDoneInLevel >= BALANCE.levelUp.recipesPerLevel
}
