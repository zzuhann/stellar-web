'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { CoffeeEvent, FirebaseTimestamp } from '@/types';

import EventPreviewModal from '@/components/events/EventPreviewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import VerticalArtistCard from '@/components/ArtistCard/VerticalArtistCard';
import VerticalEventCard from '@/components/EventCard/VerticalEventCard';
import { Artist } from '@/types';
import { showToast } from '@/lib/toast';

import styled from 'styled-components';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { firebaseTimestampToDate } from '@/utils';

// Styled Components - 參考 ArtistHomePage 和 EventDetail 的設計風格
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-bg-primary);
`;

const MainContainer = styled.div`
  padding-top: 100px;
  max-width: 600px;
  margin: 0 auto;
  padding: 100px 16px 40px;

  @media (min-width: 768px) {
    padding: 100px 24px 60px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TabContainer = styled.div`
  margin-bottom: 16px;
`;

const TabNav = styled.nav`
  display: flex;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 4px;
`;

const TabButton = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: ${(props) => (props.active ? 'var(--color-primary)' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : 'var(--color-text-primary)')};
  position: relative;

  &:hover {
    background: ${(props) => (props.active ? 'var(--color-primary)' : 'var(--color-border-light)')};
  }
`;

const ContentCard = styled.div`
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--color-border-light);
  background: white;

  h2 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 4px 0;
  }

  p {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);

  .icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }
`;

const CTAButton = styled.button`
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  max-width: 60%;
  margin: 0 auto;

  &:hover {
    background: #3a5d7a;
    border-color: #3a5d7a;
  }
`;

const ArtistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
`;

const EventGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
`;

const LoadingContainer = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border-light);
    border-top: 3px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
`;

