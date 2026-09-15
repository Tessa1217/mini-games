'use client'

import { useCallback, useEffect, useState } from 'react'
import s from './Game.module.css'
import Stage from './stage/Stage'
import Hud from './hud/Hud'
import RecipeBar from './recipe/RecipeBar'
import LaneControls from './controls/LaneControls'
import ScreenLayer from './screens/ScreenLayer'
import type { ItemDef } from '@/game/types'
import { usePhase, type Phase } from '@/hooks/usePhase'
import { useGameSession } from '@/hooks/useGameSession'
import { useGameLoop } from '@/hooks/useGameLoop'
import { useViewportFit } from '@/hooks/useViewportFit'
import { useDebugBridge } from '@/hooks/useDebugBridge'
import { useGameInput } from '@/input/useGameInput'

/** 조립만 한다. 로직이 늘면 `hooks/` 로 내린다 — docs/arch/components.md */
export default function Game() {
  const phase = usePhase()
  const [unlocked, setUnlocked] = useState<{ level: number; items: ItemDef[] }>({ level: 1, items: [] })

  const session = useGameSession({
    onUnlock: (level, items) => { setUnlocked({ level, items }); phase.go('unlock') },
    onGameOver: () => phase.go('over'),
  })
  const fitRef = useViewportFit()

  const resume = useCallback(() => phase.go('playing'), [phase])

  const input = useGameInput({
    enabled: () => phase.ref.current === 'playing',
    onMove: session.move,
    onTogglePause: phase.togglePause,
    onConfirm: () => {
      const p = phase.ref.current
      if (p === 'title' || p === 'tutorial' || p === 'over') start()
      else if (p === 'paused' || p === 'unlock') resume()
    },
  })

  const refs = useGameLoop({ session, input, phase })

  const start = useCallback(() => {
    refs.clearItems()
    session.reset()
    phase.go('playing')
  }, [refs, session, phase])

  useDebugBridge({
    session, phase,
    onJump: (level) => {
      const items = session.jumpToLevel(level)
      setUnlocked({ level, items })
      phase.go(items.length > 0 ? 'unlock' : 'playing')
    },
  })

  const { readBest } = session
  useEffect(() => { readBest() }, [readBest])

  return (
    <main className={s.page}>
      <div className={s.fit} ref={fitRef}>
        <Stage refs={refs}>
          <Hud hp={session.hud.hp} level={session.hud.level} score={session.hud.score}
            onPause={phase.pauseIfPlaying} />
          <ScreenLayer
            phase={phase.phase}
            best={session.best}
            score={session.hud.score}
            unlocked={unlocked}
            onStart={start}
            onResume={resume}
            onGo={(p: Phase) => phase.go(p)}
          />
        </Stage>

        <RecipeBar refs={refs} items={session.recipe.items} idx={session.recipe.idx} />
        <LaneControls onPress={input.press} onRelease={input.release} />
      </div>
    </main>
  )
}
