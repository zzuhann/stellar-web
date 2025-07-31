# 台灣生咖地圖前端專案

## 專案概述

台灣 K-pop 藝人生日應援咖啡活動平台前端，基於後端 API 建立互動性地圖與管理介面。

## 可用的 API 端點

📋 台灣生咖地圖 API 文件 v2.0

🌐 Base URL

http://localhost:3001/api

---

🎭 藝人管理 API

GET /api/artists

功能：取得藝人列表（支援狀態篩選）
權限：公開（但 pending/rejected 需管理員）

查詢參數：
{
status?: 'approved' | 'pending' |
'rejected' // 狀態篩選
}

回應格式：
Artist[] // 藝人陣列

使用範例：
GET /api/artists #
所有藝人
GET /api/artists?status=approved #
已審核藝人
GET /api/artists?status=pending #
待審核（需管理員）

POST /api/artists

功能：新增藝人
權限：需登入
請求體：
{
stageName: string; //
藝名（必填）
realName?: string; // 本名
birthday?: string; // 生日
YYYY-MM-DD
profileImage?: string; // 照片 URL
}

PUT /api/artists/:id/approve

功能：審核通過藝人
權限：需管理員

PUT /api/artists/:id/reject

功能：拒絕藝人申請
權限：需管理員

---

☕ 活動管理 API

GET /api/events ⭐ 全新升級

功能：取得活動列表（支援進階篩選和分頁）
權限：公開

查詢參數：
{
// 篩選參數
search?: string;
//
搜尋關鍵字（標題、藝人、地址、描述）
artistId?: string;
// 特定藝人ID
status?: 'all' | 'active' | 'upcoming' |
'ended'; // 時間狀態，預設 'active'
region?: string;
// 地區關鍵字（台北市、信義區等）

    // 分頁參數
    page?: number;
        // 頁數，預設 1
    limit?: number;
        // 每頁筆數，預設 50，最大 100

}

回應格式：
{
events: CoffeeEvent[];
// 活動陣列
pagination: {
page: number;
// 當前頁數
limit: number;
// 每頁筆數
total: number;
// 總筆數
totalPages: number;
// 總頁數
};
filters: {
// 套用的篩選條件
search?: string;
artistId?: string;
status?: string;
region?: string;
};
}

時間狀態說明：

- active: 進行中（開始時間 ≤ 現在 ≤
  結束時間）
- upcoming: 即將開始（開始時間 > 現在）
- ended: 已結束（結束時間 < 現在）
- all: 所有狀態

使用範例：

# 基本查詢

GET /api/events # 進行中的活動（預設）
GET /api/events?status=upcoming # 即將開始的活動
GET /api/events?status=all # 所有活動

# 搜尋功能

GET /api/events?search=IU # 搜尋 IU 相關活動
GET /api/events?search=台北 # 搜尋台北地區活動
GET /api/events?region=信義區 # 篩選信義區活動

# 分頁

GET /api/events?page=2&limit=20 # 第2頁，每頁20筆

# 組合篩選

GET /api/events?search=IU&status=active&re
gion=台北市&page=1&limit=10

GET /api/events/map-data ⭐ 全新

功能：取得地圖輕量資料
權限：公開

查詢參數：
{
status?: 'active' | 'upcoming' | 'all';
// 預設 'active'
bounds?: string;
// 地圖邊界 "lat1,lng1,lat2,lng2"
zoom?: number;
// 縮放等級（保留供未來聚合功能）
}

回應格式：
{
events: {
id: string;
title: string;
artistName: string;
coordinates: { lat: number; lng:
number };
status: 'active' | 'upcoming';
thumbnail?: string;
// 縮圖（未來功能）
}[];
total: number;
}

使用範例：
GET /api/events/map-data # 進行中活動的地圖標記
GET /api/events/map-data?status=upcoming # 即將開始的活動標記
GET /api/events/map-data?bounds=25.0,121.5
,25.1,121.6 # 特定區域內的活動

GET /api/events/:id

功能：取得單一活動詳情
權限：公開

回應格式：
CoffeeEvent // 完整活動資料

GET /api/events/search

功能：搜尋活動（舊版，建議使用 GET
/api/events 的 search 參數）
權限：公開

POST /api/events

功能：新增活動
權限：需登入

請求體：
{
artistId: string;
artistName?: string; //
可選，會自動從藝人資料取得
title: string;
description: string;
location: {
address: string;
coordinates: { lat: number; lng:
number };
};
datetime: {
start: string; // ISO
格式："2025-07-30T00:00:00.000Z"
end: string; // ISO
格式："2025-07-31T23:59:59.000Z"
};
socialMedia?: {
instagram?: string;
twitter?: string;
threads?: string;
};
supportProvided?: boolean;
requiresReservation?: boolean;
onSiteReservation?: boolean;
amenities?: string[];
}

