# SpriteCook Prompts — Dotori Forest Basket

- 작성일: 2026-09-15
- 대상 도구: `generate_game_art` (SpriteCook MCP)
- 무드: 귀여운 핸드 드로잉 · 평면 채색 · 굵은 균일 윤곽선

---

## 0. ⚠️ 순서가 결과를 좌우한다 — 앵커 먼저

아이템 20종을 각각 따로 뽑으면 **스타일이 100% 제각각**이 된다.
SpriteCook에는 `style_asset_ids`가 있고, 이게 MidJourney의 `--sref`에 해당한다.

```
1) 앵커 1장 생성            → asset_id 확보
2) 나머지 전부 생성          → style_asset_ids=[앵커 asset_id]
3) 마음에 드는 3~4개 추가    → style_asset_ids에 누적 (최대 10개)
```

세 번째 단계가 중요하다. 앵커 하나보다 **잘 나온 결과 여러 장을 같이 물리면** 스타일이 훨씬 안정된다.

> ⚠️ **`generate_character`를 쓰지 말 것.** 그 도구는 64×64 **픽셀아트** 전용이다.
> 우리는 핸드 드로잉이므로 동물도 `generate_game_art` + `pixel=false`로 만든다.

---

## 1. 공통 설정

```jsonc
{
  "pixel": false,              // ← 필수. 기본값이 true(픽셀아트)다
  "bg_mode": "transparent",
  "smart_crop": true,
  "smart_crop_mode": "tightest",
  "model": "gemini-3.1-flash-image",
  "resolution": "1K",          // 게임에서 ~50px로 표시된다. 2K/4K는 낭비
  "width": 256, "height": 256
}
```

### ⚠️ `colors`는 아이템마다 다르게 준다

전체 팔레트 13색을 매 호출에 넘기면, 바나나를 요청하면서 모델에게 **크림슨·보라·초록을
쥐여주는 셈**이다. 엉뚱한 색이 섞여 들어와 재생성으로 이어진다.
**그 아이템이 실제로 쓰는 2~4색만** 넘긴다. (표의 `colors` 열 참조)

---

## 2. Style Anchor — 이것부터, 그리고 이것만 4장

```
A single red apple, round with a shallow dip at the top, one small leaf,
cute hand-drawn children's storybook illustration, uniform flat color
throughout with a single solid tone per area, thick even dark brown
outline of consistent width, soft wobbly hand-drawn contour with gentle
imperfections, muted sage green leaf, bold readable silhouette,
minimal detail, one object only, centered with generous margin, plain
empty background
```

```jsonc
{ "variations": 4, "colors": ["#C4202B", "#8FA88C", "#4A3A2A"] }
```

**앵커에만 `variations: 4`를 쓴다.** 나머지는 전부 1이다.
앵커가 흔들리면 뒤따르는 20장이 전부 흔들려서 재생성 비용이 20배로 돌아온다 —
여기서만 4배를 쓰는 게 가장 싸게 먹힌다.

마음에 드는 것의 `asset_id`를 기록하고, 이후 모든 호출에 `style_asset_ids`로 넘긴다.

---

## 3. Fruits

### 공통 꼬리말 (fruit tail)

```
, cute hand-drawn children's storybook illustration, uniform flat color
throughout with a single solid tone per area, thick even dark brown
outline of consistent width, soft wobbly hand-drawn contour, muted sage
green leaves and stem, minimal detail, one object only, centered with
generous margin, plain empty background
```

### 프롬프트 본문과 색

첫 줄이 **실루엣 축**이다 — 게임에서 구분을 만드는 것은 이 부분이다.

