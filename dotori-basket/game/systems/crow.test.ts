import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { crow } from '../config/crow'
import { crowUnlocked, nextCrowDelaySec, crowEatCount, pickCrowTargets } from './crow'

const t = (distanceToLine: number, isFruit = true) => ({ distanceToLine, isFruit })

describe('등장 조건', () => {
  it('fromLevel 부터 나온다', () => {
    expect(crowUnlocked(crow.fromLevel - 1)).toBe(false)
    expect(crowUnlocked(crow.fromLevel)).toBe(true)
  })

  it('예고 시간이 0 이 아니다 — 0 이면 개입할 수 없는 순수 RNG 손실이 된다', () => {
    expect(crow.warningSec).toBeGreaterThan(0)
  })
})

describe('등장 주기', () => {
  it('지터 범위 안에 든다', () => {
    const half = crow.intervalJitterSec / 2
    for (const r of [0, 0.5, 0.999]) {
      const d = nextCrowDelaySec(() => r)
      expect(d).toBeGreaterThanOrEqual(crow.intervalSec - half)
      expect(d).toBeLessThanOrEqual(crow.intervalSec + half)
    }
  })

  it('지터가 있다 — 없으면 등장이 메트로놈처럼 읽힌다', () => {
    expect(nextCrowDelaySec(() => 0)).not.toBeCloseTo(nextCrowDelaySec(() => 1), 3)
  })

  it('1초 아래로는 안 내려간다', () => {
    expect(nextCrowDelaySec(() => 0)).toBeGreaterThanOrEqual(1)
  })
})

describe('먹는 개수', () => {
  it('상향 레벨 전후로 갈린다', () => {
    expect(crowEatCount(crow.eatCountFromLevel - 1)).toBe(crow.eatCount)
    expect(crowEatCount(crow.eatCountFromLevel)).toBe(crow.eatCountMax)
  })

  it('상한을 넘지 않는다', () => {
    expect(crowEatCount(999)).toBeLessThanOrEqual(crow.eatCountMax)
  })
})

describe('무엇을 먹나 — 판정선에 가까운 과일부터', () => {
  it('곧 받을 것부터 고른다', () => {
    const picked = pickCrowTargets([t(300), t(40), t(150)], 1)
    expect(picked[0]!.distanceToLine).toBe(40)
  })

  it('방해물은 안 먹는다 — 치워주면 도움이 되어 버린다', () => {
    const picked = pickCrowTargets([t(10, false), t(200)], 1)
    expect(picked).toHaveLength(1)
    expect(picked[0]!.distanceToLine).toBe(200)
  })

  it('이미 판정선을 지난 것은 고르지 않는다', () => {
    expect(pickCrowTargets([t(-5), t(-80)], 2)).toHaveLength(0)
  })

  it('요청 개수만큼만, 가까운 순서로', () => {
    const picked = pickCrowTargets([t(300), t(20), t(90), t(5)], 2)
    expect(picked.map((p) => p.distanceToLine)).toEqual([5, 20])
  })

  it('먹을 게 없으면 빈 배열 — 호출부가 등장을 미룬다', () => {
    expect(pickCrowTargets([], 2)).toEqual([])
    expect(pickCrowTargets([t(10, false)], 1)).toEqual([])
  })

  it('count 가 0 이하면 아무것도 안 고른다', () => {
    expect(pickCrowTargets([t(10)], 0)).toEqual([])
    expect(pickCrowTargets([t(10)], -1)).toEqual([])
  })

  it('원본 배열을 변형하지 않는다 — 풀의 live 배열을 그대로 넘긴다', () => {
    const items = [t(300), t(40), t(150)]
    const before = items.map((i) => i.distanceToLine)
    pickCrowTargets(items, 2)
    expect(items.map((i) => i.distanceToLine)).toEqual(before)
  })
})

describe('스프라이트', () => {
  it('파일이 실제로 있다 — 경로가 config 에 있으므로 여기서 지킬 수 있다', () => {
    const p = resolve(import.meta.dirname, '../../public', crow.sprite.replace(/^\//, ''))
    expect(existsSync(p), `${crow.sprite} 없음`).toBe(true)
  })

  it('아이템 폴더가 아니라 scene/ 에 있다 — 받는 물건이 아니다', () => {
    expect(crow.sprite.startsWith('/assets/scene/')).toBe(true)
  })
})
