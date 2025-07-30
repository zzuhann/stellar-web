// 基本型別定義

export interface Artist {
  id: string;
  stageName: string;          // 藝名（主要顯示）
  realName?: string;          // 本名（可選）
  birthday?: string;          // 生日 (YYYY-MM-DD)
  profileImage?: string;      // 照片 URL
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}

export interface CoffeeEvent {
  id: string;
  title: string;              // 活動標題
  artistId: string;           // 關聯藝人 ID
  artistName: string;         // 藝人名稱（冗餘儲存）
  description?: string;       // 活動描述
  startDate: string;          // 開始時間 (ISO string)
  endDate: string;            // 結束時間 (ISO string)
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
  createdAt: string;
  updatedAt: string;
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
export interface ApiResponse<T = any> {
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

export interface EventMarker extends Pick<CoffeeEvent, 'id' | 'title' | 'artistName' | 'location' | 'startDate' | 'endDate'> {
  // 地圖標記專用的簡化資料
}