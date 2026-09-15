import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ITEMS, ALL_ITEM_IDS, ACTIVE_FRUIT_CAP, activeFruits, unlockedObstacles } from './items'

const PUBLIC = resolve(import.meta.dirname, '../../public')

describe('스프라이트 — 액박 방지', () => {
  it.each(ALL_ITEM_IDS)('%s 의 스프라이트 파일이 실제로 있다', (id) => {
    const p = resolve(PUBLIC, ITEMS[id].sprite.replace(/^\//, ''))
    expect(existsSync(p), `${ITEMS[id].sprite} 없음`).toBe(true)
  })

  it('경로는 항상 / 로 시작한다 (정적 export 에서 상대경로가 섞이면 깨진다)', () => {
    for (const id of ALL_ITEM_IDS) expect(ITEMS[id].sprite.startsWith('/assets/')).toBe(true)
  })

  it('두 아이템이 같은 스프라이트를 쓰지 않는다', () => {
    const seen = new Set(ALL_ITEM_IDS.map((id) => ITEMS[id].sprite))
    expect(seen.size).toBe(ALL_ITEM_IDS.length)
  })

  it('모든 아이템이 items/ 한 폴더에 있고, 그 폴더에 미아 파일이 없다', () => {
    for (const id of ALL_ITEM_IDS) expect(ITEMS[id].sprite.startsWith('/assets/items/')).toBe(true)

    const onDisk = readdirSync(resolve(PUBLIC, 'assets/items')).sort()
    const wired = ALL_ITEM_IDS.map((id) => ITEMS[id].sprite.split('/').pop()!).sort()
    expect(onDisk, 'items/ 는 보유 현황 그 자체다 — 안 쓰는 파일을 두지 않는다').toEqual(wired)
  })
})

describe('해금', () => {
  it('Lv1 에 과일이 최소 4종 — 2종이면 가능한 레시피가 2가지뿐이다', () => {
    expect(activeFruits(1).length).toBeGreaterThanOrEqual(4)
  })

  it('활성 풀이 상한을 넘지 않는다', () => {
    for (const lv of [1, 5, 13, 50]) {
      expect(activeFruits(lv).length).toBeLessThanOrEqual(ACTIVE_FRUIT_CAP)
    }
  })

  it('방해물은 활성 과일 풀에 섞이지 않는다', () => {
    for (const lv of [3, 7, 13]) {
      for (const f of activeFruits(lv)) expect(f.kind).toBe('fruit')
    }
  })

  it('방해물은 Lv3 부터 나온다', () => {
    expect(unlockedObstacles(2)).toHaveLength(0)
    expect(unlockedObstacles(3).length).toBeGreaterThan(0)
  })

  it('해금 레벨에 빈 구간이 없다 — 레벨업했는데 새 과일이 없으면 배너가 심심해진다', () => {
    const levels = [...new Set(Object.values(ITEMS)
      .filter((i) => i.kind === 'fruit').map((i) => i.unlockLevel))].sort((a, b) => a - b)
    for (let i = 1; i < levels.length; i++) expect(levels[i]! - levels[i - 1]!).toBe(1)
  })
})
