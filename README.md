# STELLAR | 台灣生日應援地圖

A comprehensive Progressive Web App (PWA) for discovering and managing K-Pop birthday support events across Taiwan. STELLAR helps fans find nearby birthday celebrations for their favorite artists and enables event organizers to submit and manage events.

## Key Features

- **Interactive Map**: Browse birthday support events on an interactive Leaflet map with clustering
- **Event Discovery**: Search and filter events by date, artist, and location
- **Artist Birthdays**: Track upcoming artist birthdays with dedicated calendar views
- **Event Submission**: Submit new events with image uploads and location selection
- **User Management**: Google authentication with personal submission tracking
- **Admin Dashboard**: Event moderation and batch management tools
- **PWA Support**: Full offline capabilities with install prompts for mobile devices

## Tech Stack

### Frontend Framework

Next.js(app router), React, TypeScript

### Styling & UI

Panda CSS, React Hot Toast, React Spring, Swiper

### State Management & Data Fetching

TanStack Query, Zustand, React Hook Form, Zod

### Maps & Location

React Leaflet

### Authentication & Backend Integration

Firebase, Axios

### Development Tools

ESLint, Prettier, Husky, Lint-staged

### Performance & Analytics

GA Analytics, Vercel Analytics

## 開發指南

### 環境需求

- Node.js 20 或以上版本
- npm 或其他套件管理工具

### 安裝與執行

1. **安裝依賴**

```bash
npm install
```

2. **啟動開發伺服器**

```bash
npm run dev
```

3. **開啟瀏覽器訪問** `http://localhost:3000`

- 須配合 server 專案一起啟動(目前專案是 `baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',` )
- 如果只想看前端專案，可以把 NEXT_PUBLIC_API_BASE_URL 改為 `https://stellar.zeabur.app/api`

### 其他常用指令

```bash
# 建置正式版本
npm run build

# 啟動正式版本
npm start

# 執行程式碼檢查並自動修正
npm run lint

# TypeScript 型別檢查
npm run type-check
```

### 環境變數設定

相關環境變數設定，請找 zzuhann。

## Key Features & Implementation

### 1. **Interactive Event Map**

- **Technology**: React Leaflet with custom clustering
- **Features**: Real-time marker updates, location-based filtering, user geolocation
- **Performance**: Memoized markers and optimized re-renders for smooth interaction

### 2. **Progressive Web App (PWA)**

- **Technology**: Next.js PWA with custom service worker
- **Features**: Offline support, install prompts, push notifications
- **UX**: iOS-specific install banners and Android install prompts

### 3. **Advanced Form Handling**

- **Technology**: React Hook Form + Zod validation + custom image upload
- **Features**: Multi-step forms, image cropping, autocomplete location search
- **Validation**: Type-safe form validation with detailed error messages

### 4. **Real-time Data Management**

- **Technology**: TanStack Query + Zustand
- **Features**: Optimistic updates, background refetching, infinite scrolling
- **Performance**: Smart caching strategies and stale-while-revalidate patterns

### 5. **Authentication & Authorization**

- **Technology**: Firebase Auth with Google OAuth
- **Features**: Role-based access control, persistent sessions
- **Security**: Protected routes and API endpoints with token validation

## Performance & Optimization

### Code Splitting & Lazy Loading

- Dynamic imports for modals and heavy components
- Route-based code splitting with Next.js App Router
- Image optimization with Next.js Image component

### Bundle Optimization

- Tree-shaking enabled for all dependencies
- Panda CSS zero-runtime styling reduces bundle size
- Custom service worker for efficient caching

### User Experience

- Skeleton loading states for all data fetches
- Optimistic UI updates for instant feedback
- Smooth animations with React Spring

## PWA Features

- **Offline Support**: Service worker caches critical resources
- **Install Prompts**: Custom install banners for iOS and Android
- **App-like Experience**: Full-screen mode and native feel

## License

This project is licensed under the MIT License - see the LICENSE file for details.
