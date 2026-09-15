# mini-games

개인 프로젝트로 만드는 미니 게임 모음입니다.

## 도토리 숲 바구니 (`dotori-basket/`)

바구니를 든 다람쥐가 **레시피에 적힌 순서대로** 떨어지는 과일을 받는 게임입니다.
순서가 아닌 과일이나 방해물을 받으면 도토리(HP)가 깎이고, 다 닳으면 끝납니다.

- 레인 5개 · 세로 화면 360 × 640 · 웹뷰 탑재 전제
- 레벨이 오르면 과일이 해금되고 **낙하 속도**가 빨라집니다
- 문서: [`dotori-basket/docs/README.md`](dotori-basket/docs/README.md)

```bash
cd dotori-basket
python3 -m http.server 8742
# → http://127.0.0.1:8742/prototype/index.html
```

## 라이선스

코드는 MIT. 게임 아트는 SpriteCook으로 생성한 뒤 직접 다듬은 것으로,
[SpriteCook 이용약관](https://www.spritecook.ai/terms) §6에 따라 배포합니다.
