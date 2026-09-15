/**
 * 탭·앱이 가려지면 알린다.
 *
 * 웹뷰에서 앱을 전환했다 돌아왔을 때 그 사이 판이 진행돼 있으면 안 된다.
 * `pagehide`도 함께 건다 — iOS 웹뷰는 `visibilitychange`가 안 오는 경우가 있다.
 */
export function onHidden(handler: () => void): () => void {
  const onVis = () => {
    if (document.hidden) handler()
  }
  document.addEventListener('visibilitychange', onVis)
  window.addEventListener('pagehide', handler)
  window.addEventListener('blur', handler)
  return () => {
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('pagehide', handler)
    window.removeEventListener('blur', handler)
  }
}
