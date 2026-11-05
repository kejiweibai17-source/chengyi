# 橙益印刷 — Refine Demo

給客戶預覽用的**前台首頁**＋**員工後台總覽**。

## 專案結構

| 目錄 | 說明 | 技術 | 預設網址 |
|------|------|------|----------|
| `web/` | 前台首頁 | Next.js + Tailwind | http://localhost:3000 |
| `admin/` | 員工後台 | Refine + Ant Design + Vite | http://localhost:5173 |
| `docs/` | 合約與技術定案 | — | — |

## 啟動 Demo

```bash
# 前台
pnpm --dir web dev

# 後台（另開終端）
pnpm --dir admin dev
```

或在根目錄：

```bash
pnpm dev:web
pnpm dev:admin
```

## 本階段範圍

- 前台：導覽、輪播、最新消息、關於摘要、服務入口、頁尾、右側工具列（示意）
- 後台：營運總覽儀表板；側欄預留訂單／商品／FAQ／會員等入口（佔位）

## 技術定案

Refine Admin ＋ Supabase ＋ Next.js 前台（見 `docs/00-技術定案_Refine-Supabase.md`）
