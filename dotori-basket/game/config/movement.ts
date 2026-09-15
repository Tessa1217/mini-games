import type { MovementConfig } from '../types'

/** 근거: docs/rules/lane.md */
export const movement = {
  snapTiltMs: 90,        // 제자리 기울기 연출. 위치 보간이 아니다
  moveCooldownMs: 120,   // 탭·홀드·키보드 공통 게이트
  holdInitialDelayMs: 250,
  holdRepeatMs: 120,
} satisfies MovementConfig
