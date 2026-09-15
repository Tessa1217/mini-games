# 웹뷰 대응

## 8. 웹뷰 대응 (`platform/`) — 지금 넣어둘 것

"나중에 웹뷰"를 전제로, **지금은 거의 공짜인데 나중에 붙이면 레이아웃·입력을 전면 수정해야 하는 것**만 선반영한다.

**⭐ 정적 번들 로딩 스킴 (지금 정해야 하는 결정)**
Next의 `output: 'export'`는 기본적으로 `/_next/static/…` **절대경로**를 생성한다.
호스트 앱이 `file://`로 로드하면 **전 자산이 404**다. 셋 중 하나를 택한다:
- (a) `assetPrefix: './'` 로 상대경로 생성 *(가장 간단)*
- (b) iOS `WKURLSchemeHandler` / Android `WebViewAssetLoader` 로 커스텀 스킴 제공
- (c) 앱 내 로컬 http 서버

"지금은 공짜, 나중에 붙이면 전면 수정"이라는 이 절의 선별 기준에 정확히 해당하므로 선반영한다.

**viewport**
- `100vh` 금지 → `100dvh` + `env(safe-area-inset-*)` (iOS 주소창·노치·홈 인디케이터)
- `<meta viewport>`에 `viewport-fit=cover`
- ⚠️ **`user-scalable=no`는 확대를 막는 수단이 아니다** — iOS Safari는 접근성 정책상 이를 무시한다.
  실제로 막는 것은 `touch-action: none` + 더블탭/`gesturestart` 차단이다. meta는 보조일 뿐,
  "이걸로 된다"고 믿으면 실기기에서 원인을 엉뚱한 데서 찾게 된다.
- 세로 고정: **웹뷰에서는 네이티브 호스트가 방향을 고정하는 것이 정답**이다
  (아래 `NativeBridge.lockOrientation`). Android Chrome은 fullscreen 진입 후
  `screen.orientation.lock('portrait')`도 동작한다.
  **안내 오버레이는 웹 단독 실행 시의 폴백**이지 유일한 수단이 아니다.

**제스처 차단**
- `touch-action: none`, `overscroll-behavior: none`
- `touchmove`를 **non-passive**로 `preventDefault()` — iOS 바운스
- `user-select: none`, `-webkit-tap-highlight-color: transparent`, `-webkit-touch-callout: none`
  — 버튼 홀드 조작이라 **반드시 필요** (길게 누르면 선택·컨텍스트 메뉴가 뜬다)

**생명주기**
- `visibilitychange` / `pagehide` → **자동 일시정지** (앱 전환·전화 수신)
- 복귀 시 dt clamp (`arch/stack.md`)
- 리스너·RAF·타이머에 teardown 경로 — 웹뷰는 SPA 내 재진입이 잦다

**브릿지 스텁 (`bridge.ts`)** — 인터페이스만 정의, no-op 구현
```ts
interface NativeBridge {
  isAvailable(): boolean
  /** 세로 고정 — 웹뷰에서 방향을 실제로 강제할 수 있는 유일한 경로 */
  lockOrientation(orientation: 'portrait'): void
  haptic(type: 'light' | 'error'): void
  shareScore(score: number): void
  close(): void
}
```
런타임에 `window.webkit?.messageHandlers`(iOS) / `window.AndroidBridge`(Android)를 **기능 감지**해서
있으면 호출, 없으면 no-op. 웹 개발 중엔 영향 0, 탑재 시점에 구현만 채우면 된다.
햅틱 웹 폴백은 `navigator.vibrate` (iOS 미지원 → 기능 감지 필수).

---
