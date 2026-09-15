'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

export type Phase = 'loading' | 'title' | 'tutorial' | 'playing' | 'paused' | 'unlock' | 'over'

/**
 * 어느 화면인가. 전이 규칙은 `docs/rules/state-machine.md`.
 *
 * `ref` 를 함께 내주는 이유 — 루프는 매 프레임 도는데 state 를 읽으면 클로저가 낡는다.
 */
export function usePhase(initial: Phase = 'loading') {
  const [phase, setPhase] = useState<Phase>(initial)
  const ref = useRef<Phase>(initial)
  ref.current = phase

  const go = useCallback((next: Phase) => setPhase(next), [])

  /** 재생 ↔ 일시정지만 뒤집는다. 다른 화면에서는 아무 일도 없어야 한다 */
  const togglePause = useCallback(() => {
    setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p))
  }, [])

  const pauseIfPlaying = useCallback(() => {
    setPhase((p) => (p === 'playing' ? 'paused' : p))
  }, [])

  return useMemo(
    () => ({ phase, ref, go, togglePause, pauseIfPlaying }),
    [phase, go, togglePause, pauseIfPlaying],
  )
}

export type PhaseControl = ReturnType<typeof usePhase>