PUT /api/events/:id/approve

功能：審核通過活動
權限：需管理員

PUT /api/events/:id/reject

功能：拒絕活動申請權限：需管理員

---

🗺️ Google Places API 代理

POST /api/places/autocomplete ⭐ 全新

功能：地點自動完成搜尋（繁體中文，限台灣地
區）
權限：公開

請求體：
{
input: string; // 搜尋關鍵字
}

回應格式：
{
predictions: {
place_id: string;
description: string;
// 完整地址（中文）
structured_formatting: {
main_text: string;
// 主要名稱
secondary_text: string;
// 次要資訊（地區）
};
}[];
}

使用範例：
POST /api/places/autocomplete
{
"input": "台北101"
}

GET /api/places/details/:placeId ⭐ 全新

功能：取得地點詳細資訊（繁體中文）
權限：公開

回應格式：
{
geometry: {
location: { lat: number; lng: number
};
};
formatted_address: string;
// 格式化地址（中文）
name: string;
// 地點名稱（中文）
}

使用範例：
GET /api/places/details/ChIJgUbEo8pQwokR5l
P9_Wh_DaM

---

🔐 認證機制

所有需要認證的 API 都需要在 Header
中包含：
Authorization: Bearer <Firebase_JWT_Token>

權限等級：

- user：一般用戶（可建立活動、藝人）
- admin：管理員（可審核、刪除）

---

📊 資料結構

CoffeeEvent（更新版）

{
id: string;
artistId: string;
artistName: string; // ⭐
新增：冗餘儲存藝人名稱  
 title: string;
description: string;
location: {
address: string;
coordinates: { lat: number; lng:
number };
};
datetime: {
start: Timestamp;
end: Timestamp;
};
socialMedia: {
instagram?: string;
twitter?: string;
threads?: string;
};
images: string[];
thumbnail?: string; // ⭐
新增：縮圖 URL
markerImage?: string; // ⭐
新增：地圖標記圖片
supportProvided?: boolean;
requiresReservation?: boolean;
onSiteReservation?: boolean;
amenities?: string[];
status: 'pending' | 'approved' |
'rejected';
isDeleted: boolean;
createdBy: string;
createdAt: Timestamp;
updatedAt: Timestamp;
}

## 前端開發階段

### 🎯 第一階段：基礎架構（✅ 已完成）

- [x] **專案初始化**
  - Next.js 15 (App Router)
  - TypeScript 設定
  - Tailwind CSS 4.0 整合
  - 專案資料夾結構
- [x] **Firebase 整合**
  - Firebase Auth 設定
  - 環境變數配置
  - API 呼叫工具函數
- [x] **狀態管理設定**
  - Zustand store 架構
  - 用戶認證狀態
  - API 資料快取策略

### 🗺️ 第二階段：地圖功能

- [ ] **地圖展示**
  - Leaflet 整合與台灣地圖
  - 活動標記與彈出視窗
  - 地圖控制項（縮放、定位）
- [ ] **互動功能**
  - 點擊標記顯示活動詳情
  - 地圖篩選（藝人、時間範圍）
  - 搜尋功能整合

### 📝 第三階段：內容管理

- [ ] **用戶功能**
  - 登入/註冊介面
  - 活動投稿表單
  - 我的投稿管理
- [ ] **管理員功能**
  - 審核待審活動
  - 藝人管理介面
  - 系統管理儀表板

### 🎨 第四階段：使用體驗

- [ ] **響應式設計**
  - 手機版地圖操作
  - 平板與桌機適配
- [ ] **效能優化**
  - 圖片延遲載入
  - API 資料快取
  - 地圖渲染優化

## 技術棧建議

### 核心框架

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**

### 地圖與資料

- **Leaflet** + **React-Leaflet** (地圖展示)
- **Zustand** (狀態管理)
- **SWR** 或 **React Query** (API 資料管理)

### UI 元件

- **Headless UI** 或 **Radix UI** (無樣式元件)
- **Heroicons** (圖示庫)
- **React Hook Form** (表單管理)

### 認證與 API

- **Firebase Auth** (已整合後端)
- **Axios** (API 呼叫)

## 環境變數設定

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... 其他 Firebase 設定
```

---

在做前端修改時 如果是跟資料面相關的
先詢問後端是否可以修改，真的不行才在前端操控資料，避免前端自己控制資料
不要用any
