# game/ — 순수 게임 로직

**React를 import하지 않는다.** 규칙 로직을 프레임워크와 분리해두면 테스트가 쉽고,
렌더를 Canvas로 바꾸거나 다른 환경에 이식할 때 그대로 쓸 수 있다.

## 여기서 읽을 문서

`docs/rules/*` 와 `docs/arch/tuning-api.md` **면 충분하다.**
아트·레이아웃·웹뷰 문서는 읽지 않아도 된다.

**예외 하나** — `config/items.ts`는 에셋과 얽혀 있어
`docs/rules/items.md` + `docs/art/sprites.md`를 함께 읽는다.

## 구조

```
types.ts      계약(단위·범위·필수)만. 설계 근거는 docs/ 에
tuning.ts     tuningForLevel · recipeTimeLimitSec · correctGapSec · recipeMinCompletionSec
config/       값만. index.ts 가 BALANCE 9키를 조립한다
  └ items.ts  ⚠️ BalanceConfig 의 멤버가 아니다 — 별도 export
```

- 소비자는 `config/index.ts`의 `BALANCE`만 import한다
- **`BALANCE.levels`를 직접 읽지 않는다** — 항상 `tuning.ts` 경유.
  `tuning.ts` 자신은 유일한 정당 소비자다
- 조각은 전부 `satisfies` 로 타입을 고정한다. 안 하면 `rulePriority`가 `string[]`로 넓어져
  조립 시점에 에러가 난다

## 주석

서사·이력(왜 이 값으로 바뀌었나)은 `docs/`에. 코드에는 아래만 남긴다.

- **파생 관계** — `simultaneousCrossLimit: lane.count - 2` 처럼 가능하면 주석이 아니라 **코드로**
- **하한 근접** — `spawnIntervalMinSec: 0.27` 이 스포너 하한 0.267에 붙어 있다는 사실
- **의도된 0** — `healOnLevelUp: 0` 이 미구현이 아니라 결정이라는 표시
