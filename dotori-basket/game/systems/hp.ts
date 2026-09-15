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
