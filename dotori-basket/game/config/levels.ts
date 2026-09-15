import type { LevelTuning } from '../types'

/** 근거: docs/rules/levels.md · docs/history/rev7-speed.md */
export const levels: LevelTuning[] = [
  { level: 1, recipeLength: 3, correctSpawnRatio: 0.70, spawnIntervalSec: 0.89, maxOnScreen: 6, obstacleDropRate: 0.00, fallSpeedMultiplier: 1.00 },
  { level: 2, recipeLength: 3, correctSpawnRatio: 0.64, spawnIntervalSec: 0.73, maxOnScreen: 6, obstacleDropRate: 0.00, fallSpeedMultiplier: 1.22 },
  { level: 3, recipeLength: 4, correctSpawnRatio: 0.58, spawnIntervalSec: 0.61, maxOnScreen: 6, obstacleDropRate: 0.06, fallSpeedMultiplier: 1.46 },
  { level: 4, recipeLength: 4, correctSpawnRatio: 0.53, spawnIntervalSec: 0.52, maxOnScreen: 7, obstacleDropRate: 0.09, fallSpeedMultiplier: 1.72 },
  { level: 5, recipeLength: 5, correctSpawnRatio: 0.49, spawnIntervalSec: 0.45, maxOnScreen: 7, obstacleDropRate: 0.12, fallSpeedMultiplier: 2.00 },
  { level: 6, recipeLength: 5, correctSpawnRatio: 0.45, spawnIntervalSec: 0.39, maxOnScreen: 7, obstacleDropRate: 0.15, fallSpeedMultiplier: 2.30 },
  { level: 7, recipeLength: 6, correctSpawnRatio: 0.42, spawnIntervalSec: 0.34, maxOnScreen: 8, obstacleDropRate: 0.18, fallSpeedMultiplier: 2.63 },
]
