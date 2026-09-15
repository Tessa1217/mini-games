import { BALANCE } from '../config'

/** 연속 정답 수에 대응하는 점수 배율 */
export function comboMultiplier(combo: number): number {
  const { comboStep, comboIncrement, comboMax } = BALANCE.scoring
  return Math.min(comboMax, 1 + Math.floor(combo / comboStep) * comboIncrement)
}

/** 정답 1개 획득 점수 */
export function catchScore(combo: number): number {
  return Math.round(BALANCE.scoring.correctCatch * comboMultiplier(combo))
}

/** 레시피 완성 보너스 */
export function completionBonus(recipeLength: number): number {
  return BALANCE.scoring.recipeCompletePerItem * recipeLength
}
