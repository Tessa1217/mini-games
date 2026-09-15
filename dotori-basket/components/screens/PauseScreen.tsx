import shell from './screen.module.css'

export default function PauseScreen(p: {
  onResume: () => void
  onRestart: () => void
  onTitle: () => void
}) {
  return (
    <div className={`${shell.screen} ${shell.scrim}`}>
      <div className={shell.card}>
        <h2 className={shell.plain}>잠깐 멈춤</h2>
        <button className={shell.bigBtn} onClick={p.onResume}>계속하기</button>
        <button className={`${shell.bigBtn} ${shell.ghost}`} onClick={p.onRestart}>다시하기</button>
        <button className={`${shell.bigBtn} ${shell.ghost}`} onClick={p.onTitle}>처음 화면</button>
      </div>
    </div>
  )
}
