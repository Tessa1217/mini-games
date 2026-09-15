/**
 * DOM 노드 풀.
 *
 * 낙하물은 매 프레임 `transform`이 바뀌므로 React state에 두지 않는다.
 * 노드를 직접 만들고 재사용한다. → docs/arch/stack.md
 */
export interface Pooled<T> {
  el: HTMLElement
  data: T
}

export function createPool<T>(
  parent: HTMLElement,
  make: () => HTMLElement,
): {
  acquire(data: T): Pooled<T>
  release(item: Pooled<T>): void
  live: Pooled<T>[]
  clear(): void
} {
  const live: Pooled<T>[] = []
  const free: HTMLElement[] = []

  return {
    live,
    acquire(data: T) {
      let el = free.pop()
      if (!el) {
        el = make()
        parent.appendChild(el)
      }
      el.style.display = 'block'
      const item = { el, data }
      live.push(item)
      return item
    },
    release(item: Pooled<T>) {
      const i = live.indexOf(item)
      if (i >= 0) live.splice(i, 1)
      item.el.style.display = 'none'
      free.push(item.el)
    },
    clear() {
      for (const item of live.slice()) this.release(item)
    },
  }
}
