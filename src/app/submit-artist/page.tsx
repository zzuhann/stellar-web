'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import ArtistSubmissionModal from '@/components/forms/ArtistSubmissionModal';

export default function SubmitArtistPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
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
              <h1 className="text-2xl font-bold text-gray-900">投稿藝人</h1>
              <p className="text-sm text-gray-600">新增 K-pop 藝人到資料庫</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">投稿 K-pop 藝人</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              新增您喜愛的 K-pop 藝人到我們的資料庫，讓其他用戶可以為他們建立應援活動
            </p>
          </div>

          {/* Artist Submission Form - 使用現有的模態框組件但不作為模態框 */}
          <div className="max-w-2xl mx-auto">
            <ArtistSubmissionModal isOpen={true} onClose={() => router.push('/')} embedded={true} />
          </div>
        </div>
      </main>
    </div>
  );
}