const ActionButton = styled.button<{ variant: 'edit' | 'delete' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;

  ${(props) => {
    if (props.variant === 'edit') {
      return `
        background: var(--color-bg-primary);
        border-color: var(--color-border-light);
        color: var(--color-text-primary);
        
        &:hover:not(:disabled) {
          background: var(--color-bg-secondary);
          border-color: var(--color-border-medium);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    } else {
      return `
        background: #fef2f2;
        border-color: #fecaca;
        color: #991b1b;
        
        &:hover:not(:disabled) {
          background: #fee2e2;
          border-color: #fca5a5;
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const ArtistInfo = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 60px;
  justify-content: center;
`;

export default function MySubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'artists' | 'events'>('events');

  const [previewingEvent, setPreviewingEvent] = useState<CoffeeEvent | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    event: CoffeeEvent | null;
  }>({ isOpen: false, event: null });
  const queryClient = useQueryClient();

  // 使用新的 /me API 取得用戶投稿
  const { data: userSubmissions, isLoading: loading } = useQuery({
    queryKey: ['user-submissions'],
    queryFn: eventsApi.getMySubmissions,
    enabled: !!user,
  });

  // 刪除活動 mutation
  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('活動刪除成功');
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : '刪除活動時發生錯誤');
    },
  });

  // 權限檢查
  useEffect(() => {
    if (!authLoading && !user) {
      showToast.warning('請先登入後才能查看投稿狀態');
      router.push('/');
    }
  }, [user, authLoading, router]);

  // 從 API 取得的資料
  const userArtists = useMemo(() => userSubmissions?.artists || [], [userSubmissions?.artists]);
  const userEvents = useMemo(() => userSubmissions?.events || [], [userSubmissions?.events]);

  // 處理編輯藝人
  const handleEditArtist = (e: React.MouseEvent, artist: Artist) => {
    e.stopPropagation();
    router.push(`/submit-artist?edit=${artist.id}`);
  };

  // 處理編輯活動
  const handleEditEvent = (e: React.MouseEvent, event: CoffeeEvent) => {
    e.stopPropagation();
    router.push(`/submit-event?edit=${event.id}`);
  };

  // 處理預覽活動
  const handlePreviewEvent = (e: React.MouseEvent, event: CoffeeEvent) => {
    e.stopPropagation();
    setPreviewingEvent(event);
  };

  // 處理刪除活動
  const handleDeleteEvent = (e: React.MouseEvent, event: CoffeeEvent) => {
    e.stopPropagation();
    setDeleteConfirmModal({ isOpen: true, event });
  };

  // 確認刪除活動
  const handleConfirmDelete = () => {
    if (deleteConfirmModal.event) {
      deleteEventMutation.mutate(deleteConfirmModal.event.id);
      setDeleteConfirmModal({ isOpen: false, event: null });
    }
  };

  // 取消刪除活動
  const handleCancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, event: null });
  };

  if (authLoading || loading) {
    return (
      <PageContainer>
        <MainContainer>
          <LoadingContainer>
            <div className="spinner" />
            <p>載入投稿資料中...</p>
          </LoadingContainer>
        </MainContainer>
      </PageContainer>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageContainer>
      <MainContainer>
        <ContentWrapper>
          {/* 標籤頁 */}
          <TabContainer>
            <TabNav>
              <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')}>
                生咖投稿
              </TabButton>
              <TabButton active={activeTab === 'artists'} onClick={() => setActiveTab('artists')}>
                偶像投稿
              </TabButton>
            </TabNav>
          </TabContainer>

          {/* 藝人標籤頁 */}
          {activeTab === 'artists' && (
            <ContentCard>
              <CardHeader>
                <h2>我投稿的偶像</h2>
                <p>共 {userArtists.length} 位偶像投稿</p>
              </CardHeader>

              {userArtists.length === 0 ? (
                <EmptyState>
                  <div className="icon">✨</div>
                  <h3>還沒有投稿過偶像</h3>
                </EmptyState>
              ) : (
                <ArtistGrid>
                  {userArtists.map((artist) => (
                    <VerticalArtistCard
                      key={artist.id}
                      artist={artist}
                      onClick={(artist) => {
                        router.push(`/map?artistId=${artist.id}`);
                      }}
                      submissionTime={
                        artist.createdAt
                          ? firebaseTimestampToDate(
                              artist.createdAt as FirebaseTimestamp
                            ).toLocaleString('zh-TW')
                          : undefined
                      }
                      actionButtons={
                        artist.status === 'rejected' ? (
                          <ArtistInfo>
                            <ActionButtons>
                              {artist.status === 'rejected' && (
                                <ActionButton
                                  variant="edit"
                                  onClick={(e) => handleEditArtist(e, artist)}
                                  title="編輯並重新送審"
                                >
                                  編輯並重新送審
                                </ActionButton>
                              )}
                            </ActionButtons>
                          </ArtistInfo>
                        ) : undefined
                      }
                    />
                  ))}
                </ArtistGrid>
              )}
            </ContentCard>
          )}

          {/* 活動標籤頁 */}
          {activeTab === 'events' && userSubmissions && (
            <ContentCard>
              <CardHeader>
                <h2>我投稿的生咖</h2>
                <p>共 {userEvents.length} 個生咖投稿</p>
              </CardHeader>

              {userEvents.length === 0 ? (
                <EmptyState>
                  <div className="icon">🍰</div>
                  <h3>還沒有舉辦過生咖</h3>
                  <p>如果你是生咖主辦，可以點擊前往投稿生咖 ✨</p>
                  <CTAButton onClick={() => router.push('/submit-event')}>前往投稿</CTAButton>
                </EmptyState>
              ) : (
                <EventGrid>
                  {userEvents.map((event) => (
                    <VerticalEventCard
                      key={event.id}
                      event={event}
                      onClick={() => {
                        if (event.status === 'approved') {
                          router.push(`/event/${event.id}`);
                        }
                      }}
                      actionButtons={
                        <ActionButtons>
                          <ActionButton
                            variant="edit"
                            onClick={(e) => handlePreviewEvent(e, event)}
                            title="預覽活動"
                          >
                            <EyeIcon />
                            預覽
                          </ActionButton>
                          <ActionButton
                            variant="edit"
                            onClick={(e) => handleEditEvent(e, event)}
                            title="編輯活動"
                          >
                            <PencilIcon />
                            編輯
                          </ActionButton>
                          <ActionButton
                            variant="delete"
                            onClick={(e) => handleDeleteEvent(e, event)}
                            disabled={deleteEventMutation.isPending}
                            title="刪除活動"
                          >
                            <TrashIcon />
                            {deleteEventMutation.isPending ? '刪除中...' : '刪除'}
                          </ActionButton>
                        </ActionButtons>
                      }
                    />
                  ))}
                </EventGrid>
              )}
            </ContentCard>
          )}
        </ContentWrapper>
      </MainContainer>

      {/* 預覽活動模態框 */}
      {previewingEvent && (
        <EventPreviewModal
          event={previewingEvent}
          isOpen={true}
          onClose={() => setPreviewingEvent(null)}
        />
      )}

      {/* 確認刪除模態框 */}
      <ConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        title="確認刪除活動"
        message={`確定要刪除活動「${deleteConfirmModal.event?.title}」嗎？此操作無法復原。`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="刪除"
        cancelText="取消"
        isLoading={deleteEventMutation.isPending}
      />
    </PageContainer>
  );
}
