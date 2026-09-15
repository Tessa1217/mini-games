import shell from './screen.module.css'
import s from './GameOverScreen.module.css'

export default function GameOverScreen(p: {
  score: number
  best: number
  onRestart: () => void
  onTitle: () => void
}) {
  return (
    <div className={`${shell.screen} ${shell.scrim}`}>
      <div className={shell.card}>
        <h2 className={shell.plain}>게임 오버</h2>
        <div className={s.score}>{p.score.toLocaleString()}</div>
        <div className={s.best}>최고 {p.best.toLocaleString()}</div>
        <button className={shell.bigBtn} onClick={p.onRestart}>다시하기</button>
        <button className={`${shell.bigBtn} ${shell.ghost}`} onClick={p.onTitle}>처음 화면</button>
      </div>
    </div>
  )
}
