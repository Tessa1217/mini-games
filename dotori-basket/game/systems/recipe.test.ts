import { describe, expect, it } from 'vitest'
import { BALANCE } from '../config'
import { activeFruits } from '../config/items'
import { createRecipe, isWarning } from './recipe'
import { tuningForLevel } from '../tuning'

describe('createRecipe', () => {
  it('레벨의 길이만큼 만든다', () => {
    for (const lv of [1, 3, 5, 7]) {
      expect(createRecipe(lv)).toHaveLength(tuningForLevel(lv).recipeLength)
    }
  })

  it('활성 풀 안에서만 고른다', () => {
    const ids = new Set(activeFruits(7).map((f) => f.id))
    for (const f of createRecipe(7)) expect(ids.has(f.id)).toBe(true)
  })

  it('방해물은 절대 들어가지 않는다', () => {
    for (const lv of [3, 5, 7]) {
      for (const f of createRecipe(lv)) expect(f.neverInRecipe).toBe(false)
    }
  })

  it('직전 항목과 같은 과일이 연달아 나오지 않는다', () => {
    for (let i = 0; i < 200; i++) {
      const r = createRecipe(5)
      for (let k = 1; k < r.length; k++) expect(r[k]!.id).not.toBe(r[k - 1]!.id)
    }
  })

  it('Lv1 풀이 2종이면 가짓수가 2개뿐이라 4종을 푼다', () => {
    expect(activeFruits(1).length).toBeGreaterThanOrEqual(4)
  })
})

describe('isWarning', () => {
  it('잔여 비율이 임계 이하면 경고다', () => {
    const { warnRatio, limitSec } = BALANCE.recipe
    expect(isWarning(limitSec * warnRatio * 0.9, limitSec)).toBe(true)
    expect(isWarning(limitSec, limitSec)).toBe(false)
  })

  it('잔여 시간이 절대 임계 이하여도 경고다', () => {
    expect(isWarning(BALANCE.recipe.warnSecondsMax - 0.1, 9999)).toBe(true)
  })
})
