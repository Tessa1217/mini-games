import type { RecipeConfig } from '../types'

/** 근거: docs/rules/recipe.md */
export const recipe = {
  limitSec: 30,            // 고정값. 역산하면 스폰 난수가 패배를 결정한다
  warnRatio: 0.2,
  warnSecondsMax: 5.0,
  expirePenaltyHp: 1,
  noRepeatWindow: 1,
} satisfies RecipeConfig
