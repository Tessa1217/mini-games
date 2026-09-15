import type { ReactNode } from 'react'
import shell from './screen.module.css'
import s from './TutorialScreen.module.css'
import { ITEMS } from '@/game/config/items'

/** 규칙 한 줄. 아이콘이 둘이면 자동으로 작게 넣는다 */
function Rule({ icons, emoji, title, children }: {
  icons?: string[]
  emoji?: string
  title: string
  children: ReactNode
}) {
  return (
    <div className={s.rule}>
      <span className={`${s.ic} ${icons && icons.length > 1 ? s.two : ''}`}>
        {emoji ?? icons?.map((src) => <img key={src} src={src} alt="" />)}
      </span>
      <span><b>{title}</b><span>{children}</span></span>
    </div>
  )
}

export default function TutorialScreen(p: { onStart: () => void; onBack: () => void }) {
  return (
    <div className={`${shell.screen} ${s.tut}`}>
      <h2>놀이법</h2>

      <Rule title="순서대로 받기" icons={[ITEMS.apple.sprite, ITEMS.banana.sprite]}>
        아래 레시피의 <b>빨간 칸</b>이 지금 받을 과일입니다. 왼쪽부터 차례로 채웁니다.
      </Rule>

      <Rule title="좌우로 움직이기" icons={['/assets/scene/squirrel.png']}>
        화면 아래 버튼, 또는 <span className={s.keycap}>←</span>{' '}
        <span className={s.keycap}>→</span> 키. 바구니가 있는 줄에 떨어진 것만 받습니다.
      </Rule>

      <Rule title="순서가 아니면 깎여요" icons={[ITEMS.grape.sprite]}>
        레시피에 있는 과일이라도 <b>차례가 아니면</b> 받으면 안 됩니다.
      </Rule>

      <Rule title="돌멩이와 나뭇가지는 피하기" icons={[ITEMS.stone.sprite, ITEMS.twig.sprite]}>
        먹을 수 없는 것들입니다. 받으면 도토리가 깎입니다.
      </Rule>

      <Rule title="시간 안에 채우기" emoji="⏳">
        레시피 위 막대가 남은 시간. 다 줄면 도토리가 깎이고 레시피가 새로 나옵니다.
      </Rule>

      <div className={s.tutActs}>
        <button className={`${shell.bigBtn} ${shell.ghost} ${s.actBtn}`} onClick={p.onBack}>
          돌아가기
        </button>
        <button className={`${shell.bigBtn} ${s.actBtn}`} onClick={p.onStart}>바로 시작</button>
      </div>
    </div>
  )
}
