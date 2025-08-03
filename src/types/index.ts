// 基本型別定義

// Firebase Timestamp 型別
export interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface Artist {
  id: string;
  stageName: string; // 藝名（主要顯示）
  realName?: string; // 本名（可選）
  birthday?: string; // 生日 (YYYY-MM-DD)
  profileImage?: string; // 照片 URL
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  coffeeEventCount?: number; // 進行中的生咖活動數量（當 includeStats=true 時回傳）
}

export interface CoffeeEvent {
  id: string;
  artists: Array<{
    id: string;
    name: string;
    profileImage?: string;
  }>; // 支援聯合應援
  title: string;
  description: string;
  location: {
    name: string; // 地點名稱
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  datetime: {
    start: FirebaseTimestamp;
    end: FirebaseTimestamp;
  };
  socialMedia: {
    instagram?: string;
    x?: string; // X (前 Twitter)
    threads?: string;
  };
  mainImage?: string; // 主要圖片 URL
  detailImage?: string; // 詳細圖片 URL
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// API 回應型別
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Events API 回應格式
export interface EventsResponse {
  events: CoffeeEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    artistId?: string;
    status?: string;
    region?: string;
  };
}

// 地圖資料回應格式
export interface MapDataResponse {
  events: Array<{
    id: string;
    title: string;
    mainImage?: string;
    location: {
      name: string;
      address: string;
      coordinates: { lat: number; lng: number };
    };
    datetime: {
      start: FirebaseTimestamp;
      end: FirebaseTimestamp;
    };
  }>;
  total: number;
}

// 搜尋參數
export interface EventSearchParams {
  search?: string; // 搜尋標題、藝人名稱、地址、描述
  artistId?: string; // 特定藝人ID
  status?: 'all' | 'pending' | 'approved' | 'rejected'; // 預設 'approved' (審核狀態)
  region?: string; // 地區名稱（台北市、新北市等）
  createdBy?: string; // 創建者 UID（篩選用戶自己的投稿）
  page?: number; // 頁數，預設1
  limit?: number; // 每頁筆數，預設50，最大100
}

// 地圖相關型別
export interface MapCenter {
  lat: number;
  lng: number;
  zoom: number;
}

export interface EventMarker {
  id: string;
  title: string;
  mainImage?: string;
  location: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  datetime: {
    start: FirebaseTimestamp;
    end: FirebaseTimestamp;
  };
}

// 建立活動的請求格式
export interface CreateEventRequest {
  artistIds: string[]; // 必填，藝人ID陣列（支援聯合應援）
  title: string; // 必填
  description: string; // 必填
  location: {
    // 必填
    name: string; // 地點名稱
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  datetime: {
    // 必填
    start: FirebaseTimestamp;
    end: FirebaseTimestamp;
  };
  socialMedia?: {
    // 可選
    instagram?: string;
    x?: string;
    threads?: string;
  };
  mainImage?: string; // 主要圖片 URL
  detailImage?: string; // 詳細圖片 URL
}

// 編輯活動的請求格式
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  datetime?: {
    start: FirebaseTimestamp;
    end: FirebaseTimestamp;
  };
  socialMedia?: {
    instagram?: string;
    x?: string;
    threads?: string;
  };
  mainImage?: string;
  detailImage?: string;
}
