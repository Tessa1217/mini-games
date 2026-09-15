# 배포 — Cloudflare

## ⭐ 어댑터를 쓰지 않는다

이 앱에는 **서버에서 도는 코드가 한 줄도 없다.** 서버 액션 · 라우트 핸들러 ·
`generateMetadata` · 서버 `fetch` · ISR 전부 0건이고, 모든 컴포넌트가 `'use client'` 다.
`output: 'export'` 가 만들어내는 `out/` 은 그 자체로 완성된 정적 사이트다.

그래서 `@opennextjs/cloudflare` · `@cloudflare/next-on-pages` 를 **넣지 않는다.**
둘 다 SSR·미들웨어를 Worker 로 돌리기 위한 물건이라, 정적 페이지 앞에 런타임을 하나
더 세우는 것 말고 얻는 게 없다. 설정 파일(`wrangler.toml` · `open-next.config.ts`)과
`nodejs_compat` 플래그, Node API 제약이 전부 순비용으로 붙는다.

> 어댑터가 필요해지는 시점은 **서버 코드가 생길 때**다. 랭킹 API 나 세션 저장이
> 들어오면 그때 이 문서를 다시 연다. 그 전에는 정적이 맞다.

## Cloudflare Pages 설정 (Git 연동)

| 항목 | 값 |
|---|---|
| Framework preset | **None** ⚠️ |
| Root directory | `dotori-basket` |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node 버전 | `.node-version` 파일이 지정한다 (현재 20.20.2) |

## ⚠️ 빌드가 깨지는 세 가지

### 1. Node 버전 — 가장 흔하다

Next 16 은 `engines.node >= 20.9.0` 이다. 오래 전에 만든 Cloudflare 프로젝트는 빌드
이미지가 **Node 18** 로 고정돼 있어, 코드와 무관하게 시작부터 죽는다.

```
You are using Node.js 18.x. For Next.js, Node.js version >= v20.9.0 is required.
```

저장소에 `.node-version` 을 두면 대시보드 설정 없이 고정된다 — **환경변수보다 이쪽이 낫다.**
사람이 대시보드를 고치는 걸 잊어도 따라온다.

### 2. Framework preset 을 Next.js 로 잡음

프리셋이 빌드 명령을 대신 채우는데, 그 명령이 `next export`(Next 14 에서 제거됨)나
`next-on-pages` 를 부른다.

```
error   `next export` has been removed in favor of 'output: export' in next.config.js
```

**preset 은 None 으로 두고 명령을 직접 적는다.**

### 3. Root directory 미지정

저장소 루트에는 `package.json` 이 없다(게임 하나 = 폴더 하나). 루트에서 빌드하면
`npm run build` 가 실행될 대상 자체가 없다.

```
npm error enoent Could not read package.json
```

## 웹뷰 번들은 별도다

`npm run build:webview` 는 `assetPrefix: './'` 로 상대 경로를 만든다. `file://` 로 열리기
때문이고, Cloudflare 배포본과 **섞어 쓰면 안 된다** — `arch/webview.md`.
