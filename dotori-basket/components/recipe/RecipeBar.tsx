import type { RefObject } from 'react'
import s from './RecipeBar.module.css'
import type { ItemDef } from '@/game/types'

/** 남은 시간 막대는 매 프레임 바뀐다 — scaleX 를 루프가 직접 쓴다. 큐만 state 로 그린다 */
export interface TimerRefs {
  timer: RefObject<HTMLDivElement | null>
  timerFill: RefObject<HTMLElement | null>
}

export default function RecipeBar({ refs, items, idx }: {
  refs: TimerRefs
  items: ItemDef[]
  idx: number
}) {
  return (
    <div className={s.recipeBar}>
      <div className={s.timer} ref={refs.timer}>
        <i ref={refs.timerFill as RefObject<HTMLElement>} />
      </div>
      <div className={s.queue} aria-label="레시피 — 왼쪽부터 순서대로 받는다">
        {items.map((f, i) => (
          <span key={`${f.id}-${i}`} style={{ display: 'contents' }}>
            {i > 0 && <span className={s.arw}>›</span>}
            <span className={`${s.qi} ${i === idx ? s.now : i < idx ? s.done : ''}`}>
              <img src={f.sprite} alt={f.label} />
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
