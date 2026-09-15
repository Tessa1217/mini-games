import type { EndlessTuning } from '../types'

/** 근거: docs/history/rev7-speed.md */
export const endless = {
  fromLevel: 8,
  recipeLength: 6,
  maxOnScreen: 9,
  correctSpawnRatioDeltaPerLevel: -0.01,
  correctSpawnRatioMin: 0.30,
  spawnIntervalDeltaPerLevel: -0.006,
  spawnIntervalMinSec: 0.27,   // 스포너 하한 0.267초에 붙어 있다. 더 내려도 발동하지 않는다
  obstacleDropRateDeltaPerLevel: 0.01,
  obstacleDropRateMax: 0.26,
  fallSpeedDeltaPerLevel: 0.10,
  fallSpeedMax: 3.85,          // 낙하 0.65초 — 4칸 이동 0.48초 + 반응에 겨우 남는 수준이 상한
} satisfies EndlessTuning
