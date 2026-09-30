import { crow } from '../config/crow'

/**
 * 까마귀 — **낙하물이 아니라 이벤트다.**
 *
 * 받는 물건이 아니므로 스포너를 타지 않는다. 그래서 `crossAt`(동시통과 상한)·
 * `laneGap`·`reachability` 를 하나도 건드리지 않고, 레인에 묶이지 않으므로
 * 가로로 날 수 있다 — 불변식 1(위치 보간 금지)은 **판정선을 지나는 받는 물건**의 규칙이다.
 *
 * 흐름:  대기 → 예고(warn) → 비행(fly, 진입 순간 먹는다) → 대기
 */
export type CrowPhase = 'idle' | 'warn' | 'fly'

export const crowUnlocked = (level: number) => level >= crow.fromLevel

/** 이번 등장까지의 대기 시간(초). 지터가 없으면 등장이 메트로놈처럼 읽힌다 */
export function nextCrowDelaySec(rand: () => number = Math.random): number {
  const half = crow.intervalJitterSec / 2
  return Math.max(1, crow.intervalSec - half + rand() * crow.intervalJitterSec)
}

export function crowEatCount(level: number): number {
  return level >= crow.eatCountFromLevel ? crow.eatCountMax : crow.eatCount
}

export interface CrowTarget {
  /** 판정선까지 남은 거리(px). 작을수록 곧 받을 것 */
  distanceToLine: number
  isFruit: boolean
}

/**
 * 무엇을 먹을까 — **판정선에 가까운 과일부터.**
 *
 * 완전 랜덤이면 오답 과일을 치워주는 경우가 절반이라 이득/손해가 반반이 된다.
 * 곧 받을 것부터 고르면 "노린다"는 느낌 없이 결과만 위협적이다.
 * 방해물은 먹지 않는다 — 치워주면 도움이 되어 버린다.
 */
export function pickCrowTargets<T extends CrowTarget>(items: readonly T[], count: number): T[] {
  if (count <= 0) return []
  return items
    .filter((it) => it.isFruit && it.distanceToLine >= 0)
    .sort((a, b) => a.distanceToLine - b.distanceToLine)
    .slice(0, count)
}
