import { describe, expect, it } from 'vitest'
import { BALANCE } from './config'
import { tuningForLevel, recipeTimeLimitSec, correctGapSec, recipeMinCompletionSec } from './tuning'

describe('tuningForLevel — 경계값', () => {
  it('표에 있는 레벨을 그대로 돌려준다', () => {
    expect(tuningForLevel(1).recipeLength).toBe(3)
    expect(tuningForLevel(7).fallSpeedMultiplier).toBeCloseTo(2.63)
  })

  it.each([0, -1, -999])('1 미만(%i)은 Lv1로 클램프한다', (lv) => {
    expect(tuningForLevel(lv).level).toBe(1)
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    '유한하지 않은 값(%p)에도 던지지 않는다', (lv) => {
      expect(() => tuningForLevel(lv)).not.toThrow()
      expect(Number.isFinite(tuningForLevel(lv).recipeLength)).toBe(true)
    })

  it('소수는 내림한다', () => {
    expect(tuningForLevel(3.9).level).toBe(tuningForLevel(3).level)
  })

  it('표 밖(무한 구간)은 외삽하되 상·하한을 넘지 않는다', () => {
    const e = BALANCE.endless
    for (const lv of [8, 12, 19, 50, 1000]) {
      const t = tuningForLevel(lv)
      expect(t.spawnIntervalSec).toBeGreaterThanOrEqual(e.spawnIntervalMinSec)
      expect(t.correctSpawnRatio).toBeGreaterThanOrEqual(e.correctSpawnRatioMin)
      expect(t.fallSpeedMultiplier).toBeLessThanOrEqual(e.fallSpeedMax)
      expect(t.obstacleDropRate).toBeLessThanOrEqual(e.obstacleDropRateMax)
    }
  })

  it('반환값을 고쳐도 다음 호출이 오염되지 않는다', () => {
    tuningForLevel(1).recipeLength = 99
    expect(tuningForLevel(1).recipeLength).toBe(3)
  })
})

describe('파생 수치', () => {
  it('제한시간은 레벨과 무관한 고정값이다', () => {
    expect(recipeTimeLimitSec(1)).toBe(BALANCE.recipe.limitSec)
    expect(recipeTimeLimitSec(99)).toBe(BALANCE.recipe.limitSec)
  })

  it('정답간격 = 스폰간격 ÷ 정답비율', () => {
    const t = tuningForLevel(1)
    expect(correctGapSec(1)).toBeCloseTo(t.spawnIntervalSec / t.correctSpawnRatio)
  })

  it('최소소요가 제한시간보다 항상 짧다 — 아니면 클리어 불가능한 레벨이 생긴다', () => {
    for (const lv of [1, 4, 7, 19, 100]) {
      expect(recipeMinCompletionSec(lv)).toBeLessThan(recipeTimeLimitSec(lv))
    }
  })
})

describe('스포너 하한', () => {
  it('spawnIntervalMinSec 가 동시통과 상한이 만드는 물리적 하한 아래로 가지 않는다', () => {
    const floor = (BALANCE.spawner.crossWindowSec * 2) / BALANCE.spawner.simultaneousCrossLimit
    expect(BALANCE.endless.spawnIntervalMinSec).toBeGreaterThanOrEqual(floor)
  })

  it('표의 모든 레벨도 그 하한을 지킨다', () => {
    const floor = (BALANCE.spawner.crossWindowSec * 2) / BALANCE.spawner.simultaneousCrossLimit
    for (const l of BALANCE.levels) expect(l.spawnIntervalSec).toBeGreaterThanOrEqual(floor)
  })

  it('동시통과 상한은 빈 레인 2개를 남긴다', () => {
    expect(BALANCE.spawner.simultaneousCrossLimit).toBe(BALANCE.lane.count - 2)
  })
})
