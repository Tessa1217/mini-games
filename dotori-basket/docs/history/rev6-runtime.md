# rev.6 — 런타임 검증

### 14-3. 런타임 검증 (2026-09-15 · `prototype/index.html`)

에셋을 물린 프로토타입을 브라우저에서 실제로 돌려 확인했다. 봇 플레이 67초 기준.

```
결과      : Lv3 도달 · 920점 · 67초 · HP 소진 종료
불변식    : 시각 위치 === 논리 위치 확인
            lane2 → laneX=156 → 스프라이트 transform 139 (=156-17, 오프셋만큼)
            lane0 → laneX=12  → -5.  보간 항 없음
해금      : Lv2에서 바나나, Lv3에서 딸기 등장 (items.ts unlockLevel과 일치)
간격 축소 : 1.50s → 0.96s (표값 그대로)
동시통과  : 4초 창 최대 1~2회, simultaneousCrossLimit 3을 넘긴 적 없음
프레임    : 120fps 유지, 고정 타임스텝 1/60 + dt 클램프 1/30
```

**발견해 고친 버그 2건**

1. **`hidden` 속성 무력화** — `#over{display:flex}`가 UA 스타일시트의 `[hidden]{display:none}`을
   특이도로 이겨, 게임 오버 오버레이가 **로드 직후부터 항상 떠 있었다**. 게임 자체는 밑에서
   정상 동작했기 때문에(키보드 입력은 통과) 조용히 지나갈 뻔했다.
   → `[hidden]{display:none!important}`를 전역으로 못박음. `el.hidden`으로 토글하는 모든 곳에 해당한다.
2. **`reset()`의 기준 시각** — `newRecipe(0)`으로 호출해 `lastCorrectSpawn=0`이 되는 바람에
   `performance.now()`와 비교하는 기아 방지 조건이 즉시 참이 되어 **첫 스폰이 항상 강제 정답**이었다.
   → `performance.now()`를 넘기도록 수정.