| # | 아이템 | 본문 | `colors` |
|---|---|---|---|
| 1 | Apple | `A single red apple, round with a shallow dip at the top, one small leaf` | `#C4202B #8FA88C #4A3A2A` |
| 2 | Tangerine | `A single tangerine, distinctly flattened and wider than it is tall, tiny flat stem nub on top` | `#F79020 #8FA88C #4A3A2A` |
| 3 | Banana | `A single banana, bold crescent curve lying sideways, small dark tip at each end` | `#F2C118 #4A3A2A` |
| 4 | Strawberry | `A single strawberry, inverted triangle tapering to a rounded point, tiny pale seed dots, green calyx crown on top` | `#EE3D5C #8FA88C #FFF6E3 #4A3A2A` |
| 5 | Grapes | `A bunch of grapes, tight triangular cluster of small round berries, one curling stem` | `#4A2A6B #8FA88C #4A3A2A` |
| 6 | Watermelon slice | `A single triangular watermelon slice, red flesh with a thick green rind along the bottom curve, a few dark seeds` | `#EE3D5C #3F8B47 #4A3A2A` |
| 7 | Pear | `A single pear, snowman silhouette narrow at the top and wide at the bottom, short stem` | `#A9C246 #8FA88C #4A3A2A` |
| 8 | Cherries | `A pair of cherries, two round berries joined by two thin curving stems` | `#C4202B #8FA88C #4A3A2A` |
| 9 | Lemon | `A single lemon, oval lying sideways with a small pointed nipple at each end` | `#F2C118 #4A3A2A` |
| 10 | Pineapple | `A single pineapple, tall oval body with a diamond crosshatch texture and a spiky green crown on top` | `#F2C118 #3F8B47 #4A3A2A` |
| 11 | Peach | `A single peach, round with a clear vertical crease down the middle, two small leaves` | `#F97A62 #8FA88C #4A3A2A` |
| 12 | Blueberries | `A small scattered group of four round blueberries, deep blue, each with a tiny star crown` | `#2A4C78 #4A3A2A` |
| 13 | Avocado | `A single avocado cut in half, pear-shaped outline with a large round pit in the center` | `#A9C246 #8A6B4F #4A3A2A` |
| 14 | Kiwi | `A single kiwi cut in half, round slice with a pale center, tiny seed ring, fuzzy brown rim` | `#A9C246 #8A6B4F #FFF6E3 #4A3A2A` |
| 15 | Orange slice | `A single orange slice, round cross-section with wedge segments radiating from the center` | `#F79020 #FFF6E3 #4A3A2A` |
| 16 | Persimmon | `A single persimmon, flattened round orange fruit with a large four-pointed green calyx on top` | `#F97A62 #8FA88C #4A3A2A` |
| 17 | Mango | `A single mango, plump asymmetric oval with a soft curve, blushed on one side` | `#F79020 #EE3D5C #4A3A2A` |
| 18 | Plum | `A single plum, round with a shallow vertical groove, deep purple, one small leaf` | `#4A2A6B #8FA88C #4A3A2A` |
| 19 | Fig | `A single fig, teardrop shape wide at the bottom narrowing to a short stem at the top` | `#4A2A6B #8FA88C #4A3A2A` |
| 20 | Star fruit | `A single star fruit cut in a cross-section, clean five-pointed star shape, pale yellow` | `#F2C118 #4A3A2A` |

> 14 키위 · 15 오렌지 단면 · 16 감은 전부 "둥근 것"이라 실루엣이 겹친다.
> 해금 레벨을 벌려 동시에 활성화되지 않게 해 두었다 (`items.ts`의 `ACTIVE_FRUIT_CAP = 8`).

---

## 4. Obstacles — 2종

방해물은 **"먹을 수 없다"가 형태만으로 읽혀야** 한다. 꼬리말이 다르다.

### 공통 꼬리말 (obstacle tail)

```
, hand-drawn children's storybook illustration, uniform flat color
throughout with a single solid tone per area, completely matte dull
surface, thick even dark brown outline of consistent width, angular
hand-drawn contour, desaturated muted color, clearly inedible,
one object only, centered with generous margin, plain empty background
```

| # | 아이템 | 프롬프트 본문 |
|---|---|---|
| 21 | Stone | `A single grey stone, angular faceted rock with flat planes and hard edges` |
| 22 | Twig | `A single short brown twig lying horizontally, one small side branch, dry bark` |

---

## 5. Animals — 8종

### 공통 꼬리말 (animal tail)

```
, cute chibi animal game character, hand-drawn children's storybook
illustration, uniform flat color throughout with a single solid tone per
area, thick even dark brown outline of consistent width, big round head,
tiny simple solid dot eyes, small pink blush cheeks, short stubby arms and
legs, gentle friendly expression, standing upright facing the viewer in
front view, carrying a small woven wicker basket balanced flat on top of
its head, ears staying below the basket rim, full body visible with
generous margin, plain empty background
```

