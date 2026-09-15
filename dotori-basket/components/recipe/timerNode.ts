import s from './RecipeBar.module.css'

/** 남은 시간 막대는 매 프레임 바뀐다 — 리렌더 대신 transform 을 직접 쓴다 */
export function paintTimer(
  bar: HTMLElement | null,
  fill: HTMLElement | null,
  frac: number,
  warn: boolean,
) {
  if (fill) fill.style.transform = `scaleX(${frac.toFixed(4)})`
  bar?.classList.toggle(s.warn!, warn)
}
