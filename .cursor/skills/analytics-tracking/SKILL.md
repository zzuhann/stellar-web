---
name: analytics-tracking
description: When the user wants to plan analytics tracking before implementing a feature. Use when the user says "先規劃埋點", "要追蹤什麼", "要分析什麼", or wants to think through what events to track and why. Output is a Tracking Plan document. For GA4 implementation code, see ga4-tracking. For UTM parameters, see marketing-demand-acquisition. 要開始實作某個功能之前，先規劃埋點
metadata:
  version: 2.0.0
---

# Analytics Tracking 規劃指南

你是 STELLAR 的 analytics 規劃專家。目標是在功能實作前，幫助思考「要追蹤什麼、為什麼追蹤、怎麼命名」，輸出 Tracking Plan 文件。

> **分工**
>
> - 本 skill：規劃（事件清單、命名、Tracking Plan 文件）
> - `ga4-tracking`：實作（sendGAEvent 用法、code 範例）
> - `marketing-demand-acquisition`：UTM 參數策略與流量歸因

## Platform Context

- 平台：台灣 K-pop 生日咖啡廳活動地圖（STELLAR）
- Tech stack：Next.js App Router、Firestore、Cloudflare R2
- Analytics 工具：GA4（`@next/third-parties/google`，**無 GTM**）
- 目標用戶：台灣 K-pop 粉絲
- 主要頁面：首頁地圖、場地頁、活動頁
- 流量來源：Threads、Google 搜尋（中文關鍵字為主）

---

## Initial Assessment

規劃前先確認：

1. **要回答什麼問題？** - 這些數據會用來做什麼決策？
2. **轉換定義** - 什麼行為算成功？（加收藏？看活動詳情？點地圖標記？）
3. **目前已有哪些 tracking？** - 參考 `docs/events.md`

---

## Core Principles

### 1. 為決策而追蹤

- 每個事件都要能回答一個具體問題
- 「想看看」不是夠好的理由
- 少而精 > 多而雜

### 2. 從問題出發

- 我需要知道什麼？
- 拿到數據後會做什麼行動？
- 從答案往回推需要追蹤什麼

### 3. 命名一致

- 命名規範以 `ga4-tracking` skill 為準
- 規劃時先用語意命名，實作前對齊命名規則

---

## STELLAR 事件類型

完整已實作事件清單：`docs/events.md`

**事件類型參考**：[references/event-library.md](references/event-library.md)

| 類型        | 說明                | 範例                                            |
| ----------- | ------------------- | ----------------------------------------------- |
| 頁面瀏覽    | 使用者進入某頁      | `page_view`（用 usePageView / PageViewTracker） |
| 內容互動    | 對活動 / 藝人的操作 | `add_to_favorite`, `click_map_marker`           |
| 搜尋 / 篩選 | 尋找內容            | `search_artist`                                 |
| 用戶行為    | 帳號相關            | `login`, `sign_up`                              |
| 分享        | 傳播內容            | `share_event`                                   |
| 表單送出    | 提交活動 / 藝人資料 | `submit_event`                                  |
| 導航        | 頁面內跳轉          | `click_home`, `click_event_detail`              |

---

## Tracking Plan Framework

每個事件規劃時需確認：

```
Event Name      | 觸發時機       | content_id      | 要回答的問題
--------------- | ------------- | --------------- | ----------------
add_to_favorite | 點收藏按鈕時   | eventId         | 哪些活動最受歡迎？
```

### 規劃步驟

1. 列出功能的用戶旅程（user journey）
2. 在每個關鍵節點問：「這個行為值得追蹤嗎？它能幫助什麼決策？」
3. 確認事件命名（對齊 `ga4-tracking` 的命名規範）
4. 確認 `content_id` 要傳什麼值
5. 確認有沒有現成事件可重用（`docs/events.md`）

---

## Output Format

```markdown
# [功能名稱] Tracking Plan

## 目標

- 要回答的問題：
- 轉換定義：

## 事件清單

| 事件名稱 | 觸發時機     | event_page | content_id | 備註 |
| -------- | ------------ | ---------- | ---------- | ---- |
| xxx      | 使用者點擊 X | `/page`    | eventId    |      |

## 不追蹤的項目（及原因）

- xxx：目前沒有對應的決策需要這個數據
```

---

## 實作

Tracking Plan 確認後，實作細節參考 `ga4-tracking` skill。

---

## Related Skills

- **ga4-tracking**：具體 code 怎麼寫（sendGAEvent、usePageView）
- **marketing-demand-acquisition**：UTM 參數架構與流量歸因
- **page-view-tracking**：頁面瀏覽追蹤實作規格
