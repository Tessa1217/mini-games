import s from './Stage.module.css'
import { crow } from '@/game/config/crow'
import type { CrowPhase } from '@/game/systems/crow'

/**
 * 까마귀 — 낙하물이 아니라 이벤트다. **가로로 지나간다.**
 * 아래로 떨어지지 않아야 "받는 게 아니다"가 움직임만으로 읽힌다.
 *
 * 등장은 14초에 한 번이라 state 로 그린다. 이동은 CSS 애니메이션이 맡는다 —
 * RAF 가 매 프레임 transform 을 쓰는 노드가 아니므로 경합이 없다.
 */
export default function Crow({ phase, y }: { phase: CrowPhase; y: number }) {
  if (phase === 'idle') return null

  return (
    <div
      className={`${s.crow} ${phase === 'warn' ? s.crowWarn : s.crowFly}`}
      style={{ '--fly': `${crow.flySec}s`, top: `${Math.round(y) - 8}px` } as React.CSSProperties}
      aria-hidden="true"
    >
      <img src={crow.sprite} alt="" />
    </div>
  )
}
