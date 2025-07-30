# 台灣生咖地圖前端專案

## 專案概述
台灣 K-pop 藝人生日應援咖啡活動平台前端，基於後端 API 建立互動性地圖與管理介面。

## 後端狀況
**後端已完成並可用** 🎉
- 技術棧：Node.js + Express + TypeScript + Firebase + Bun
- 開發伺服器：`npm run dev` (Bun runtime)
- 測試：31 個測試全部通過
- 程式碼品質：ESLint + Prettier + Pre-commit hooks

## 可用的 API 端點

📋 完整 API 端點列表

  🎭 藝人管理 API

  GET /api/artists

  - 功能：取得藝人列表（支援狀態篩選）
  - 權限：公開（但 pending/rejected 需管理員）
  - 查詢參數：status=approved|pending|rejected

  POST /api/artists

  - 功能：新增藝人
  - 權限：需登入

  PATCH /api/artists/:id/review

  - 功能：審核藝人（通用方法）
  - 權限：需管理員
  - 請求體：{"status": "approved|rejected"}

  PUT /api/artists/:id/approve

  - 功能：審核通過藝人 ✅ 新增
  - 權限：需管理員

  PUT /api/artists/:id/reject

  - 功能：拒絕藝人申請 ✅ 新增
  - 權限：需管理員

  DELETE /api/artists/:id

  - 功能：軟刪除藝人
  - 權限：需管理員

  ☕ 活動管理 API

  GET /api/events

  - 功能：取得活動列表（支援狀態篩選）
  - 權限：公開（但 pending/rejected 需管理員）
  - 查詢參數：status=approved|pending|rejected

  GET /api/events/:id

  - 功能：取得單一活動詳情
  - 權限：公開

  GET /api/events/search

  - 功能：搜尋活動
  - 權限：公開

  POST /api/events

  - 功能：新增活動
  - 權限：需登入

  PATCH /api/events/:id/review

  - 功能：審核活動（通用方法）
  - 權限：需管理員
  - 請求體：{"status": "approved|rejected"}

  PUT /api/events/:id/approve

  - 功能：審核通過活動 ✅ 新增
  - 權限：需管理員

  PUT /api/events/:id/reject

  - 功能：拒絕活動申請 ✅ 新增
  - 權限：需管理員

  DELETE /api/events/:id

  - 功能：軟刪除活動
  - 權限：需管理員

### 🔐 認證相關
- Firebase Auth 整合
- JWT Token 驗證
- 角色權限：`user` / `admin`

## 資料結構

### Artist 藝人
```typescript
interface Artist {
  id: string;
  stageName: string;          // 藝名（主要顯示）
  realName?: string;          // 本名（可選）
  birthday?: string;          // 生日 (YYYY-MM-DD)
  profileImage?: string;      // 照片 URL
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### CoffeeEvent 咖啡活動
```typescript
interface CoffeeEvent {
  id: string;
  title: string;              // 活動標題
  artistId: string;           // 關聯藝人 ID
  artistName: string;         // 藝人名稱（冗餘儲存）
  description?: string;       // 活動描述
  startDate: Timestamp;       // 開始時間
  endDate: Timestamp;         // 結束時間
  location: {
    address: string;          // 地址
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contactInfo?: {
    phone?: string;
    instagram?: string;
    facebook?: string;
  };
  images?: string[];          // 活動照片 URLs
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

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

## 開發重點

### 🔑 關鍵功能
1. **地圖為核心** - 使用者主要透過地圖瀏覽活動
2. **行動優先** - 大部分使用者會用手機查看
3. **即時更新** - 活動狀態變更需即時反映

### 📱 使用情境
- **一般用戶**：瀏覽地圖 → 查看活動詳情 → 前往參與
- **粉絲用戶**：登入 → 投稿活動 → 追蹤審核狀態
- **管理員**：登入 → 審核活動 → 管理藝人資料

### 🎨 設計考量
- 清新的咖啡主題配色
- 直覺的地圖操作體驗
- 韓流風格的視覺設計

## 後續整合點
- 後端 API 已穩定，可直接整合
- Firebase 專案需共用（認證一致性）
- 圖片上傳可考慮使用 Firebase Storage 或 Cloudinary

---

在做前端修改時 如果是跟資料面相關的
先詢問後端是否可以修改，真的不行才在前端操控資料，避免前端自己控制資料

**準備開始前端開發！** 🚀