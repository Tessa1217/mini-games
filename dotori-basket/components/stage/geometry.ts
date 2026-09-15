import { BALANCE } from '@/game/config'

/** 무대 좌표계. 밸런스가 아니라 **그림 크기**다 — 수치를 바꾸면 art/layout.md 도 고친다 */
export const LANES = BALANCE.lane.count
export const LANE_W = BALANCE.lane.logicalWidth / LANES
export const ITEM = 48
export const SPAWN_Y = -60
export const DESPAWN_Y = BALANCE.lane.logicalHeight + 60
export const CROSS_Y = BALANCE.lane.catchLineY - ITEM / 2

export const SQUIRREL_W = 82
/** ★ 몸 축이 바운딩 박스 중심과 어긋난다 (꼬리). 실측 35.9% — art/sprites.md */
export const SQUIRREL_AXIS = 0.359

export const laneX = (lane: number) => lane * LANE_W + (LANE_W - ITEM) / 2

/** 다람쥐는 박스가 아니라 몸 축을 레인 중앙에 맞춘다 */
export const squirrelX = (lane: number) =>
  laneX(lane) - (SQUIRREL_W - ITEM) / 2 + (0.5 - SQUIRREL_AXIS) * SQUIRREL_W

export const clampLane = (lane: number) => Math.max(0, Math.min(LANES - 1, lane))