> ⚠️ **`ears staying below the basket rim`을 빼지 말 것.**
> 바구니 테두리가 게임의 **판정선**이다. 귀가 그보다 높으면 플레이어가
> 어디서 받아지는지 오인한다 (`DESIGN.md` §13-2).

| # | 동물 | 프롬프트 본문 | 실루엣 축 |
|---|---|---|---|
| 1 | Squirrel | `A cute chibi squirrel with warm tan orange fur, cream belly, and one big fluffy tail curling up beside its body` | 큰 꼬리 |
| 2 | Rabbit | `A cute chibi rabbit with cream white fur and two long soft ears drooping down along the sides of its head` | 늘어진 귀 |
| 3 | Cat | `A cute chibi orange tabby cat with pointed triangular ears, striped markings, and thin whiskers` | 뾰족한 귀 |
| 4 | Bear | `A cute chibi brown bear with a broad round face and small round ears` | 넓은 얼굴 |
| 5 | Fox | `A cute chibi fox with rust orange fur, sharp pointed ears, and a bushy tail with a white tip` | 흰 꼬리끝 |
| 6 | Raccoon | `A cute chibi raccoon with grey fur, a dark mask marking across its eyes, and a ringed striped tail` | 눈가 마스크 |
| 7 | Hedgehog | `A cute chibi hedgehog with a cream face and a rounded back covered in soft short spikes` | 가시 등 |
| 8 | Panda | `A cute chibi panda with white fur, black round ears, and black patches around both eyes` | 흑백 패치 |

**실루엣 축이 서로 다르다는 점이 중요하다.** 게임 크기(약 72px)에서는
털색이 아니라 **귀와 꼬리 모양**으로 구분된다.

---

## 5.5 최소 비용 전략

재생성이 비용의 전부다. 프롬프트를 아끼는 게 아니라 **재생성을 줄이는 것**이 절약이다.

| 전략 | 이유 |
|---|---|
| **앵커에만 `variations: 4`** | 앵커가 흔들리면 뒤따르는 20장이 전부 흔들린다. 여기서만 4배 쓰는 게 제일 싸다 |
| **앵커 확인 전에 배치 금지** | 20장 돌린 뒤 스타일이 틀리면 20장이 통째로 버려진다 |
| **먼저 8종만** | `ACTIVE_FRUIT_CAP = 8` — 초반 레벨에서 실제로 쓰이는 건 8종뿐이다. 나머지 12종은 게임이 굴러간 뒤에 뽑아도 늦지 않다 |
| **`resolution: "1K"` 고정** | 게임 표시 크기가 ~50px다. 2K/4K는 크레딧만 더 쓰고 보이지 않는다 |
| **`colors`를 아이템별로** | 팔레트 전체를 주면 엉뚱한 색이 섞여 재생성을 부른다 |
| **틀린 것만 `edit_asset_id`** | 색 하나 틀렸다고 처음부터 다시 뽑지 않는다 |

### 권장 1차 배치 — 앵커 + 7종

```
앵커: apple (variations 4)
1차:  tangerine · banana · strawberry · grapes ·
      watermelon slice · pear · cherries   (각 variations 1)
```

이 8종이면 **Lv1~7 구간이 전부 플레이 가능**하다.

---

## 6. 뽑은 뒤

1. **투명 배경 확인** — `bg_mode: "transparent"`로도 잔여 배경이 남으면
   `remove_background(asset_id=...)`로 정리한다.
2. **크기 정규화** — 수박이 딸기보다 커야 한다. 크기도 구분 축이다(`DESIGN.md` §4).
3. **광원 방향 검수** — 한 장이라도 빛이 반대에서 오면 그 아이템만 장면에서 튄다.
4. **흑백 테스트** — 채도를 빼고 나란히 놓아 구분되는지 본다. 안 되면 그 항목만 재생성.
5. **`asset_id` 기록** — `spritecook-assets.json`에 저장해 두면 다음 세션에서
   `style_asset_ids`로 재사용할 수 있다.

## 7. 재생성이 필요할 때

- **한 아이템만 어긋남** → `style_asset_ids`에 잘 나온 것 3~4개를 물리고 그 항목만 다시
- **색만 틀림** → `edit_asset_id`로 직접 수정 (`make the leaf sage green instead of bright green`)
- **전체가 어긋남** → 앵커부터 다시. 앵커가 흔들리면 나머지가 전부 흔들린다
