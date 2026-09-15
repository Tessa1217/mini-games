const KEY = 'dotori.best'

/** 시크릿 모드에서는 접근 자체가 throw한다 — 반드시 감싼다 */
export function loadBest(): number {
  try {
    return Number.parseInt(localStorage.getItem(KEY) ?? '0', 10) || 0
  } catch {
    return 0
  }
}

export function saveBest(score: number): void {
  try {
    localStorage.setItem(KEY, String(score))
  } catch {
    // 저장 불가(시크릿 모드·용량 초과) — 게임 진행에는 영향이 없다
  }
}
