import type { HpConfig } from '../types'

/** 근거: docs/rules/hp-score.md */
export const hp = {
  max: 5,                  // 돌멩이가 2칸을 먹는다 — 3이면 두 번에 죽어 허용 실수가 너무 줄어든다
  invulnerableSec: 0.8,
  healOnLevelUp: 0,        // 의도된 0 — 회복이 있으면 숙련자 세션이 안 끝난다
  missPenaltyHp: 0,        // 의도된 0 — 놓침은 HP가 아니라 콤보로 갚는다
  missResetsCombo: true,
  wrongCatchHp: 1,
} satisfies HpConfig
