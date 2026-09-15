import shell from './screen.module.css'
import s from './TitleScreen.module.css'

export default function TitleScreen(p: {
  best: number
  onStart: () => void
  onTutorial: () => void
}) {
  return (
    <div className={shell.screen}>
      <h1>도토리 숲 바구니</h1>
      <img className={s.hero} src="/assets/scene/squirrel.png" alt="바구니를 든 다람쥐" />
      <p>레시피에 적힌 <b>순서대로</b> 과일을 받으세요.</p>
      <button className={shell.bigBtn} onClick={p.onStart}>시작하기</button>
      <button className={`${shell.bigBtn} ${shell.ghost}`} onClick={p.onTutorial}>놀이법</button>
      {p.best > 0 && <span className={s.best}>최고 {p.best.toLocaleString()}</span>}
    </div>
  )
}
