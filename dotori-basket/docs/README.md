# 문서 지도

무엇을 찾을 때 어디로 가는지만 적는다. 규칙의 본문은 각 파일에 있다.

| 찾는 것 | 파일 |
|---|---|
| 게임이 무엇인가 | `concept.md` |
| 레인 · 이동 · 획득 판정 | `rules/lane.md` |
| 무엇이 언제 떨어지나 | `rules/spawner.md` · `rules/spawner-policy.md` |
| 레시피 · 판정 · 제한시간 | `rules/recipe.md` |
| HP · 점수 · 콤보 | `rules/hp-score.md` |
| 레벨 곡선 · 난이도 표 | `rules/levels.md` · `rules/balance-policy.md` |
| 과일 해금 · 활성 풀 | `rules/items.md` |
| 키보드 · 터치 | `rules/input.md` |
| 화면 전환 · 상태 머신 | `rules/state-machine.md` |
| 스택 · React 성능 원칙 | `arch/stack.md` |
| 디렉터리 구조 | `arch/structure.md` |
| 웹뷰 대응 | `arch/webview.md` |
| 튜닝 노브 · 파생 함수 | `arch/tuning-api.md` |
| 무드 · 타이포 | `art/mood.md` |
| 색 (정본: `game/config/items.ts`) | `art/color.md` |
| 레이아웃 실측값 | `art/layout.md` |
| 실루엣 원칙 · 선 규격 | `art/silhouette.md` |
| 스프라이트 비율 · 에셋 목록 | `art/sprites.md` |
| 화면 5종 · 연출 | `art/screen-specs.md` |
| 접근성 | `art/a11y.md` |
| 에셋 만드는 법 | `art/pipeline.md` |
| 개발 페이즈 · 리스크 | `roadmap.md` |
| 왜 이렇게 됐나 (결정 이력) | `history/` |

## history/

바뀐 경위와 **폐기된 방향**이 들어간다. **현행 스펙으로 읽지 말 것.**

```
rev5-review.md          독립 검증 · 실행 검증
rev6-runtime.md         런타임 검증 (버그 2건)
rev6-density.md         난이도 재조율 — 밀도·제한시간
rev6-derived.md         파생 제약 (스폰 간격 하한 0.267초)
rev6-levelup.md         레벨업 정책 · 세션 길이 충돌 해소
rev6-art-pivot.md       아트 방향 재정의 (명암 6층 폐기)
rev6-trace-notes.md     벡터 추적 기록 (산출물은 라이선스 정리로 삭제됨)
rev7-speed.md           난이도 축을 개수에서 속도로
superseded-*.md         폐기 — 수채 · 동물 스킨 · 배경 테마
open-questions.md       미검증 · 미결 ❓
```

> ⚠️ 원본 `PLAN.md`·`DESIGN.md`는 분할 후 삭제됐다(이력에는 남아 있다).
> 절 번호(`§N`) 참조는 더 이상 유효하지 않으니 **파일 경로로 참조**한다.
