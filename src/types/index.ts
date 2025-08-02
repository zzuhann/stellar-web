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
  title: string; // 活動標題
  artistId: string; // 關聯藝人 ID
  artistName: string; // 藝人名稱（冗餘儲存）
  description?: string; // 活動描述
  datetime: {
    start: FirebaseTimestamp;
    end: FirebaseTimestamp;
  };
  location: {
    address: string; // 地址
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  socialMedia?: {
    instagram?: string;
    twitter?: string;
  };
  contactInfo?: {
    // 向後相容
    phone?: string;
    instagram?: string;
    facebook?: string;
  };
  images?: string[]; // 活動照片 URLs
  thumbnail?: string; // 縮圖 URL
  markerImage?: string; // 地圖標記圖片 URL
  status: 'pending' | 'approved' | 'rejected';
  isDeleted: boolean;
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

// 搜尋參數
export interface EventSearchParams {
  artistName?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: 'pending' | 'approved' | 'rejected';
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
  artistName: string;
  location: {
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
  thumbnail?: string;
  markerImage?: string;
}
