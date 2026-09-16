'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

// 抽成獨立函式匯出，讓個別 hook/元件自己客製化 retry 時可以直接複用這條規則，
// 不用各自重寫一份（也方便單獨測試）。
// 401 不重試：重試不會讓過期 token 變有效，只會拖延導去登入的時間，
// 且重試的請求會帶上新的 auth generation，可能誤觸發多餘的登入提示。
export function defaultQueryRetry(failureCount: number, error: unknown): boolean {
  if (axios.isAxiosError(error) && error.response?.status === 401) return false;
  return failureCount < 2;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 分鐘
            gcTime: 1000 * 60 * 10, // 10 分鐘
            retry: defaultQueryRetry,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
