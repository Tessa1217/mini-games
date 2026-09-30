import type { ItemDef, ItemPenalty } from '../types'
import { BALANCE } from '../config'

export interface HpState {
  hp: number
  /** 이 시각(ms)까지 데미지 무효 */
  invulnerableUntil: number
}

export function initialHp(): HpState {
  return { hp: BALANCE.hp.max, invulnerableUntil: 0 }
}

/**
 * 데미지를 적용한다. 무적 중이면 **변화 없이** 원본을 돌려준다.
 * 무적은 데미지만 막는다 — 획득은 정상 동작한다.
 */
export function applyDamage(state: HpState, amount: number, nowMs: number): HpState {
  if (nowMs < state.invulnerableUntil) return state
  return {
    hp: Math.max(0, state.hp - amount),
    invulnerableUntil: nowMs + BALANCE.hp.invulnerableSec * 1000,
  }
}

export const isDead = (s: HpState) => s.hp <= 0

/**
 * 받았을 때의 벌칙을 결정한다.
 * 방해물은 자기 `penalty` 를, 오답 과일은 `hp.wrongCatchHp` 를 따른다.
 * 셋 다 정답 행동은 "피한다"로 같으므로 플레이 중 판단 부담은 오르지 않는다.
 */
export function resolvePenalty(def: ItemDef): ItemPenalty {
  return def.penalty ?? { kind: 'hp', amount: BALANCE.hp.wrongCatchHp }
}
