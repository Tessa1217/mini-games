import { describe, expect, it } from 'vitest'
import { BALANCE } from '../config'
import { ITEMS } from '../config/items'
import { initialHp, applyDamage, isDead, resolvePenalty } from './hp'

describe('페널티 해석 — 방해물마다 다르다', () => {
  it('나뭇가지는 콤보만 끊는다 (체력을 건드리지 않는다)', () => {
    expect(resolvePenalty(ITEMS.twig)).toEqual({ kind: 'combo' })
  })

  it('돌멩이는 체력을 2 깎는다', () => {
    expect(resolvePenalty(ITEMS.stone)).toEqual({ kind: 'hp', amount: 2 })
  })

  it('과일은 penalty 를 갖지 않고 wrongCatchHp 를 따른다', () => {
    expect(ITEMS.apple.penalty).toBeUndefined()
    expect(resolvePenalty(ITEMS.apple)).toEqual({ kind: 'hp', amount: BALANCE.hp.wrongCatchHp })
  })

  it('돌멩이가 오답 과일보다 아프다 — 이게 이 설계의 전부다', () => {
    const stone = resolvePenalty(ITEMS.stone)
    const fruit = resolvePenalty(ITEMS.apple)
    expect(stone.kind === 'hp' && fruit.kind === 'hp' && stone.amount > fruit.amount).toBe(true)
  })
})

describe('체력 경제 — 돌멩이 2칸을 감당할 수 있나', () => {
  it('돌멩이 한 방에 죽지 않는다', () => {
    const after = applyDamage(initialHp(), 2, 1000)
    expect(isDead(after)).toBe(false)
  })

  it('최대 체력이 오답 과일 3번보다 크다 — 3이면 돌멩이 두 번에 끝난다', () => {
    expect(BALANCE.hp.max).toBeGreaterThan(3)
  })

  it('무적 중에는 돌멩이도 안 깎인다', () => {
    const hit = applyDamage(initialHp(), 2, 1000)
    const again = applyDamage(hit, 2, 1000 + BALANCE.hp.invulnerableSec * 500)
    expect(again.hp).toBe(hit.hp)
  })

  it('무적이 끝나면 다시 깎인다', () => {
    const hit = applyDamage(initialHp(), 2, 1000)
    const after = applyDamage(hit, 2, 1000 + BALANCE.hp.invulnerableSec * 1000 + 1)
    expect(after.hp).toBe(hit.hp - 2)
  })

  it('체력은 0 아래로 내려가지 않는다', () => {
    let s = initialHp()
    for (let i = 0; i < 20; i++) s = applyDamage(s, 2, 1000 + i * 2000)
    expect(s.hp).toBe(0)
    expect(isDead(s)).toBe(true)
  })
})
