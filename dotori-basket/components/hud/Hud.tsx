import s from './Hud.module.css'
import { BALANCE } from '@/game/config'

/** 상단 정보 — 도토리(HP) · 레벨 · 점수 · 일시정지. 초당 몇 번만 바뀌므로 state 로 받는다 */
export default function Hud(p: {
  hp: number
  level: number
  score: number
  onPause: () => void
}) {
  return (
    <div className={s.hud}>
      <div className={s.hp} aria-label={`도토리 ${p.hp} / ${BALANCE.hp.max}`}>
        {Array.from({ length: BALANCE.hp.max }, (_, i) => (
          <i key={i} className={i >= p.hp ? s.off : undefined} />
        ))}
      </div>
      <span className={s.chip}>Lv {p.level}</span>
      <button className={s.pause} type="button" aria-label="일시정지" onClick={p.onPause}>
        <i /><i />
      </button>
      <span className={s.score}>{p.score.toLocaleString()}</span>
    </div>
  )
}
