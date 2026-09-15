import type { LevelUpConfig } from '../types'

/** 근거: docs/history/rev6-levelup.md */
export const levelUp = {
  recipesPerLevel: 5,      // 12는 Lv7 도달에 레시피 성공률 96%를 요구해 아무도 못 본다
  bannerDurationSec: 1.5,
} satisfies LevelUpConfig
