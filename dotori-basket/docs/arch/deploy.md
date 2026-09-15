# 배포 — Cloudflare Workers

## ⭐ 어댑터를 쓰지 않는다

이 앱에는 **서버에서 도는 코드가 한 줄도 없다.** 서버 액션 · 라우트 핸들러 ·
`generateMetadata` · 서버 `fetch` · ISR 전부 0건이고, 모든 컴포넌트가 `'use client'` 다.
`output: 'export'` 가 만들어내는 `out/` 은 그 자체로 완성된 정적 사이트다.

그래서 `@opennextjs/cloudflare` · `@cloudflare/next-on-pages` 를 **넣지 않는다.**
둘 다 SSR·미들웨어를 Worker 로 돌리기 위한 물건이라, 정적 페이지 앞에 런타임을 하나
더 세우는 것 말고 얻는 게 없다. 설정 파일과 `nodejs_compat` 플래그, Node API 제약이
전부 순비용으로 붙는다.

> 어댑터가 필요해지는 시점은 **서버 코드가 생길 때**다. 랭킹 API 나 세션 저장이
> 들어오면 그때 이 문서를 다시 연다.

## ⭐ 출력 경로는 대시보드가 아니라 `wrangler.jsonc` 가 정한다

Workers Builds 화면에는 «Build output directory» 칸이 **없다.** Pages 를 쓰다 오면
설정을 빠뜨린 줄 알고 헤매게 되는데, Workers 는 그 값을 저장소의 설정 파일에서 읽는다.

```jsonc
"assets": { "directory": "./out", "not_found_handling": "404-page" }
```

`main` 이 없는 **정적 자산 전용 Worker** 다. 서버 코드가 0줄이라 넣을 스크립트가 없다.
`not_found_handling` 을 `single-page-application` 으로 두면 모든 경로가 `index.html` 로
덮여 `out/404.html` 이 죽는다 — 라우트가 늘어날 때 조용히 문제가 된다.

설정이 코드에 있으므로 대시보드 칸을 사람이 맞출 일이 없다. **이게 Pages 보다 나은 점이다.**

## 대시보드 설정 (Workers Builds · Git 연동)

| 칸 | 값 |
|---|---|
| Root directory | `dotori-basket` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Version command | `npx wrangler versions upload` (미리보기 브랜치용, 비워도 된다) |
| Node 버전 | `.node-version` 이 지정한다 (현재 20.20.2) |

로컬에서는 `npm run preview`(= 빌드 + `wrangler dev`), `npm run deploy` 로 같은 경로를 탄다.
배포 전 검증은 `npx wrangler deploy --dry-run` — 자산을 읽기만 하고 올리지 않는다.

## ⚠️ 빌드가 깨지는 세 가지

### 1. `wrangler.jsonc` 가 없다

Deploy command 는 도는데 무엇을 올릴지 모른다.

```
✘ Missing entry-point: The entry-point should be specified via the command line
```

### 2. Node 버전

Next 16 은 `engines.node >= 20.9.0` 이다. 오래 전에 만든 Cloudflare 프로젝트는 빌드
이미지가 **Node 18** 이라 코드와 무관하게 시작부터 죽는다.

```
You are using Node.js 18.x. For Next.js, Node.js version >= v20.9.0 is required.
```

저장소의 `.node-version` 으로 고정한다 — 대시보드 환경변수보다 낫다. 사람이 잊어도 따라온다.

### 3. Root directory 미지정

저장소 루트에는 `package.json` 이 없다(게임 하나 = 폴더 하나).

```
npm error enoent Could not read package.json
```

## Pages 로 갈 경우

Workers 대신 Pages 프로젝트로 만들면 `wrangler.jsonc` 없이 대시보드 칸으로만 굴러간다.
그때는 **Framework preset 을 반드시 `None`** 으로 둔다 — Next.js 프리셋이 빌드 명령을
`next export`(Next 14 에서 제거됨)나 `next-on-pages` 로 채운다. 프리셋은 **생성 화면에만
있고** 이후에는 설정 항목 자체가 사라지므로, 만든 뒤에는 빌드 명령 칸의 실제 값을 본다.
Build output directory 는 `out`.

## 웹뷰 번들은 별도다

`npm run build:webview` 는 `assetPrefix: './'` 로 상대 경로를 만든다. `file://` 로 열리기
때문이고, Cloudflare 배포본과 **섞어 쓰면 안 된다** — `arch/webview.md`.
