import type { SpawnerConfig } from '../types'
import { lane } from './lane'

/** 근거: docs/rules/spawner.md · docs/history/rev6-derived.md */
export const spawner = {
  simultaneousCrossLimit: lane.count - 2,   // ★ 파생 — 항상 빈 레인 2개를 남긴다
  crossWindowSec: 0.4,
  spawnJitterRatio: 0.35,
  sameLaneMinGapPx: 175,
  starvationSec: 4.0,
  reachabilityCheck: true,
  baseFallSpeedPxPerSec: 200,               // 배율 1.0에서 500px 낙하 = 2.5초
  rulePriority: ['crossLimit', 'laneGap', 'starvation', 'reachability'],
} satisfies SpawnerConfig
