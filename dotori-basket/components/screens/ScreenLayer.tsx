import type { ItemDef } from '@/game/types'
import type { Phase } from '@/hooks/usePhase'
import LoadingScreen from './LoadingScreen'
import TitleScreen from './TitleScreen'
import TutorialScreen from './TutorialScreen'
import UnlockCard from './UnlockCard'
import PauseScreen from './PauseScreen'
import GameOverScreen from './GameOverScreen'

/** phase → 화면. **분기는 여기서만 진다** — 흩어지면 전이 순서를 읽을 수 없게 된다 */
export default function ScreenLayer(p: {
  phase: Phase
  best: number
  score: number
  unlocked: { level: number; items: ItemDef[] }
  onStart: () => void
  onResume: () => void
  onGo: (phase: Phase) => void
}) {
  switch (p.phase) {
    case 'loading':
      return <LoadingScreen onDone={() => p.onGo('title')} />
    case 'title':
      return <TitleScreen best={p.best} onStart={p.onStart} onTutorial={() => p.onGo('tutorial')} />
    case 'tutorial':
      return <TutorialScreen onStart={p.onStart} onBack={() => p.onGo('title')} />
    case 'unlock':
      return <UnlockCard level={p.unlocked.level} items={p.unlocked.items} onClose={p.onResume} />
    case 'paused':
      return <PauseScreen onResume={p.onResume} onRestart={p.onStart} onTitle={() => p.onGo('title')} />
    case 'over':
      return <GameOverScreen score={p.score} best={p.best} onRestart={p.onStart}
        onTitle={() => p.onGo('title')} />
    default:
      return null
  }
}
