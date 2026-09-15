import { describe, expect, it } from 'vitest'
import { BALANCE } from '../config'
import { ITEMS } from '../config/items'
import { planSpawn, nextSpawnDelaySec, fallSpeedPxPerSec, type Falling } from './spawner'

const apple = ITEMS.apple
const base = {
  level: 1, nowMs: 10_000, live: [] as Falling[], target: apple,
  playerLane: 2, lastCorrectSpawnMs: 10_000, spawnY: -60,
}
const fixed = (v: number) => () => v

describe('동시 통과 상한 — *언제* 스폰할지를 막는다', () => {
  it('윈도우 안에 상한만큼 차 있으면 거절한다', () => {
    const crossAt = base.nowMs + 3000
    const live: Falling[] = Array.from(
      { length: BALANCE.spawner.simultaneousCrossLimit },
      () => ({ def: apple, lane: 0, y: 0, crossAt }),
    )
    const r = planSpawn({ ...base, live, rand: fixed(0.01) })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('crossLimit')
  })

  it('통과 시각이 윈도우 밖이면 상한을 넘겨도 허용한다', () => {
    const far = base.nowMs + 999_999
    // maxOnScreen(Lv1 = 6)에 걸리지 않도록 상한보다 1개만 많게 둔다
    const live: Falling[] = Array.from(
      { length: BALANCE.spawner.simultaneousCrossLimit + 1 },
      () => ({ def: apple, lane: 0, y: 500, crossAt: far }),
    )
    expect(live.length).toBeLessThan(BALANCE.levels[0]!.maxOnScreen)
    expect(planSpawn({ ...base, live, rand: fixed(0.01) }).ok).toBe(true)
  })
})

describe('같은 레인 최소 간격 — *어디에* 스폰할지를 막는다', () => {
  it('간격이 부족한 레인은 후보에서 빠진다', () => {
    const live: Falling[] = [0, 1, 2, 3].map((lane) => ({
      def: apple, lane, y: base.spawnY + 10, crossAt: base.nowMs + 999_999,
    }))
    const r = planSpawn({ ...base, live, rand: fixed(0.01) })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.lane).toBe(4)     // 유일하게 비어 있는 레인
  })

  it('모든 레인이 막히면 거절한다', () => {
    const live: Falling[] = [0, 1, 2, 3, 4].map((lane) => ({
      def: apple, lane, y: base.spawnY + 10, crossAt: base.nowMs + 999_999,
    }))
    const r = planSpawn({ ...base, live, rand: fixed(0.01) })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('noLane')
  })
})

describe('기아 방지', () => {
  it('정답이 starvationSec 동안 안 나오면 강제로 정답을 낸다', () => {
    const r = planSpawn({
      ...base,
      lastCorrectSpawnMs: base.nowMs - BALANCE.spawner.starvationSec * 1000 - 1,
      rand: fixed(0.99),                 // 정상이라면 오답이 뽑힐 난수
    })
    expect(r.ok).toBe(true)
    if (r.ok) { expect(r.isCorrect).toBe(true); expect(r.def.id).toBe(apple.id) }
  })
})

describe('화면 상한', () => {
  it('maxOnScreen 에 도달하면 거절한다', () => {
    const live: Falling[] = Array.from({ length: 99 }, () => ({
      def: apple, lane: 0, y: 0, crossAt: 0,
    }))
    const r = planSpawn({ ...base, live })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('maxOnScreen')
  })
})

describe('지터', () => {
  it('간격이 설정 비율 안에서만 흔들린다', () => {
    const j = BALANCE.spawner.spawnJitterRatio
    const iv = BALANCE.levels[0]!.spawnIntervalSec
    for (const r of [0, 0.5, 1]) {
      const d = nextSpawnDelaySec(1, fixed(r))
      expect(d).toBeGreaterThanOrEqual(iv * (1 - j) - 1e-9)
      expect(d).toBeLessThanOrEqual(iv * (1 + j) + 1e-9)
    }
  })

  it('지터가 0이 아니다 — 0이면 동시통과 상한이 죽은 가드가 된다', () => {
    expect(BALANCE.spawner.spawnJitterRatio).toBeGreaterThan(0)
  })
})

describe('낙하 속도', () => {
  it('레벨이 오를수록 빨라진다', () => {
    const speeds = [1, 2, 3, 4, 5, 6, 7].map(fallSpeedPxPerSec)
    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]!).toBeGreaterThan(speeds[i - 1]!)
    }
  })

  it('끝에서 끝까지 피할 시간이 남는다 — 안 남으면 회피 불가능한 레벨이다', () => {
    const crossMs = 4 * BALANCE.movement.moveCooldownMs
    for (const lv of [1, 7, 19, 100]) {
      const fallMs = (BALANCE.lane.catchLineY / fallSpeedPxPerSec(lv)) * 1000
      expect(fallMs).toBeGreaterThan(crossMs)
    }
  })
})
