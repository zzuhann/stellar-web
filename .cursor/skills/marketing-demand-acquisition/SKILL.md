---
name: 'marketing-demand-acquisition'
description: 'UTM 參數架構與流量歸因追蹤。用於：設定 UTM 結構、分析流量來源、GA4 attribution 設定、追蹤 Threads / Google 等各渠道效益。針對 STELLAR（台灣 K-pop 活動地圖）的輕量版本，不含 B2B SaaS 的 paid media 或 partnership 內容。'
triggers:
  - UTM
  - utm_source
  - utm_campaign
  - attribution
  - 流量歸因
  - 渠道追蹤
  - GA4 attribution
metadata:
  version: 2.0.0
  author: Alireza Rezvani
  category: marketing
  domain: utm-attribution
  updated: 2026-05-02
---

# UTM 架構與流量歸因

輕量版流量追蹤指南，針對 STELLAR 平台的渠道結構（Threads、Google 搜尋、站子合作等）。

## Platform Context

- 平台：台灣 K-pop 生日咖啡廳活動地圖（STELLAR）
- Tech stack：Next.js App Router、Firestore、Cloudflare R2
- 目標用戶：台灣 K-pop 粉絲
- 主要頁面：首頁地圖、場地頁、活動頁
- 流量來源：Threads、Google 搜尋（中文關鍵字為主）

---

## UTM 架構

### 標準參數結構

```
utm_source={渠道}        // threads, google, instagram, line
utm_medium={類型}        // social, organic, referral, direct
utm_campaign={活動名稱}  // 2025-bts-birthday, kpop-map-launch
utm_content={變體}       // post-a, story-1, bio-link
utm_term={關鍵字}        // 僅付費搜尋使用
```

### STELLAR 常用渠道對照

| 渠道               | utm_source                   | utm_medium |
| ------------------ | ---------------------------- | ---------- |
| Threads 貼文       | `threads`                    | `social`   |
| Instagram 貼文     | `instagram`                  | `social`   |
| Instagram 限時動態 | `instagram`                  | `social`   |
| 粉絲站合作連結     | `fansite`                    | `referral` |
| Google 自然搜尋    | （不需要 UTM，GA4 自動識別） | —          |
| Line 社群          | `line`                       | `social`   |

### 命名規則

- 全部小寫，用 `-` 分隔詞彙
- 活動命名格式：`{年份}-{藝人縮寫}-{活動類型}`，例如 `2025-bts-birthday`
- 不要用空格或特殊字元

### 驗證

發出帶 UTM 的連結後，確認 GA4 → 客戶開發 → 流量獲取 中出現對應的 source / medium。

---

## Attribution 設定

### GA4 歸因模型

| 模型        | 適合情境                     |
| ----------- | ---------------------------- |
| Last Click  | 直接轉換效果評估（預設）     |
| First Click | 品牌認知渠道評估             |
| Data-Driven | 有足夠轉換數據後使用（推薦） |

STELLAR 目前流量以社群為主，建議先用 **Last Click** 建立基準，累積數據後切換 Data-Driven。

### GA4 Attribution 查看路徑

1. GA4 → 廣告 → 歸因 → 轉換路徑
2. 選擇轉換事件（`page_view`、`event_view` 等）
3. 設定回溯期：30 天（活動性質短促，90 天可能過長）

### 關鍵追蹤事件

```
page_view         // 自動追蹤
event_detail_view // 活動頁瀏覽（自定義）
map_interaction   // 地圖操作（自定義）
venue_click       // 場地點擊（自定義）
```

### 每週檢視指標

| 指標           | 位置                                    | 目的                       |
| -------------- | --------------------------------------- | -------------------------- |
| 各渠道流量占比 | GA4 → 流量獲取                          | 確認 Threads / Google 分布 |
| UTM 覆蓋率     | GA4 → 流量獲取 → source = (direct) 比例 | (direct) 過高代表 UTM 掉落 |
| 活動頁入口渠道 | GA4 → 事件 + 篩選 utm_source            | 了解哪個渠道帶來活動瀏覽   |

### UTM 掉落排查

若 GA4 顯示大量 `(direct) / (none)`：

1. 確認 Threads 貼文的連結是否帶完整 UTM
2. 確認縮網址服務是否保留 UTM 參數（部分服務會截斷）
3. 確認 Next.js router 換頁時 UTM 沒有被清掉

---

## 相關 Skills

- **analytics-tracking**: GA4 事件埋點的完整規格
- **ga4-tracking**: GA4 事件命名規範與實作
