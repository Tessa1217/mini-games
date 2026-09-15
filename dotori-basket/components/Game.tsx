'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import s from './Game.module.css'
import type { ItemDef } from '@/game/types'
import { BALANCE } from '@/game/config'
import { ITEMS } from '@/game/config/items'
import { createLoop } from '@/game/engine/loop'
import { createPool } from '@/game/engine/pool'
import {
  type Falling, planSpawn, nextSpawnDelaySec, fallSpeedPxPerSec,
} from '@/game/systems/spawner'
import { createRecipe, recipeTimeLimitSec, isWarning } from '@/game/systems/recipe'
import { catchScore, completionBonus, comboMultiplier } from '@/game/systems/scoring'
import { initialHp, applyDamage, isDead, type HpState } from '@/game/systems/hp'
import { shouldLevelUp, newlyUnlocked } from '@/game/systems/level'
import {
  LoadingScreen, TitleScreen, TutorialScreen, UnlockCard, PauseScreen, GameOverScreen,
} from './Screens'
import { useGameInput } from '@/input/useGameInput'
import { onHidden } from '@/platform/visibility'
import { loadBest, saveBest } from '@/storage/highScore'

const LANES = BALANCE.lane.count
const LANE_W = BALANCE.lane.logicalWidth / LANES
const ITEM = 48
const SPAWN_Y = -60
const DESPAWN_Y = BALANCE.lane.logicalHeight + 60
const LINE = BALANCE.lane.catchLineY - ITEM / 2
const SQ_W = 82
const SQ_AXIS = 0.359
const laneX = (i: number) => i * LANE_W + (LANE_W - ITEM) / 2

const srcOf = (d: ItemDef) => d.sprite

type Phase = 'loading' | 'title' | 'tutorial' | 'playing' | 'paused' | 'unlock' | 'over'

/** 매 프레임 바뀌는 값은 여기 둔다 — React state 에 두면 60fps 리렌더가 된다 */
interface Mutable {
  lane: number
  tilt: number
  hp: HpState
  score: number
  combo: number
  level: number
  recipe: ItemDef[]
  idx: number
  recipesInLevel: number
  timeLeft: number
  timeMax: number
  spawnIn: number
  lastCorrectSpawnMs: number
}

