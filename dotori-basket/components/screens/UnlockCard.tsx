import { useEffect } from 'react'
import shell from './screen.module.css'
import s from './UnlockCard.module.css'
import type { ItemDef } from '@/game/types'
import { BALANCE } from '@/game/config'

function Group({ title, items, warn }: { title: string; items: ItemDef[]; warn?: boolean }) {
  if (items.length === 0) return null
  return (
    <div className={`${s.grp} ${warn ? s.warn : ''}`}>
      <h3>{title}</h3>
      <div className={s.row}>
        {items.map((f) => (
          <span key={f.id} className={s.it}>
            <img src={f.sprite} alt={f.label} /><span>{f.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * 해금 카드 — **게임을 멈춘다.** 과일이 떨어지는 중에 띄우면 읽을 수가 없다.
 * 방해물은 «조심하세요»로 분리한다 — 받으면 깎이는 것들이라 "새로 나왔어요"에 섞으면 안 된다.
 */
export default function UnlockCard(p: { level: number; items: ItemDef[]; onClose: () => void }) {
  const { onClose } = p
  useEffect(() => {
    const t = setTimeout(onClose, BALANCE.levelUp.bannerDurationSec * 1000 + 700)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`${shell.screen} ${shell.scrim}`} onPointerDown={onClose}>
      <div className={shell.card}>
        <div className={s.lvl}>Lv {p.level}</div>
        <Group title="새 과일이 나와요" items={p.items.filter((i) => i.kind === 'fruit')} />
        <Group title="조심하세요" items={p.items.filter((i) => i.kind === 'obstacle')} warn />
        <div className={s.hint}>아무 곳이나 누르면 계속</div>
      </div>
    </div>
  )
}
