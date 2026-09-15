import s from './LaneControls.module.css'

/** 좌우 이동 버튼. 누름·뗌만 알리고 쿨다운 판정은 input/useGameInput 이 진다 */
export default function LaneControls(p: {
  onPress: (dir: -1 | 1) => void
  onRelease: (dir: -1 | 1) => void
}) {
  const bind = (dir: -1 | 1) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); p.onPress(dir) },
    onPointerUp: () => p.onRelease(dir),
    onPointerCancel: () => p.onRelease(dir),
    onPointerLeave: () => p.onRelease(dir),
  })

  return (
    <div className={s.ctrl}>
      <button className={s.btn} type="button" aria-label="왼쪽 레인으로" {...bind(-1)}>◀</button>
      <button className={s.btn} type="button" aria-label="오른쪽 레인으로" {...bind(1)}>▶</button>
    </div>
  )
}
