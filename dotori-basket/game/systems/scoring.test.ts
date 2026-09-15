import { describe, expect, it } from 'vitest'
import { BALANCE } from '../config'
import { comboMultiplier, catchScore, completionBonus } from './scoring'
import { applyDamage, initialHp, isDead } from './hp'

describe('콤보 배율', () => {
  it('0부터 시작해 comboStep 마다 오른다', () => {
    const { comboStep, comboIncrement } = BALANCE.scoring
    expect(comboMultiplier(0)).toBe(1)
    expect(comboMultiplier(comboStep)).toBeCloseTo(1 + comboIncrement)
  })

  it('상한을 넘지 않는다', () => {
    expect(comboMultiplier(9999)).toBe(BALANCE.scoring.comboMax)
  })

  it('실제로 도달 가능한 상한이다 — 정답 9개 안쪽', () => {
    const { comboStep, comboIncrement, comboMax } = BALANCE.scoring
    const need = Math.round((comboMax - 1) / comboIncrement) * comboStep
    expect(need).toBeLessThanOrEqual(12)
    expect(comboMultiplier(need)).toBe(comboMax)
  })
})

describe('점수', () => {
  it('콤보가 오르면 획득 점수도 오른다', () => {
    expect(catchScore(BALANCE.scoring.comboStep)).toBeGreaterThan(catchScore(0))
  })
  it('완성 보너스는 길이에 비례한다', () => {
    expect(completionBonus(6)).toBe(completionBonus(3) * 2)
  })
})

describe('HP 무적', () => {
  it('무적 중에는 데미지가 들어가지 않는다', () => {
    const hit = applyDamage(initialHp(), 1, 1000)
    const again = applyDamage(hit, 1, 1000 + BALANCE.hp.invulnerableSec * 1000 - 1)
    expect(again.hp).toBe(hit.hp)
  })

  it('무적이 끝나면 다시 들어간다', () => {
    const hit = applyDamage(initialHp(), 1, 1000)
    const after = applyDamage(hit, 1, 1000 + BALANCE.hp.invulnerableSec * 1000 + 1)
    expect(after.hp).toBe(hit.hp - 1)
  })

  it('0 아래로 내려가지 않는다', () => {
    let s = initialHp()
    for (let i = 0; i < 10; i++) s = applyDamage(s, 1, i * 10_000)
    expect(s.hp).toBe(0)
    expect(isDead(s)).toBe(true)
  })

  it('레벨업 회복은 0이다 — 있으면 숙련자 세션이 안 끝난다', () => {
    expect(BALANCE.hp.healOnLevelUp).toBe(0)
  })
})
