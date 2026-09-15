'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { BALANCE } from '@/game/config'

type Dir = -1 | 0 | 1

/**
 * 좌우 이동 입력. 탭·홀드·키보드가 **모두 하나의 쿨다운 게이트**를 통과한다.
 * 홀드에만 걸면 탭 연타(70~100ms)가 리피트 주기보다 빨라 난이도 노브가 무력화된다.
 *
 * 키는 `event.code`로 읽는다 — `event.key`는 한글 입력 상태에서 값이 달라진다.
 * OS 키 리피트(`e.repeat`)는 무시하고 루프의 누적 시간으로 직접 리피트를 만든다.
 */
export function useGameInput(opts: {
  enabled: () => boolean
  onMove: (dir: Dir) => void
  onTogglePause: () => void
  onConfirm: () => void
}) {
  const ref = useRef(opts)
  ref.current = opts

  const held = useRef<Dir>(0)
  const repeatAt = useRef(0)
  const lastMove = useRef(-1e9)
  const buffered = useRef<Dir>(0)

  /** 게이트 — 쿨다운 중이면 1개까지만 버퍼링한다 */
  const tryMove = (dir: Dir, now: number) => {
    if (!ref.current.enabled() || dir === 0) return
    if (now - lastMove.current < BALANCE.movement.moveCooldownMs) {
      buffered.current = dir
      return
    }
    lastMove.current = now
    buffered.current = 0
    ref.current.onMove(dir)
  }

  /** 루프에서 매 스텝 호출한다 — 벽시계 타이머를 쓰지 않는다 */
  const pump = useCallback((now: number) => {
    const h = held.current
    if (h !== 0 && now >= repeatAt.current) {
      tryMove(h, now)
      repeatAt.current = now + BALANCE.movement.holdRepeatMs
    } else if (h === 0 && buffered.current !== 0) {
      if (now - lastMove.current >= BALANCE.movement.moveCooldownMs) {
        tryMove(buffered.current, now)
      }
    }
  }, [])

  const press = useCallback((dir: Dir) => {
    held.current = dir
    repeatAt.current = performance.now() + BALANCE.movement.holdInitialDelayMs
    tryMove(dir, performance.now())
  }, [])
  const release = useCallback((dir: Dir) => {
    if (held.current === dir) held.current = 0
  }, [])
  const releaseAll = useCallback(() => {
    held.current = 0
    buffered.current = 0
  }, [])

  useEffect(() => {
    const KEYS: Record<string, Dir> = {
      ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1,
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault()
        ref.current.onTogglePause()
        return
      }
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault()
        ref.current.onConfirm()
        return
      }
      if (e.repeat) return                       // OS 리피트는 쓰지 않는다
      const d = KEYS[e.code]
      if (d === undefined) return
      e.preventDefault()
      press(d)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const d = KEYS[e.code]
      if (d !== undefined) release(d)
    }
    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseAll)
    document.addEventListener('visibilitychange', releaseAll)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', releaseAll)
      document.removeEventListener('visibilitychange', releaseAll)
    }
  }, [])

  /**
   * ★ 반환 객체는 **참조가 안정해야 한다.** 매 렌더 새 객체를 돌려주면
   * 이걸 의존성으로 쓰는 루프 useEffect 가 매번 teardown/재생성되어
   * 낙하물 풀이 비워진다(= 점수가 오를 때마다 화면이 리셋된다).
   */
  return useMemo(
    () => ({ pump, press, release, releaseAll }),
    [pump, press, release, releaseAll],
  )
}

export type GameInput = ReturnType<typeof useGameInput>
