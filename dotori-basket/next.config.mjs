// 웹뷰 번들은 file:// 로 열려 상대 경로가 필요하고, Cloudflare Pages 는 http 서빙이라
// 절대 경로가 맞다. 한 설정으로 둘 다 덮으면 라우트가 늘어나는 순간 청크 로딩이
// 조용히 깨진다. → docs/arch/webview.md
const isWebview = process.env.BUILD_TARGET === 'webview'

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  assetPrefix: isWebview ? './' : undefined,
}
