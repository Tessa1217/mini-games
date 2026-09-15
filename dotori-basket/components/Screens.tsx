'use client'

import { useEffect, useState } from 'react'
import s from './Screens.module.css'
import type { ItemDef } from '@/game/types'
import { ITEMS } from '@/game/config/items'
import { BALANCE } from '@/game/config'

/** 로딩 — 첫 과일이 팝인으로 튀어나오지 않게 미리 받는다 */
export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const urls = [
      ...Object.values(ITEMS).map((i) => i.sprite),
      '/assets/scene/squirrel.png',
      '/assets/scene/bg.jpg',
      '/assets/scene/bg-forest-full.jpg',
    ]
    let done = 0
    let cancelled = false
    const tick = () => {
      done += 1
      if (cancelled) return
      setPct(Math.round((100 * done) / urls.length))
      if (done >= urls.length) setTimeout(onDone, 180)
    }
    for (const u of urls) {
      const im = new Image()
      im.onload = tick
      im.onerror = tick           // 실패해도 진행을 막지 않는다
      im.src = u
    }
    return () => { cancelled = true }
  }, [onDone])

  return (
    <div className={s.screen}>
      <h1>도토리 숲 바구니</h1>
      <p>그림을 불러오는 중…</p>
      <div className={s.bar}><i style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export function TitleScreen(p: { best: number; onStart: () => void; onTutorial: () => void }) {
  return (
    <div className={s.screen}>
      <h1>도토리 숲 바구니</h1>
      <img className={s.hero} src="/assets/scene/squirrel.png" alt="바구니를 든 다람쥐" />
      <p>레시피에 적힌 <b>순서대로</b> 과일을 받으세요.</p>
      <button className={s.bigBtn} onClick={p.onStart}>시작하기</button>
      <button className={`${s.bigBtn} ${s.ghost}`} onClick={p.onTutorial}>놀이법</button>
      {p.best > 0 && <span className={s.best}>최고 {p.best.toLocaleString()}</span>}
    </div>
  )
}

export function TutorialScreen(p: { onStart: () => void; onBack: () => void }) {
  return (
    <div className={`${s.screen} ${s.tut}`}>
      <h2>놀이법</h2>
      <div className={s.rule}>
        <span className={`${s.ic} ${s.two}`}>
          <img src={ITEMS.apple.sprite} alt="" /><img src={ITEMS.banana.sprite} alt="" />
        </span>
        <span><b>순서대로 받기</b><span>아래 레시피의 <b>빨간 칸</b>이 지금 받을 과일입니다.
          왼쪽부터 차례로 채웁니다.</span></span>
      </div>
      <div className={s.rule}>
        <span className={s.ic}><img src="/assets/scene/squirrel.png" alt="" /></span>
        <span><b>좌우로 움직이기</b><span>화면 아래 버튼, 또는 <span className={s.keycap}>←</span>{' '}
          <span className={s.keycap}>→</span> 키. 바구니가 있는 줄에 떨어진 것만 받습니다.</span></span>
      </div>
      <div className={s.rule}>
        <span className={s.ic}><img src={ITEMS.grape.sprite} alt="" /></span>
        <span><b>순서가 아니면 깎여요</b><span>레시피에 있는 과일이라도 <b>차례가 아니면</b>
          받으면 안 됩니다.</span></span>
      </div>
      <div className={s.rule}>
        <span className={`${s.ic} ${s.two}`}>
          <img src={ITEMS.stone.sprite} alt="" /><img src={ITEMS.twig.sprite} alt="" />
        </span>
        <span><b>돌멩이와 나뭇가지는 피하기</b><span>먹을 수 없는 것들입니다. 받으면 도토리가 깎입니다.</span></span>
      </div>
      <div className={s.rule}>
        <span className={s.ic}>⏳</span>
        <span><b>시간 안에 채우기</b><span>레시피 위 막대가 남은 시간. 다 줄면 도토리가 깎이고
          레시피가 새로 나옵니다.</span></span>
      </div>
      <div className={s.tutActs}>
        <button className={`${s.bigBtn} ${s.ghost}`} onClick={p.onBack}>돌아가기</button>
        <button className={s.bigBtn} onClick={p.onStart}>바로 시작</button>
      </div>
    </div>
  )
}

/**
 * 해금 카드 — **게임을 멈춘다.** 과일이 떨어지는 중에 띄우면 읽을 수가 없다.
 * 방해물은 «조심하세요»로 분리한다 — 받으면 깎이는 것들이라 "새로 나왔어요"에 섞으면 안 된다.
 */
export function UnlockCard(p: { level: number; items: ItemDef[]; onClose: () => void }) {
  const fruits = p.items.filter((i) => i.kind === 'fruit')
  const obstacles = p.items.filter((i) => i.kind === 'obstacle')
  useEffect(() => {
    const t = setTimeout(p.onClose, BALANCE.levelUp.bannerDurationSec * 1000 + 700)
    return () => clearTimeout(t)
  }, [p])

  return (
    <div className={`${s.screen} ${s.scrim}`} onPointerDown={p.onClose}>
      <div className={s.card}>
        <div className={s.lvl}>Lv {p.level}</div>
        {fruits.length > 0 && (
          <div className={s.grp}>
            <h3>새 과일이 나와요</h3>
            <div className={s.row}>
              {fruits.map((f) => (
                <span key={f.id} className={s.it}>
                  <img src={f.sprite} alt={f.label} /><span>{f.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {obstacles.length > 0 && (
          <div className={`${s.grp} ${s.warn}`}>
            <h3>조심하세요</h3>
            <div className={s.row}>
              {obstacles.map((f) => (
                <span key={f.id} className={s.it}>
                  <img src={f.sprite} alt={f.label} /><span>{f.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className={s.hint}>아무 곳이나 누르면 계속</div>
      </div>
    </div>
  )
}

export function PauseScreen(p: { onResume: () => void; onRestart: () => void; onTitle: () => void }) {
  return (
    <div className={`${s.screen} ${s.scrim}`}>
      <div className={s.card}>
        <h2 style={{ color: 'var(--ink)', WebkitTextStroke: '0' }}>잠깐 멈춤</h2>
        <button className={s.bigBtn} onClick={p.onResume}>계속하기</button>
        <button className={`${s.bigBtn} ${s.ghost}`} onClick={p.onRestart}>다시하기</button>
        <button className={`${s.bigBtn} ${s.ghost}`} onClick={p.onTitle}>처음 화면</button>
      </div>
    </div>
  )
}

export function GameOverScreen(p: { score: number; best: number; onRestart: () => void; onTitle: () => void }) {
  return (
    <div className={`${s.screen} ${s.scrim}`}>
      <div className={s.card}>
        <h2 style={{ color: 'var(--ink)', WebkitTextStroke: '0' }}>게임 오버</h2>
        <div style={{ fontFamily: 'var(--disp)', fontSize: 44, fontWeight: 700, lineHeight: 1.1 }}>
          {p.score.toLocaleString()}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>최고 {p.best.toLocaleString()}</div>
        <button className={s.bigBtn} onClick={p.onRestart}>다시하기</button>
        <button className={`${s.bigBtn} ${s.ghost}`} onClick={p.onTitle}>처음 화면</button>
      </div>
    </div>
  )
}
