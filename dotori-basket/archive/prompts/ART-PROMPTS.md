> ⚠️ **보존용 기록.** 에셋 생성 도구(SpriteCook 등) 사용은 중단이 확정됐다.
> 새 에셋은 `docs/art/pipeline.md`의 절차를 따른다. 이 문서의 수치는 현행이 아니다.

# Midjourney 아트 생성 프롬프트

- 작성일: 2026-09-14
- 전제: `DESIGN.md`의 컬러 토큰 · 형태 축 · 라이팅 규칙
- ⚠️ 파라미터 문법은 버전마다 바뀐다. `--v 7`은 예시이며 **본인 계정의 현재 버전**으로 바꿔 쓸 것.

---

## 0. 2D냐 3D냐 — 렌더 전략과 직결된다

Midjourney가 내놓는 건 **2D 이미지**다. 어느 쪽으로 가느냐가 그대로 구현 방식이 된다.

| 경로 | 아트 | 회전 연출 | 렌더 | 번들 |
|---|---|---|---|---|
| **2D 스프라이트** | MJ 결과를 바로 사용 | 평면 회전(◯) · 빛이 도는 것(✗) | **DOM + CSS transform** | three.js **불필요** |
| **3D 모델** | MJ를 컨셉아트로 → Blender | 완전한 3D 회전 | three.js 캔버스 | +116 KB gzip |

**2D의 손실은 생각보다 작다.** 스프라이트도 평면 회전은 자유롭게 되고, 떨어지는 과일이 빙글빙글
도는 연출은 그것만으로 충분히 자연스럽다. 잃는 건 **회전할 때 빛이 표면을 따라 움직이는 것** 하나다.

→ **2D로 가면 three.js를 뺀다.** 그러면 `PLAN.md` rev.5 §6(DOM + CSS transform, framer-motion은
연출 전용)이 **원래 설계 그대로 유효**해진다. 번들 116KB도 아낀다.

> 아래 프롬프트는 §1~4가 **3D 렌더 룩**, §7~10이 **2D 일러스트 룩**이다. 둘 다 뽑아보고 고르면 된다.

---

## 1. 스타일 앵커 — 이걸 **가장 먼저** 뽑는다

10종 아이템 + 캐릭터를 따로따로 뽑으면 스타일이 제각각이 된다.
먼저 앵커 한 장을 만들고, 그 결과를 **`--sref`로 모든 후속 생성에 물린다.**

```
3D rendered game asset, cozy life simulation game art style, soft matte
clay-like surfaces, gentle global illumination, single warm key light from
upper left, soft bounce light filling the shadows, rounded chunky forms with
no sharp edges, muted pastel palette of warm cream, moss green and warm brown,
a single object centered on a flat neutral beige backdrop, even studio lighting,
subtle cool rim light separating the object from the background
--ar 1:1 --style raw --stylize 150 --v 7
```

마음에 드는 결과가 나오면 그 이미지 URL(또는 `--sref random`이 돌려준 코드)을 적어두고
아래 모든 프롬프트의 `<SREF>` 자리에 넣는다. `--sw 100`이 기본이고, 스타일을 더 강하게 물리려면 올린다.

---

## 2. 다람쥐

### 2-1. 기본 (대기)

```
a small round chibi squirrel game character carrying a woven wicker basket
balanced on top of its head, warm tan orange fur, soft cream belly patch,
large glossy dark oval eyes, small rounded ears with pale pink inner, one big
fluffy tail curling upward along its right side, short stubby arms and feet,
calm friendly expression, front facing three quarter view, full body visible
with generous margin, soft matte 3D render, key light from upper left,
centered on a flat neutral beige backdrop
--ar 1:1 --style raw --stylize 150 --sref <SREF> --v 7
```

### 2-2. 상태 변주 (위 프롬프트에서 표시된 부분만 교체)

| 상태 | 교체할 구절 |
|---|---|
| 이동 | `calm friendly expression` → `leaning to one side mid-step, eager expression, tail swinging` |
| 피격 | `calm friendly expression` → `startled expression, eyes wide, ears flattened, small sweat drop` |
| 환호 | `calm friendly expression` → `happy expression, eyes closed in a smile, both arms raised in celebration` |

**캐릭터 일관성**: 상태 변주는 스타일뿐 아니라 **같은 캐릭터**여야 하므로,
2-1 결과를 옴니/캐릭터 레퍼런스(`--oref` 또는 `--cref`, 버전에 따라 다름)로 함께 물린다.

---

## 3. 아이템 10종

### 3-1. 공통 템플릿

