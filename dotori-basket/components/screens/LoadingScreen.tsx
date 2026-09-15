import shell from './screen.module.css'
import s from './LoadingScreen.module.css'
import { useAssetPreload } from '@/hooks/useAssetPreload'

/** 첫 과일이 팝인으로 튀어나오지 않게 미리 받는다 */
export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const pct = useAssetPreload(onDone)

  return (
    <div className={shell.screen}>
      <h1>도토리 숲 바구니</h1>
      <p>그림을 불러오는 중…</p>
      <div className={s.bar}><i style={{ width: `${pct}%` }} /></div>
    </div>
  )
}
