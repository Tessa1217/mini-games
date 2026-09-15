'use client'

import { useEffect, useRef } from 'react'

const CONTENT_H = 790
const CONTENT_W = 360
const MIN_SCALE = 0.5

/** 스테이지를 통째로 축소해 어떤 화면에도 들어가게 한다. 웹뷰 전제라 스크롤은 쓰지 않는다 */
export function useViewportFit() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fit = () => {
      const el = ref.current
      if (!el) return
      const raw = Math.min(1, (window.innerHeight - 40) / CONTENT_H, (window.innerWidth - 24) / CONTENT_W)
      const scale = Math.max(MIN_SCALE, raw)
      el.style.transform = `scale(${scale.toFixed(3)})`
      el.style.height = `${CONTENT_H * scale}px`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return ref
}
