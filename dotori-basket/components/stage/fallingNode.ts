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
  // ⚠️ 노드는 풀에서 재사용된다. 여기서 지우지 않으면 까마귀에게 찍혔던 노드가
  //    다음 과일로 되살아날 때 표식을 달고 나온다.
  el.classList.remove(s.doomed!)
}

/** 까마귀가 노린 과일 — 예고 동안 표시해 "뺏기기 전에 잡자"를 만든다 */
export function markDoomed(el: HTMLElement, on: boolean) {
  el.classList.toggle(s.doomed!, on)
}

export function moveFalling(el: HTMLElement, lane: number, y: number) {
  el.style.transform = `translate3d(${laneX(lane)}px,${y.toFixed(1)}px,0)`
}
