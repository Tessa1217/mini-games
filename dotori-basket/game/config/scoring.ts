import type { ScoringConfig } from '../types'

/** 근거: docs/rules/hp-score.md */
export const scoring = {
  correctCatch: 10,
  recipeCompletePerItem: 50,
  comboStep: 3,
  comboIncrement: 0.5,
  comboMax: 2.5,           // = 1 + (comboStep 3개마다 0.5) × 3단계 → 정답 9개에 최대치
} satisfies ScoringConfig