```
a single stylized 3D <ITEM>, <SILHOUETTE>, <COLOR>, <SURFACE>, rounded chunky
proportions, isolated and centered on a flat neutral beige backdrop, full object
visible with generous margin, soft matte 3D game asset render, key light from
upper left with one small specular highlight, soft cool rim light on the shadow side
--ar 1:1 --style raw --stylize 120 --sref <SREF> --v 7 --no shadow on ground, text, watermark, multiple objects
```

### 3-2. 아이템별 채워 넣을 값

`<SILHOUETTE>`은 `DESIGN.md` §4의 **형태 축**을 그대로 옮긴 것이다. 색만으로 구분하지 않기 위한 핵심이므로 빼지 말 것.

| 아이템 | `<SILHOUETTE>` | `<COLOR>` | `<SURFACE>` |
|---|---|---|---|
| 딸기 | inverted triangle shape, wide at the top tapering to a rounded point at the bottom, tiny seed dots, small green calyx on top | coral pink | glossy fruit skin |
| 사과 | round with a shallow dip at the top, one small leaf on a short stem | deep warm red | glossy fruit skin |
| 귤 | a perfect simple sphere, tiny flat green stem nub on top, the simplest roundest shape | warm orange | slightly dimpled citrus skin, soft sheen |
| 배 | snowman silhouette, narrow at the top and wide at the bottom, western pear shape | pale yellow green | soft matte fruit skin with faint speckles |
| 포도 | a tight cluster of many small round berries forming a triangle, one curling stem | soft muted purple | glossy berries |
| 복숭아 | round with a clear vertical crease down the center, two small leaves | soft blush pink | velvety fuzzy skin |
| 레몬 | a horizontal oval lying sideways with a small pointed tip at each end | bright warm yellow | glossy citrus skin |
| 수박 | the largest sphere of the set, dark green stripes over lighter green | green | glossy rind |
| **돌멩이** | an angular faceted rock with flat planes and hard edges, clearly not food | neutral warm grey | **completely matte, no gloss, no highlight, dry rough stone** |
| **나뭇가지** | a short horizontal twig lying sideways with one small side branch | warm brown | **completely matte dry bark, no gloss** |

> **방해물 2종은 `--no` 에 광택을 추가**한다:
> `--no shadow on ground, text, watermark, multiple objects, gloss, shine, specular highlight`
>
> 과일에만 광택을 주는 것이 "먹을 수 있음"의 시각 언어다(`DESIGN.md` §4). 이게 섞이면 방해물이 과일로 읽힌다.

---

## 4. 배경

```
a cozy tiny planet landscape seen from near ground level, strongly curved
horizon like a small globe, lush rounded grass field, a few chunky stylized
trees and bushes clustered near the horizon line, soft fluffy clouds in a clear
blue sky, warm afternoon sunlight from the upper left, gentle atmospheric haze
at the horizon, no characters, no buildings, vertical mobile game background,
the upper half is open empty sky with nothing in it
--ar 9:16 --style raw --stylize 200 --sref <SREF> --v 7 --no characters, people, text, ui, buildings
```

**`the upper half is open empty sky`가 핵심이다.** 화면 위쪽 절반이 과일이 떨어지는 영역이라
거기에 디테일이 들어가면 아이템이 안 읽힌다. 나무는 반드시 수평선 부근에만 있어야 한다.

계절/시간대 변주가 필요하면 `warm afternoon sunlight` 부분을 바꾼다
(`soft morning light` / `golden hour light` / `overcast soft light`).

---

## 5. 뽑은 뒤 해야 할 것

1. **배경 제거** — MJ는 알파 채널을 주지 않는다. 아이템·캐릭터는 누끼를 따야 한다
   (평평한 단색 배경으로 뽑으라고 한 이유가 이것이다).
2. **크기 정규화** — 10종이 제각각 크기로 나온다. `DESIGN.md` §4의 크기 축(딸기 S → 수박 L)에 맞춰
   후처리에서 통일한다. **수박이 딸기보다 커야 한다** — 크기도 구분 축이다.
3. **라이팅 방향 검수** — 한 장이라도 빛이 오른쪽에서 오면 그 아이템만 장면에서 튄다. 전량 확인.
4. **흑백 테스트** — 채도를 뺀 상태로 10종을 나란히 놓고 구분되는지 본다.
   구분이 안 되면 형태 축이 약한 것이므로 그 아이템만 다시 뽑는다.
5. **`items.ts` 갱신** — `color` / `placeholder`를 스프라이트 경로로 교체.

---

## 6. 프롬프트 조정 요령

