'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import EventSubmissionModal from '@/components/forms/EventSubmissionModal';

export default function SubmitEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              返回地圖
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">投稿活動</h1>
              <p className="text-sm text-gray-600">分享您發現的應援咖啡活動</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-4">
              <span className="text-3xl">☕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">投稿應援咖啡活動</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              幫助我們建立更完整的 K-pop 應援活動資料庫，讓更多粉絲可以找到並參與這些活動
            </p>
          </div>

          {/* Event Submission Form - 使用現有的模態框組件但不作為模態框 */}
          <div className="max-w-2xl mx-auto">
            <EventSubmissionModal isOpen={true} onClose={() => router.push('/')} embedded={true} />
          </div>
        </div>
      </main>
    </div>
  );
}
