import type { ItemDef, ItemId } from '../types'

/**
 * 과일 16종 + 방해물 2종.
 *
 * 현행 아트는 docs/art/sprites.md · docs/art/pipeline.md 를 본다.
 * 심볼 id는 `t-<id>` 형식이며, 렌더 레이어는 `<use href="#t-apple">`로 참조한다.
 *
 * `unlockLevel`은 **실루엣 구분이 쉬운 순서**로 배치했다 —
 * 둥근 것끼리(사과·귤·복숭아·자몽·키위) 연달아 풀리지 않게 벌려 놓았다.
 */
export const ITEMS: Record<ItemId, ItemDef> = {
  // ── Lv1~5: 실루엣이 확연히 다른 것부터 ──────────────
  apple:      { id:'apple',      label:'사과',   kind:'fruit', neverInRecipe:false, unlockLevel:1,  weight:2, color:'#A80D10', placeholder:'🍎' },
  tangerine:  { id:'tangerine',  label:'귤',     kind:'fruit', neverInRecipe:false, unlockLevel:1,  weight:2, color:'#FE9E02', placeholder:'🍊' },
  banana:     { id:'banana',     label:'바나나', kind:'fruit', neverInRecipe:false, unlockLevel:1,  weight:2, color:'#FBB906', placeholder:'🍌' },
  strawberry: { id:'strawberry', label:'딸기',   kind:'fruit', neverInRecipe:false, unlockLevel:1,  weight:1, color:'#F2546B', placeholder:'🍓' },
  grape:      { id:'grape',      label:'포도',   kind:'fruit', neverInRecipe:false, unlockLevel:2,  weight:3, color:'#322356', placeholder:'🍇' },
  watermelon: { id:'watermelon', label:'수박',   kind:'fruit', neverInRecipe:false, unlockLevel:3,  weight:5, color:'#EF494E', placeholder:'🍉' },

  // ── Lv6~10 ────────────────────────────────────────
  pear:       { id:'pear',       label:'배',     kind:'fruit', neverInRecipe:false, unlockLevel:4,  weight:3, color:'#FDC05D', placeholder:'🍐' },
  cherry:     { id:'cherry',     label:'체리',   kind:'fruit', neverInRecipe:false, unlockLevel:5,  weight:1, color:'#ED363D', placeholder:'🍒' },
  lemon:      { id:'lemon',      label:'레몬',   kind:'fruit', neverInRecipe:false, unlockLevel:6,  weight:2, color:'#FBBC08', placeholder:'🍋' },
  pineapple:  { id:'pineapple',  label:'파인애플', kind:'fruit', neverInRecipe:false, unlockLevel:7, weight:5, color:'#FDBC07', placeholder:'🍍' },
  peach:      { id:'peach',      label:'복숭아', kind:'fruit', neverInRecipe:false, unlockLevel:8, weight:3, color:'#FD8780', placeholder:'🍑' },

  // ── Lv11~15: 둥근 계열은 마지막에, 서로 떨어뜨려 ──────
  blueberry:  { id:'blueberry',  label:'블루베리', kind:'fruit', neverInRecipe:false, unlockLevel:9, weight:1, color:'#085B81', placeholder:'🫐' },
  avocado:    { id:'avocado',    label:'아보카도', kind:'fruit', neverInRecipe:false, unlockLevel:10, weight:3, color:'#84AAA1', placeholder:'🥑' },
  kiwi:       { id:'kiwi',       label:'키위',   kind:'fruit', neverInRecipe:false, unlockLevel:11, weight:2, color:'#A7BB88', placeholder:'🥝' },
  grapefruit: { id:'grapefruit', label:'자몽',   kind:'fruit', neverInRecipe:false, unlockLevel:12, weight:3, color:'#FC847D', placeholder:'🍊' },
  apple_cut:  { id:'apple_cut',  label:'사과 단면', kind:'fruit', neverInRecipe:false, unlockLevel:13, weight:2, color:'#AA1116', placeholder:'🍎' },

  // ── 방해물: 레시피에 절대 등장하지 않는다 ──────────────
  stone:      { id:'stone',      label:'돌멩이',   kind:'obstacle', neverInRecipe:true, unlockLevel:3, weight:6, color:'#918D86', placeholder:'🪨' },
  twig:       { id:'twig',       label:'나뭇가지', kind:'obstacle', neverInRecipe:true, unlockLevel:3, weight:4, color:'#8A6B4F', placeholder:'🪵' },
}

export const ALL_ITEM_IDS = Object.keys(ITEMS) as ItemId[]

/**
 * ⚠️ 해금된 과일을 **전부** 스폰 풀에 넣지 않는다.
 * 16종이 동시에 떨어지면 시각적 소음이 과해져, 타깃을 찾는 것이 아니라
 * 화면을 훑는 작업이 된다. 최근 해금분 위주로 상한만큼만 활성화한다.
 */
export const ACTIVE_FRUIT_CAP = 8

export function unlockedFruits(level: number): ItemDef[] {
  return ALL_ITEM_IDS
    .map((id) => ITEMS[id])
    .filter((it) => !it.neverInRecipe && it.unlockLevel <= level)
}

/** 실제 스폰에 쓰는 풀 — 최신 해금분 ACTIVE_FRUIT_CAP개 */
export function activeFruits(level: number): ItemDef[] {
  const pool = unlockedFruits(level).sort((a, b) => a.unlockLevel - b.unlockLevel)
  return pool.slice(Math.max(0, pool.length - ACTIVE_FRUIT_CAP))
}

export function unlockedObstacles(level: number): ItemDef[] {
  return ALL_ITEM_IDS
    .map((id) => ITEMS[id])
    .filter((it) => it.neverInRecipe && it.unlockLevel <= level)
}
