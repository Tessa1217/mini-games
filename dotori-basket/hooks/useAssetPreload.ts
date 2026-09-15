'use client'

import { useEffect, useState } from 'react'
import { ITEMS } from '@/game/config/items'

const SCENE = [
  '/assets/scene/squirrel.png',
  '/assets/scene/bg.jpg',
  '/assets/scene/bg-forest-full.jpg',
]

/** 스프라이트 선반입. 진행률(0~100)을 돌려주고, 다 받으면 `onDone`. */
export function useAssetPreload(onDone: () => void) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const urls = [...Object.values(ITEMS).map((i) => i.sprite), ...SCENE]
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
      im.onerror = tick          // 한 장 실패가 진입을 막으면 안 된다
      im.src = u
    }
    return () => { cancelled = true }
  }, [onDone])

  return pct
}
