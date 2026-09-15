import type { RefObject } from 'react'
import s from './Stage.module.css'

/**
 * 낙하 무대. 배경 · 레인 하이라이트 · 아이템 레이어 · 다람쥐를 배치한다.
 *
 * 이 안의 요소들은 **루프가 매 프레임 직접 만진다.** 그래서 ref 를 밖에서 받는다 —
 * 소유자를 한 곳(`useGameLoop`)으로 모아야 누가 DOM 을 쓰는지 추적된다.
 */
export interface StageRefs {
  items: RefObject<HTMLDivElement | null>
  laneHighlight: RefObject<HTMLDivElement | null>
  squirrel: RefObject<HTMLDivElement | null>
}

export default function Stage({ refs, children }: { refs: StageRefs; children?: React.ReactNode }) {
  return (
    <div className={s.stage}>
      <div className={s.bg} />
      <div className={s.laneHi} ref={refs.laneHighlight} />
      <div className={s.items} ref={refs.items} />
      <div className={s.squirrel} ref={refs.squirrel}>
        <img src="/assets/scene/squirrel.png" alt="바구니를 든 다람쥐" className={s.rim2} />
      </div>
      {children}
    </div>
  )
}
