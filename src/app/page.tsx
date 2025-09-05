import { Suspense } from 'react';
import axios from 'axios';
import HomePage from '@/components/layout/HomePage';
import { Artist } from '@/types';
import { getWeekStart, getWeekEnd, formatDateForAPI } from '@/utils/weekHelpers';

// ISR: 每小時重新驗證一次數據
export const revalidate = 3600;

// 移除重複的函數，使用 weekHelpers 中的統一實現

// 創建不需要認證的 API 實例（用於 SSR）
const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// SSR 數據預取函數
async function getWeekBirthdayArtists(): Promise<Artist[]> {
  try {
    const weekStart = getWeekStart(new Date());
    const weekEnd = getWeekEnd(weekStart);

    const startDate = formatDateForAPI(weekStart);
    const endDate = formatDateForAPI(weekEnd);

    // 使用公開 API，不需要認證
    const queryParams = new URLSearchParams({
      status: 'approved',
      birthdayStartDate: startDate,
      birthdayEndDate: endDate,
      sortBy: 'coffeeEventCount',
    });

    const response = await publicApi.get(`/artists?${queryParams}`);

    return response.data as Artist[];
  } catch {
    return [];
  }
}

// 加載中的 fallback 組件 - 更詳細的骨架屏
function HomePageSkeleton() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        paddingTop: '100px',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '100px 30px 40px',
        }}
      >
        {/* 週導航骨架 */}
        <div
          style={{
            height: '48px',
            background: '#f1f5f9',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '1px solid #e2e8f0',
          }}
        />

        {/* 搜索框骨架 */}
        <div
          style={{
            height: '48px',
            background: '#f1f5f9',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0',
          }}
        />

        {/* 藝人卡片骨架 */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: '120px',
              background: '#f1f5f9',
              borderRadius: '12px',
              marginBottom: '16px',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* 簡化的載入提示，移除動畫 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#64748b',
                fontSize: '14px',
              }}
            >
              載入中...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 服務端組件
export default async function Home() {
  // 在服務端預取數據
  const initialArtists = await getWeekBirthdayArtists();

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePage initialArtists={initialArtists} />
    </Suspense>
  );
}
