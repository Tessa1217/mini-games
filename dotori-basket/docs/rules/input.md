# 입력

## 5. 입력

| 액션 | 데스크탑 | 모바일·웹뷰 |
|---|---|---|
| 좌/우 1레인 | `←` `→` / `A` `D` (홀드 repeat) | 하단 **좌/우 버튼** (탭 + 홀드 repeat) |
| 일시정지 | `Esc` | 우상단 버튼 |
| 시작/재시작 | `Enter` `Space` | 버튼 탭 |

버튼은 **최소 56×56px**, 하단 코너(엄지 도달 범위), `env(safe-area-inset-bottom)` 반영.

### 5-1. 홀드 구현 주의

`onClick`으로 만들면 홀드 연타가 안 된다. `onPointerDown`에서 repeat 타이머 시작,
**`onPointerUp` · `onPointerCancel` · `onPointerLeave` 셋 다**에서 정지.
**`pointercancel`/`leave`를 빠뜨리면 손가락이 버튼 밖으로 미끄러졌을 때 다람쥐가 계속 달린다** — 웹뷰에서 특히 자주 나는 버그.
`setPointerCapture`로 포인터를 버튼에 고정하는 편이 안전하다.

### 5-2. ⭐ 키보드 입력 규칙 (웹 + 웹뷰 공통)

포인터 홀드의 함정(`rules/input.md`)에는 **키보드 판박이가 그대로 존재**한다. 다섯 가지를 명시한다.

| 항목 | 규칙 | 안 지키면 |
|---|---|---|
| **OS 키 리피트** | `event.repeat === true`인 `keydown`은 **무시**하고, 반복은 자체 게이트(`moveCooldownMs`)로만 낸다 | OS 리피트(~30ms)가 쿨다운을 무시해 데스크탑에서 난이도 노브가 무력화 |
| **키 식별** | `event.key`가 아니라 **`event.code`**(`KeyA`/`KeyD`/`ArrowLeft`/`ArrowRight`) | 한글 입력 상태에서 `event.key`가 `'ㅁ'`/`'ㅇ'`을 반환해 A/D가 죽는다 |
| **키 상태 유실** | `blur` · `visibilitychange`에서 **눌린 키 상태 전체를 리셋** | 키를 누른 채 앱이 전환되면 `keyup`이 안 와서 다람쥐가 계속 달린다 (`rules/input.md`의 `pointercancel` 문제와 동일) |
| **기본 동작** | 게임이 쓰는 키에 `preventDefault()` | 방향키로 페이지가 스크롤된다 |
| **포커스 충돌** | 게임 단축키는 `document` 레벨에서 처리하되 **포커스가 버튼에 있으면 무시**(또는 `pointerup`에서 `blur()`) | `rules/input.md`이 좌/우를 실제 `<button>`으로 만들므로, 게임오버 후 Space가 **포커스된 방향 버튼을 클릭**한다 |

> 인앱 웹뷰에는 하드웨어 키보드가 없는 것이 기본이지만 **블루투스 키보드 연결은 가능**하다.
> 위 규칙은 웹·웹뷰 양쪽에 동일하게 적용한다.

### 5-3. 추상화

`useGameInput`은 **의도만** 내보낸다: `{ moveDir: -1 | 0 | 1, pause: boolean }`.
게임 로직은 키보드인지 터치인지 모른다.

### 5-4. 접근성

- 좌/우는 **실제 `<button>`** (div + onClick 금지)
- 과일은 **색만으로 구분하지 않음** — 실루엣을 충분히 다르게
- `prefers-reduced-motion` → 파티클·흔들림 축소

---
