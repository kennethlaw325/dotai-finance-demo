# Dot.ai Finance Demo

Personal finance webapp · 3 features：

- 📸 拍單據 → MiMo Vision 自動入賬（多選 / 揀資料夾）
- 🏢 公司報銷追蹤 + CSV 匯出
- 🎯 月度預算超支警示（80% 黃 / 100% 紅）

For Dot.ai Codex 網課 Webinar 2026-06-11 live demo.

## Stack

- Vite + React 18 + TypeScript strict
- Tailwind v3 + Lucide
- LocalStorage persistence（零 backend）
- Xiaomi MiMo V2 Omni（multimodal API，OpenAI-compatible schema）

## Data privacy

100% client-side。所有收據圖、欄位、預算、API key 都存喺 user 自己 browser LocalStorage。
冇 backend、冇 cookie tracking，唯一 outbound 係送圖去 MiMo Vision endpoint 解析。

## BYOK（Bring Your Own Key）

學員自己喺 Settings UI 入 MiMo API key（存 LocalStorage，唔會 send 去任何 server，亦唔會 bundle 入 production build）。
冇 key 自動走 mock mode（5 個 sample 收據循環）。

API key 喺 https://platform.xiaomimimo.com/ 攞。

## Local dev

```bash
NODE_OPTIONS=--use-system-ca npm install   # Norton SSL workaround
cp .env.example .env.local                 # 可選：填 dev key 慳每次入 UI
npm run dev                                # http://localhost:5180
NODE_OPTIONS=--use-system-ca npm run build
npm run preview                            # http://localhost:4180
```

## Vercel deploy

```bash
git init && git add -A && git commit -m "Initial commit"
git remote add origin git@github.com:kennethlaw325/dotai-finance-demo.git
git push -u origin main
```

然後 vercel.com → Import Project → 揀 repo → 一 click deploy。**唔需要設 env vars**（key 由用戶自己喺 UI 入）。

## Why mimo-v2-omni（唔係 v2.5-pro）

V2.5-pro 唔支援 image input，會回 404 `"No endpoints found that support image input"`。
Omni 係呢個 endpoint 唯一 multimodal 嘅 model（2026-05 verify）。