export default function Game() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [unlocked, setUnlocked] = useState<{ level: number; items: ItemDef[] }>({ level: 1, items: [] })
  const [hud, setHud] = useState({ hp: BALANCE.hp.max, score: 0, level: 1, combo: 1 })
  const [recipe, setRecipe] = useState<{ items: ItemDef[]; idx: number }>({ items: [], idx: 0 })
  const [best, setBest] = useState(0)

  const stageRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)
  const laneHiRef = useRef<HTMLDivElement>(null)
  const sqRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<HTMLDivElement>(null)
  const timerFillRef = useRef<HTMLElement>(null)

  const m = useRef<Mutable>({
    lane: 2, tilt: 0, hp: initialHp(), score: 0, combo: 0, level: 1,
    recipe: [], idx: 0, recipesInLevel: 0, timeLeft: 0, timeMax: 1,
    spawnIn: 0.6, lastCorrectSpawnMs: 0,
  })
  const poolRef = useRef<ReturnType<typeof createPool<Falling>> | null>(null)
  const phaseRef = useRef<Phase>('title')
  phaseRef.current = phase

  const syncHud = useCallback(() => {
    const c = m.current
    setHud({ hp: c.hp.hp, score: c.score, level: c.level, combo: comboMultiplier(c.combo) })
  }, [])
  const syncRecipe = useCallback(() => {
    setRecipe({ items: m.current.recipe, idx: m.current.idx })
  }, [])

  const newRecipe = useCallback((now: number) => {
    const c = m.current
    c.recipe = createRecipe(c.level)
    c.idx = 0
    c.timeMax = recipeTimeLimitSec()
    c.timeLeft = c.timeMax
    c.lastCorrectSpawnMs = now
    syncRecipe()
  }, [syncRecipe])

  const reset = useCallback(() => {
    poolRef.current?.clear()
    const now = performance.now()
    m.current = {
      lane: 2, tilt: 0, hp: initialHp(), score: 0, combo: 0, level: 1,
      recipe: [], idx: 0, recipesInLevel: 0, timeLeft: 0, timeMax: 1,
      spawnIn: 0.6, lastCorrectSpawnMs: now,   // 0 을 넣으면 기아 방지가 즉시 참이 된다
    }
    newRecipe(now)
    syncHud()
  }, [newRecipe, syncHud])

  const gameOver = useCallback(() => {
    const sc = m.current.score
    const b = loadBest()
    if (sc > b) { saveBest(sc); setBest(sc) } else setBest(b)
    setPhase('over')
  }, [])

  const input = useGameInput({
    enabled: () => phaseRef.current === 'playing',
    onMove: (dir) => {
      const c = m.current
      const next = Math.max(0, Math.min(LANES - 1, c.lane + dir))
      if (next !== c.lane) { c.lane = next; c.tilt = dir }
    },
    onTogglePause: () => {
      setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p))
    },
    onConfirm: () => {
      const p = phaseRef.current
      if (p === 'title' || p === 'tutorial' || p === 'over') { reset(); setPhase('playing') }
      else if (p === 'paused' || p === 'unlock') setPhase('playing')
    },
  })

  /** 정답 획득 처리. ★ 레벨업이 먼저다 — 새 레시피가 새 레벨 기준으로 나와야 한다 */
  const onCaught = useCallback((def: ItemDef, now: number) => {
    const c = m.current
    const target = c.recipe[c.idx]
    if (def.kind === 'fruit' && target && def.id === target.id) {
      c.combo += 1
      c.score += catchScore(c.combo)
      c.idx += 1
      if (c.idx >= c.recipe.length) {
        c.score += completionBonus(c.recipe.length)
        c.recipesInLevel += 1
        let leveled = false
        if (shouldLevelUp(c.recipesInLevel)) { c.level += 1; c.recipesInLevel = 0; leveled = true }
        newRecipe(now)
        if (leveled) {
          const fresh = newlyUnlocked(c.level)
          if (fresh.length > 0) { setUnlocked({ level: c.level, items: fresh }); setPhase('unlock') }
        }
      } else syncRecipe()
    } else {
      const before = c.hp.hp
      c.hp = applyDamage(c.hp, 1, now)
      if (c.hp.hp !== before) c.combo = 0
      if (isDead(c.hp)) { syncHud(); gameOver(); return }
    }
    syncHud()
  }, [gameOver, newRecipe, syncHud, syncRecipe])

  // ── 루프 ────────────────────────────────────────────────
  useEffect(() => {
    const itemsEl = itemsRef.current
    if (!itemsEl) return
    const pool = createPool<Falling>(itemsEl, () => {
      const d = document.createElement('div')
      d.style.cssText = 'position:absolute;top:0;left:0;width:48px;height:48px;will-change:transform'
      const img = document.createElement('img')
      img.width = 48; img.height = 48
      img.style.cssText = 'width:48px;height:48px;object-fit:contain;display:block'
      img.className = s.rim!
      d.appendChild(img)
      return d
    })
    poolRef.current = pool

    const step = (dt: number, now: number) => {
      const c = m.current
      input.pump(now)

      // ★ 시각 위치 === 논리 위치. 보간하지 않는다
      const rot = c.tilt * 11
      c.tilt *= Math.max(0, 1 - dt * (1000 / BALANCE.movement.snapTiltMs) / 10)
      const blink = now < c.hp.invulnerableUntil && Math.floor(now / 90) % 2 ? '0.35' : '1'
      if (sqRef.current) {
        sqRef.current.style.opacity = blink
        sqRef.current.style.transform =
          `translate3d(${laneX(c.lane) - (SQ_W - ITEM) / 2 + (0.5 - SQ_AXIS) * SQ_W}px,0,0) rotate(${rot.toFixed(2)}deg)`
      }
      if (laneHiRef.current) {
        laneHiRef.current.style.transform = `translate3d(${c.lane * LANE_W}px,0,0)`
      }
      if (phaseRef.current !== 'playing') return

      c.timeLeft -= dt
      const frac = Math.max(0, c.timeLeft / c.timeMax)
      if (timerFillRef.current) timerFillRef.current.style.transform = `scaleX(${frac.toFixed(4)})`
      timerRef.current?.classList.toggle(s.warn!, isWarning(c.timeLeft, c.timeMax))
      if (c.timeLeft <= 0) {
        c.hp = applyDamage(c.hp, BALANCE.recipe.expirePenaltyHp, now)
        c.combo = 0
        syncHud()
        if (isDead(c.hp)) { gameOver(); return }
        newRecipe(now)
        return
      }

      c.spawnIn -= dt
      if (c.spawnIn <= 0) {
        const target = c.recipe[c.idx]
        if (target) {
          const r = planSpawn({
            level: c.level, nowMs: now, live: pool.live.map((p) => p.data),
            target, playerLane: c.lane, lastCorrectSpawnMs: c.lastCorrectSpawnMs, spawnY: SPAWN_Y,
          })
          if (r.ok) {
            const item = pool.acquire({ def: r.def, lane: r.lane, y: SPAWN_Y, crossAt: r.crossAt })
            const img = item.el.firstElementChild as HTMLImageElement
            img.src = srcOf(r.def)
            img.alt = r.def.label
            item.el.style.transform = `translate3d(${laneX(r.lane)}px,${SPAWN_Y}px,0)`
            if (r.isCorrect) c.lastCorrectSpawnMs = now
            c.spawnIn = nextSpawnDelaySec(c.level)
          } else c.spawnIn = 0.08          // 규칙에 막히면 짧게 재시도
        }
      }

      const v = fallSpeedPxPerSec(c.level)
      for (const item of pool.live.slice()) {
        const f = item.data
        const prevY = f.y
        f.y += v * dt
        item.el.style.transform = `translate3d(${laneX(f.lane)}px,${f.y.toFixed(1)}px,0)`
        if (prevY <= LINE && f.y > LINE) {
          if (f.lane === c.lane) { onCaught(f.def, now); pool.release(item); continue }
          const target = c.recipe[c.idx]
          if (target && f.def.id === target.id && BALANCE.hp.missResetsCombo && c.combo > 0) {
            c.combo = 0; syncHud()
          }
        }
        if (f.y > DESPAWN_Y) pool.release(item)
      }
    }

    const loop = createLoop(step)
    loop.start()
    const off = onHidden(() => setPhase((p) => (p === 'playing' ? 'paused' : p)))
    return () => { loop.stop(); off(); pool.clear() }
  }, [gameOver, input, newRecipe, onCaught, syncHud])

  useEffect(() => { setBest(loadBest()) }, [])

  /** ?dbg 로 열리는 테스트 훅 — 레벨업까지 손으로 가는 비용이 커서 둔다 */
  useEffect(() => {
    if (!/[?&]dbg\b/.test(window.location.search)) return
    Object.assign(window, {
      __dbg: {
        jump(lv: number) {
          m.current.level = lv
          m.current.recipesInLevel = 0
          newRecipe(performance.now())
          syncHud()
          const fresh = newlyUnlocked(lv)
          setUnlocked({ level: lv, items: fresh })
          setPhase(fresh.length > 0 ? 'unlock' : 'playing')
        },
        state: () => ({
          phase: phaseRef.current, level: m.current.level, hp: m.current.hp.hp,
          score: m.current.score, recipe: m.current.recipe.map((f) => f.label),
        }),
      },
    })
  }, [newRecipe, syncHud])

  // 화면 맞춤
  useEffect(() => {
    const fit = () => {
      const el = document.getElementById('fit')
      if (!el) return
      const scale = Math.min(1, (window.innerHeight - 40) / 790, (window.innerWidth - 24) / 360)
      el.style.transform = `scale(${Math.max(0.5, scale).toFixed(3)})`
      el.style.height = `${790 * Math.max(0.5, scale)}px`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const start = () => { reset(); setPhase('playing') }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 12px 28px' }}>
      <div id="fit" className={s.fit}>
        <div className={s.stage} ref={stageRef}>
          <div className={s.bg} />
          <div className={s.laneHi} ref={laneHiRef} />
          <div className={s.items} ref={itemsRef} />
          <div className={s.squirrel} ref={sqRef}>
            <img src="/assets/scene/squirrel.png" alt="바구니를 든 다람쥐" className={s.rim2} />
          </div>

          <div className={s.hud}>
            <div className={s.hp} aria-label={`도토리 ${hud.hp} / ${BALANCE.hp.max}`}>
              {Array.from({ length: BALANCE.hp.max }, (_, i) => (
                <i key={i} className={i >= hud.hp ? s.off : undefined} />
              ))}
            </div>
            <span className={s.chip}>Lv {hud.level}</span>
            <button className={s.pause} type="button" aria-label="일시정지"
              onClick={() => setPhase((p) => (p === 'playing' ? 'paused' : p))}>
              <i /><i />
            </button>
            <span className={s.score}>{hud.score.toLocaleString()}</span>
          </div>

          {phase === 'loading' && <LoadingScreen onDone={() => setPhase('title')} />}
          {phase === 'title' && (
            <TitleScreen best={best} onStart={start} onTutorial={() => setPhase('tutorial')} />
          )}
          {phase === 'tutorial' && (
            <TutorialScreen onStart={start} onBack={() => setPhase('title')} />
          )}
          {phase === 'unlock' && (
            <UnlockCard level={unlocked.level} items={unlocked.items}
              onClose={() => setPhase('playing')} />
          )}
          {phase === 'paused' && (
            <PauseScreen onResume={() => setPhase('playing')} onRestart={start}
              onTitle={() => setPhase('title')} />
          )}
          {phase === 'over' && (
            <GameOverScreen score={hud.score} best={best} onRestart={start}
              onTitle={() => setPhase('title')} />
          )}
        </div>

        <div className={s.recipeBar}>
          <div className={s.timer} ref={timerRef}>
            <i ref={timerFillRef as React.RefObject<HTMLElement>} />
          </div>
          <div className={s.queue} aria-label="레시피 — 왼쪽부터 순서대로 받는다">
            {recipe.items.map((f, i) => (
              <span key={`${f.id}-${i}`} style={{ display: 'contents' }}>
                {i > 0 && <span className={s.arw}>›</span>}
                <span className={`${s.qi} ${i === recipe.idx ? s.now : i < recipe.idx ? s.done : ''}`}>
                  <img src={srcOf(f)} alt={f.label} />
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className={s.ctrl}>
          <button className={s.btn} type="button" aria-label="왼쪽 레인으로"
            onPointerDown={(e) => { e.preventDefault(); input.press(-1) }}
            onPointerUp={() => input.release(-1)}
            onPointerCancel={() => input.release(-1)}
            onPointerLeave={() => input.release(-1)}>◀</button>
          <button className={s.btn} type="button" aria-label="오른쪽 레인으로"
            onPointerDown={(e) => { e.preventDefault(); input.press(1) }}
            onPointerUp={() => input.release(1)}
            onPointerCancel={() => input.release(1)}
            onPointerLeave={() => input.release(1)}>▶</button>
        </div>
      </div>
    </main>
  )
}
