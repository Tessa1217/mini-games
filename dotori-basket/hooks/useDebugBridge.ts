'use client'

import { useEffect, useRef } from 'react'
import type { GameSession } from './useGameSession'
import type { PhaseControl } from './usePhase'

/**
 * `?dbg` 로만 열리는 테스트 훅. 레벨업까지 손으로 가는 비용이 커서 둔다.
 * 쿼리가 없으면 `window` 에 아무것도 붙이지 않는다.
 */
export function useDebugBridge(deps: {
  session: GameSession
  phase: PhaseControl
  onJump: (level: number) => void
}) {
  const live = useRef(deps)
  live.current = deps

  useEffect(() => {
    if (!/[?&]dbg\b/.test(window.location.search)) return
    Object.assign(window, {
      __dbg: {
        jump: (level: number) => live.current.onJump(level),
        state: () => {
          const c = live.current.session.state.current
          return {
            phase: live.current.phase.ref.current,
            level: c.level, hp: c.hp.hp, score: c.score,
            recipe: c.recipe.map((f) => f.label),
          }
        },
      },
    })
  }, [])
}
