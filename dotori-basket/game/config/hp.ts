import type { HpConfig } from '../types'

/** 근거: docs/rules/hp-score.md */
export const hp = {
  max: 3,
  invulnerableSec: 0.8,
  healOnLevelUp: 0,        // 의도된 0 — 회복이 있으면 숙련자 세션이 안 끝난다
  missPenaltyHp: 0,        // 의도된 0 — 놓침은 HP가 아니라 콤보로 갚는다
  missResetsCombo: true,
} satisfies HpConfig
