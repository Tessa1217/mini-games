import type { CrowConfig } from '../types'

/**
 * 근거: docs/rules/obstacles.md
 *
 * ⚠️ `BalanceConfig` 의 멤버가 아니다 — 9키 고정이라 `items` 처럼 별도 export 다.
 */
export const crow = {
  /** 컴포넌트에서 조립하지 않는다 — 하드코딩 목록이 액박을 냈던 적이 있다 */
  sprite: '/assets/scene/crow.svg',
  fromLevel: 8,
  intervalSec: 14,
  intervalJitterSec: 4,
  warningSec: 1.0,         // ★ 예고가 없으면 플레이어가 할 수 있는 게 없는 순수 RNG 손실이다
  flySec: 0.9,
  eatCount: 1,
  eatCountFromLevel: 12,
  eatCountMax: 2,
} satisfies CrowConfig