- **과하게 그려진(over-painted) 느낌이면** → `--style raw`가 들어있는지 확인, `--stylize` 값을 낮춘다
- **프롬프트를 잘 안 따르면** → `--stylize`를 더 낮춘다 (아이템은 100 이하도 괜찮다)
- **스타일이 제각각이면** → `--sref`의 `--sw` 값을 올린다 (기본 100)
- **여러 개가 한 장에 나오면** → `--no multiple objects, collage, grid` 추가

출처: [Midjourney Style Reference 공식 문서](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference) ·
[Midjourney v7 파라미터 가이드](https://promptmake.net/blog/midjourney-v7-guide)


---

# 2D 경로

같은 10종 · 같은 형태 축 · 같은 광원 방향을 쓴다. 달라지는 건 **표현 매체**뿐이다.
2D에서는 실루엣이 3D보다 **더** 중요하다 — 입체 음영이 형태를 설명해주지 않기 때문이다.

## 7. 스타일 앵커 — 두 방향을 먼저 비교한다

"2D"는 범위가 넓어서 한 번에 정하기 어렵다. 아래 둘을 각각 뽑아 보고 고른다.

### 7-A. 소프트 셀 — 동물의 숲에 가장 가까움

```
2D game asset illustration, cozy cute art style, soft cel shading with two
gentle tones, no outline, warm soft edges, rounded chunky shapes, muted pastel
palette of cream, moss green and warm brown, gentle light coming from the upper
left, soft ambient occlusion at the bottom, clean and readable, a single object
centered on a flat neutral beige background, no perspective distortion, front view
--ar 1:1 --style raw --stylize 150 --v 7
```

### 7-B. 구아슈/수채 — 더 따뜻하고 손맛 있음

```
2D game asset illustration, cozy storybook art style, soft gouache painting
with visible brush texture and gentle paper grain, warm hand painted feel,
no harsh outline, rounded friendly shapes, muted warm palette of cream, moss
green and soft brown, light from the upper left, a single object centered on a
flat neutral beige background, flat front view
--ar 1:1 --style raw --stylize 200 --v 7
```

> 7-A는 깔끔하고 리사이즈에 강하다. 7-B는 따뜻하지만 작게 줄이면 텍스처가 뭉갠다.
> **모바일에서 아이템이 40~50px로 표시**되므로, 망설여지면 7-A를 권한다.

고른 결과를 `--sref`로 아래 전부에 물린다.

## 8. 다람쥐 (2D)

```
a small round chibi squirrel character carrying a woven wicker basket balanced
on top of its head, warm tan orange fur, soft cream belly patch, large glossy
dark oval eyes with a tiny white highlight, small rounded ears with pale pink
inner, one big fluffy tail curling upward along its right side, short stubby
arms and feet, gentle friendly smile, standing front view facing the viewer,
full body visible with generous margin, cozy 2D game character illustration,
soft shading, light from upper left, flat neutral beige background
--ar 1:1 --style raw --stylize 150 --sref <SREF> --v 7 --no outline, text, watermark, shadow on ground
```

상태 변주는 §2-2 표와 동일하다(대기 / 이동 / 피격 / 환호).
**같은 캐릭터**를 유지하려면 기본 결과를 캐릭터 레퍼런스(`--oref` 또는 `--cref`)로 함께 물린다.

> 2D는 3D와 달리 **각도를 새로 그려야** 한다. 다행히 이 게임은 정면 고정이라 4상태만 있으면 된다.

## 9. 아이템 10종 (2D)

### 공통 템플릿

```
a single stylized <ITEM>, <SILHOUETTE>, <COLOR>, <SURFACE>, cozy 2D game icon
illustration, soft shading from the upper left, rounded chunky proportions,
bold readable silhouette, isolated and centered on a flat neutral beige
background, flat front view with no perspective
--ar 1:1 --style raw --stylize 120 --sref <SREF> --v 7 --no outline, text, watermark, multiple objects, shadow on ground
```

`<SILHOUETTE>` · `<COLOR>`는 **§3-2 표를 그대로 쓴다.** 형태 축은 매체와 무관하게 동일하다.

`<SURFACE>`만 2D용으로 바꾼다:

| 구분 | `<SURFACE>` |
|---|---|
| 과일 8종 | `smooth skin with a soft highlight in the upper left and a gentle darker tone at the bottom` |
| **돌멩이** | `flat matte surface with simple hard-edged facets, no highlight, clearly not food` |
| **나뭇가지** | `dry matte bark with a few simple texture lines, no highlight` |

방해물에는 `--no` 에 `gloss, shine, highlight`를 추가한다 — 3D 경로와 같은 이유다.

## 10. 배경 (2D)

```
a cozy 2D game background illustration, soft rolling grass field in the lower
half with a gently curved horizon, a few chunky stylized trees and round bushes
clustered along the horizon line, soft fluffy clouds in a calm blue sky, warm
afternoon light, layered depth with lighter colors toward the horizon, hand
painted cozy storybook feel, vertical mobile game background, the entire upper
half is open empty sky with nothing in it
--ar 9:16 --style raw --stylize 200 --sref <SREF> --v 7 --no characters, people, text, ui, buildings, outline
```

3D 경로와 동일하게 **위쪽 절반은 반드시 비워야** 한다. 거기가 과일이 떨어지는 영역이다.

**패럴랙스를 쓰려면 레이어를 나눠 뽑는다** — `sky only` / `distant trees only on a flat background` /
`grass ground only`로 3장을 따로 만들면 `DESIGN.md` §8의 3레이어 패럴랙스를 그대로 구현할 수 있다.

## 11. 2D로 확정되면 바꿀 것

- `PLAN.md` §6 — three.js 검토 결과를 "2D 스프라이트 + DOM/CSS transform"으로 확정
- `PLAN.md` §6-2 — 과일 노드를 DOM으로 두는 원래 원칙이 그대로 유효 (60fps 값은 state에 두지 않기)
- `items.ts` — `color`/`placeholder`를 스프라이트 경로로 교체
- 낙하 회전은 CSS `transform: rotate()`로 처리 (평면 회전이면 충분하다)


---

## 12. 한 번에 뽑기 — 에셋 시트 프롬프트

10개를 하나씩 복붙할 필요는 없다. **먼저 시트 한 장으로 뽑는다.**

**해상도가 충분하다.** MJ 기본 출력이 약 1024², 업스케일하면 2048². 4×3 그리드면 칸당 약 512px인데,
게임에서 아이템은 논리 50px × DPR 2 = **100px**로 표시된다. 512px면 넉넉하다.
즉 시트가 스타일 확인용을 넘어 **최종 에셋으로도 쓸 수 있다.**

### 12-1. 아이템 시트 (이것부터)

```
cozy 2D game icon sheet, soft cel shading with no outline, muted warm pastel
palette, light from the upper left, flat front view, neat evenly spaced grid on
a plain flat cream background, ten separate objects:
a coral pink strawberry with an inverted triangle shape,
a deep red apple with a small leaf,
a perfectly round orange tangerine,
a pale yellow green pear with a wide bottom,
a purple cluster of round grapes,
a blush pink peach with a vertical crease,
a bright yellow lemon lying sideways with pointed tips,
a large green watermelon with dark stripes,
an angular matte grey stone with hard flat facets,
a short brown twig lying horizontally,
the watermelon is the largest and the strawberry is the smallest,
the stone and the twig are matte with no shine, the fruits have a soft highlight
--ar 1:1 --style raw --stylize 150 --v 7
--no text, labels, numbers, captions, watermark, outline, drop shadow, background scenery
```

### 12-2. 캐릭터 시트 (두 번째)

```
cozy 2D game character sheet, the same small chibi squirrel drawn four times in
a row on a plain flat cream background, warm tan orange fur, cream belly, large
glossy dark oval eyes, small round ears with pink inner, one big fluffy tail
curling up along its right side, carrying a woven wicker basket balanced on top
of its head in every pose, front view facing the viewer:
first standing calm and friendly,
second leaning to one side mid step with the tail swinging,
third startled with wide eyes and flattened ears,
fourth cheering with both arms raised and eyes closed in a smile,
soft cel shading with no outline, light from the upper left, consistent character
design across all four
--ar 16:9 --style raw --stylize 150 --v 7
--no text, labels, numbers, captions, watermark, outline, drop shadow
```

### 12-3. 배경 (세 번째)

§10 프롬프트를 그대로 쓴다.

---

### 왜 셋으로 나누나

아이템 10개와 캐릭터 4포즈를 **한 장에 다 넣으면 칸당 해상도가 절반으로 떨어지고**,
MJ가 두 종류의 주제를 섞으면서 형태 지시를 놓치기 시작한다.
비율도 다르다 — 아이템은 정사각(`1:1`), 캐릭터 나열은 가로(`16:9`)가 맞다.

### 순서

1. **12-1을 먼저 뽑는다** — 무드가 맞는지 여기서 판가름 난다
2. 마음에 들면 그 결과를 **`--sref`로 물려** 12-2, 12-3을 뽑는다 → 세 장이 한 세트로 읽힌다
3. 시트에서 **특정 아이템만 이상하게 나오면**(MJ가 10개 형태 지시를 다 지키는 경우는 드물다)
   그 아이템만 §9 개별 프롬프트로 다시 뽑아 교체한다

**개별 프롬프트(§8~9)는 처음부터 쓰는 게 아니라 보정용이다.**

### 흔한 실패와 대응

| 증상 | 대응 |
|---|---|
| 글자·숫자 라벨이 들어감 | `--no`에 `text, labels, numbers, captions` — 시트 프롬프트에선 거의 항상 필요 |
| 아이템이 서로 겹치거나 뭉침 | `neat evenly spaced grid`를 앞쪽으로 옮기고 `--no collage, overlapping` 추가 |
| 10개가 아니라 다른 개수 | MJ는 개수를 잘 못 센다. 여러 번 돌려 개수가 맞는 것을 고르는 게 빠르다 |
| 돌멩이가 과일처럼 반짝임 | `--no gloss, shine, highlight on the stone`은 잘 안 먹는다 → 돌멩이·나뭇가지만 §9로 따로 뽑는다 |
| 크기 관계가 무시됨 | 후처리에서 맞춘다. 크기는 구분 축이므로 반드시 정리할 것 |


---

## 13. 복붙용 — 한 줄 버전

Midjourney는 **문서를 첨부하지 않는다.** Discord에서 `/imagine` 입력 후 `prompt` 칸에
아래 한 줄을 그대로 붙여넣으면 된다. (`DESIGN.md`의 규칙은 이미 이 문장들 안에 녹아 있다.)

### ① 아이템 시트 — 이것부터

```
cozy 2D game icon sheet, soft cel shading with no outline, muted warm pastel palette, light from the upper left, flat front view, neat evenly spaced grid on a plain flat cream background, ten separate objects: a coral pink strawberry with an inverted triangle shape, a deep red apple with a small leaf, a perfectly round orange tangerine, a pale yellow green pear with a wide bottom, a purple cluster of round grapes, a blush pink peach with a vertical crease, a bright yellow lemon lying sideways with pointed tips, a large green watermelon with dark stripes, an angular matte grey stone with hard flat facets, a short brown twig lying horizontally, the watermelon is the largest and the strawberry is the smallest, the stone and the twig are matte with no shine, the fruits have a soft highlight --ar 1:1 --style raw --stylize 150 --v 7 --no text, labels, numbers, captions, watermark, outline, drop shadow, background scenery
```

### ② 캐릭터 시트 — ①이 마음에 든 뒤

```
cozy 2D game character sheet, the same small chibi squirrel drawn four times in a row on a plain flat cream background, warm tan orange fur, cream belly patch, large glossy dark oval eyes, small round ears with pink inner, one big fluffy tail curling up along its right side, carrying a woven wicker basket balanced on top of its head in every pose, front view facing the viewer, first standing calm and friendly, second leaning to one side mid step with the tail swinging, third startled with wide eyes and flattened ears, fourth cheering with both arms raised and eyes closed in a smile, soft cel shading with no outline, light from the upper left, consistent character design across all four --ar 16:9 --style raw --stylize 150 --v 7 --no text, labels, numbers, captions, watermark, outline, drop shadow
```

### ③ 배경

```
cozy 2D game background illustration, soft rolling grass field in the lower half with a gently curved horizon, a few chunky stylized trees and round bushes clustered along the horizon line, soft fluffy clouds in a calm blue sky, warm afternoon light, layered depth with lighter colors toward the horizon, hand painted cozy storybook feel, vertical mobile game background, the entire upper half is open empty sky with nothing in it --ar 9:16 --style raw --stylize 200 --v 7 --no characters, people, text, ui, buildings, outline
```

---

### `--sref` 붙이는 법

①이 마음에 들면 그 이미지를 스타일 기준으로 삼아 ②③에 물린다. 셋이 한 세트로 읽히게 하는 유일한 방법이다.

1. ① 결과 이미지를 Discord에서 열어 **이미지 주소 복사**
2. ②③ 프롬프트의 **`--ar` 바로 앞**에 붙여넣는다:

```
... consistent character design across all four --sref https://복사한주소 --ar 16:9 --style raw --stylize 150 --v 7 --no text, ...
```

스타일이 약하게 먹으면 `--sref <주소> --sw 200`처럼 `--sw`를 올린다(기본 100, 최대 1000).

### 버전 플래그

`--v 7`은 예시다. 본인 계정의 현재 버전으로 바꾼다 — 모르면 **`--v 7`을 아예 빼면** 계정 기본값으로 돌아간다.
