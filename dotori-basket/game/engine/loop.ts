/**
 * 고정 타임스텝 루프.
 *
 * `dt`를 1/30으로 클램프한다 — 탭에서 돌아왔을 때 누적된 시간이 한 번에 흘러
 * 낙하물이 순간이동하는 것을 막는다. 누적기는 5스텝까지만 소화한다(스파이럴 방지).
 */
const STEP = 1 / 60
const MAX_DT = 1 / 30
const MAX_STEPS = 5

export interface Loop {
  start(): void
  stop(): void
  /** 일시정지 후 재개할 때 호출 — 멈춰 있던 시간을 버린다 */
  resetClock(): void
}

export function createLoop(
  step: (dt: number, nowMs: number) => void,
  onFrame?: (nowMs: number) => void,
): Loop {
  let raf = 0
  let last = 0
  let acc = 0

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick)
    const dt = Math.min((now - last) / 1000, MAX_DT)
    last = now
    acc += dt
    let guard = 0
    while (acc >= STEP && guard++ < MAX_STEPS) {
      step(STEP, now)
      acc -= STEP
    }
    onFrame?.(now)
  }

  return {
    start() {
      if (raf) return
      last = performance.now()
      acc = 0
      raf = requestAnimationFrame(tick)
    },
    stop() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    },
    resetClock() {
      last = performance.now()
      acc = 0
    },
  }
}
