// 基本型別定義

// Firebase Timestamp 型別
export interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface Artist {
  id: string;
  stageName: string; // 英文藝名（必填）
  stageNameZh?: string; // 中文藝名（選填）
  groupNames?: string[]; // 團名陣列（選填，支援多個團名）
  realName?: string; // 本名（選填）
  birthday?: string; // 生日 (YYYY-MM-DD)
  profileImage?: string; // 照片 URL
  status: 'pending' | 'approved' | 'rejected' | 'exists';
  rejectedReason?: string; // 拒絕原因（只有當 status === 'rejected' 時才有）
  createdBy: string;
  createdAt: FirebaseTimestamp | string; // ISO string format
  updatedAt: FirebaseTimestamp | string; // ISO string format
  coffeeEventCount?: number; // 進行中的生咖活動數量
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
  detailImage?: string[]; // 詳細圖片 URL
  status: 'pending' | 'approved' | 'rejected';
  rejectedReason?: string; // 拒絕原因（只有當 status === 'rejected' 時才有）
  createdBy: string;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
  isFavorited?: boolean; // 收藏狀態（登入時才有）
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// 用戶資料更新請求格式
export interface UpdateUserRequest {
  displayName?: string;
}

// 通知系統類型
export type NotificationType =
  | 'artist_approved'
  | 'artist_rejected'
  | 'event_approved'
  | 'event_rejected'
  | 'artist_exists';

export interface UserNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: {
    artistId?: string;
    eventId?: string;
    rejectedReason?: string;
  };
  createdAt: FirebaseTimestamp | string;
}

// 通知查詢參數
export interface NotificationSearchParams {
  isRead?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

// 通知回應格式
export interface NotificationsResponse {
  notifications: UserNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    unreadCount: number;
    totalCount: number;
  };
}

// 未讀通知數量回應
export interface UnreadCountResponse {
  unreadCount: number;
}

// 批量標記已讀請求
export interface BulkReadRequest {
  notificationIds: string[];
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

export interface MapEvent {
  id: string;
  location: {
    address: string; // 地址
    coordinates: { lat: number; lng: number };
    name: string; // 店家名稱
  };
  title: string;
  mainImage: string;
  datetime: {
    start: string;
    end: string;
  };
}

// 地圖資料回應格式
export interface MapDataResponse {
  events: Array<MapEvent>;
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
  sortBy?: 'title' | 'startTime' | 'createdAt'; // 排序欄位
  sortOrder?: 'asc' | 'desc'; // 排序方向
  startTimeFrom?: string; // 開始時間範圍（從）
  startTimeTo?: string; // 開始時間範圍（到）
  checkFavorite?: boolean; // 是否檢查收藏狀態（登入時才有效）
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
  detailImage?: string[]; // 詳細圖片 URL
}

// 藝人編輯請求格式
export interface UpdateArtistRequest {
  stageName?: string;
  stageNameZh?: string;
  groupNames?: string[];
  realName?: string;
  birthday?: string; // YYYY-MM-DD
  profileImage?: string;
}

// 審核請求格式
export interface ArtistReviewRequest {
  status: 'approved' | 'rejected' | 'exists';
  reason?: string; // 拒絕時使用
  adminUpdate?: {
    groupNames?: string[]; // 審核通過時可設定團名陣列
  };
}

// 藝人審核通過請求格式
export interface ArtistApproveRequest {
  adminUpdate?: {
    groupNames?: string[]; // 選填，管理員可設定團名陣列
  };
}

export interface EventReviewRequest {
  status: 'approved' | 'rejected';
  reason?: string; // 拒絕時使用
}

// 拒絕請求格式
export interface RejectRequest {
  reason?: string;
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
  detailImage?: string[];
}

// 用戶收藏
export interface UserFavorite {
  id: string;
  userId: string;
  eventId: string;
  createdAt: FirebaseTimestamp;
}

// 收藏篩選參數
export interface FavoriteFilterParams {
  sort?: 'favoritedAt' | 'startTime';
  sortOrder?: 'asc' | 'desc';
  status?: 'notEnded' | 'active' | 'upcoming' | 'ended' | 'all'; // 預設 notEnded
  artistIds?: string[]; // 篩選包含特定藝人的活動
  page?: number;
  limit?: number;
}

// 收藏列表回應格式
export interface FavoritesResponse {
  favorites: Array<{
    favorite: UserFavorite;
    event: CoffeeEvent;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 檢查收藏狀態回應
export interface FavoriteCheckResponse {
  isFavorited: boolean;
}
