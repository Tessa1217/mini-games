import type { BalanceConfig } from '../types'
import { lane } from './lane'
import { movement } from './movement'
import { hp } from './hp'
import { scoring } from './scoring'
import { recipe } from './recipe'
import { spawner } from './spawner'
import { levelUp } from './levelUp'
import { levels } from './levels'
import { endless } from './endless'

/** 밸런싱 단일 지점. 시스템 코드에 수치 리터럴을 남기지 않는다. */
export const BALANCE: BalanceConfig = {
  lane, movement, hp, scoring, recipe, spawner, levelUp, levels, endless,
}

export { lane, movement, hp, scoring, recipe, spawner, levelUp, levels, endless }
