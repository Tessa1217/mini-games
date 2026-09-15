# 컬러 토큰

> **아이템 색의 정본은 `game/config/items.ts`다.** 이 표를 고칠 때는 코드를 먼저 고친다.
> 과거 문서의 팔레트(구 형태 시스템 표 · 채도 상향안)는 어느 것도 현행이 아니다 —
> `history/rev6-art-pivot.md`에만 남아 있다.

## 아이템 (코드에서 추출 · 2026-09-15)

| 이름 | id | 해금 | 색 |
|---|---|---|---|
| 사과 | `apple` | Lv1 | `#A80D10` |
| 귤 | `tangerine` | Lv1 | `#FE9E02` |
| 바나나 | `banana` | Lv1 | `#FBB906` |
| 딸기 | `strawberry` | Lv1 | `#F2546B` |
| 포도 | `grape` | Lv2 | `#322356` |
| 수박 | `watermelon` | Lv3 | `#EF494E` |
| 배 | `pear` | Lv4 | `#FDC05D` |
| 체리 | `cherry` | Lv5 | `#ED363D` |
| 레몬 | `lemon` | Lv6 | `#FBBC08` |
| 파인애플 | `pineapple` | Lv7 | `#FDBC07` |
| 복숭아 | `peach` | Lv8 | `#FD8780` |
| 블루베리 | `blueberry` | Lv9 | `#085B81` |
| 아보카도 | `avocado` | Lv10 | `#84AAA1` |
| 키위 | `kiwi` | Lv11 | `#A7BB88` |
| 자몽 | `grapefruit` | Lv12 | `#FC847D` |
| 돌멩이 | `stone` | Lv3 | `#918D86` |
| 나뭇가지 | `twig` | Lv3 | `#8A6B4F` |

`color`는 **레시피 큐·HUD의 대표색**이고, 실제 스프라이트의 채색은 아니다.
스프라이트 규격은 `art/silhouette.md`를 본다.

## 실사용 배경 (프로토타입 실측)

| 토큰 | 값 | 비고 |
|---|---|---|
| 하늘 | `#C4E1F4` | `assets/scene/bg.jpg` 상단에서 실측. 단색 연장이 가능한 이유 |
| 잔디 | `#B4C391` | 수평선 아래 |
| 캐노피 | `#A4B183` | 나무 잎 |
| 줄기 | `#8E6F57` | |

## UI 토큰 (설계값 — 구현 시 실측으로 갱신)

```
--cream        #FFF6E3   카드·패널 배경      --cream-deep  #F3E6CC
--wood         #C89B6A   나무 프레임          --wood-deep   #A57A4E
--ink          #5A4632   텍스트               --ink-soft    #8A7660
--accent       #FF9F5A   강조                 --danger      #E8765A
--acorn-full   #B5763F   HP 있음              --acorn-empty #D9C7AE
--lane-line    rgba(255,255,255,.06)
--lane-active  rgba(255,255,255,.10)
```

레인 하이라이트는 장식이 아니라 **조작 피드백**이다. 즉시 스냅 구조(`rules/lane.md`)에서
"내가 지금 어느 레인인가"를 보여주는 유일한 단서이므로 반드시 넣는다.
