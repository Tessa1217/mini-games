import type { ItemDef } from '@/game/types'
import s from './Stage.module.css'
import { ITEM, laneX } from './geometry'

/**
 * 낙하물 DOM 노드. 풀이 재사용하므로 **생성과 칠하기를 나눈다.**
 * React 로 그리지 않는 이유는 arch/stack.md.
 */
export function createFallingNode(): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = `position:absolute;top:0;left:0;width:${ITEM}px;height:${ITEM}px;will-change:transform`
  const img = document.createElement('img')
  img.width = ITEM
  img.height = ITEM
  img.style.cssText = `width:${ITEM}px;height:${ITEM}px;object-fit:contain;display:block`
  img.className = s.rim!
  el.appendChild(img)
  return el
}

export function paintFallingSprite(el: HTMLElement, def: ItemDef) {
  const img = el.firstElementChild as HTMLImageElement
  img.src = def.sprite
  img.alt = def.label
}

export function moveFalling(el: HTMLElement, lane: number, y: number) {
  el.style.transform = `translate3d(${laneX(lane)}px,${y.toFixed(1)}px,0)`
}
