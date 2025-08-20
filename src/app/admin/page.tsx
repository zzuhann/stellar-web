'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artistsApi, eventsApi } from '@/lib/api';
import showToast from '@/lib/toast';
import styled from 'styled-components';
import EventPreviewModal from '@/components/events/EventPreviewModal';
import RejectModal from '@/components/admin/RejectModal';
import GroupNameModal from '@/components/admin/GroupNameModal';
import { CoffeeEvent, Artist } from '@/types';
import VerticalEventCard from '@/components/EventCard/VerticalEventCard';
import VerticalArtistCard from '@/components/ArtistCard/VerticalArtistCard';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-bg-primary);
`;

const MainContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 16px;
`;

const TabContainer = styled.div`
  margin-bottom: 24px;
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
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: ${(props) => (props.active ? 'var(--color-primary)' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : 'var(--color-text-primary)')};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${(props) => (props.active ? 'var(--color-primary)' : 'var(--color-border-light)')};
  }
`;

const Badge = styled.span`
  background: #fee2e2;
  color: #991b1b;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-md);
`;

const ContentCard = styled.div`
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--color-border-light);
  background: white;

  h2 {
    font-size: 18px;
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
  padding: 60px 20px;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  p {
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
  }
`;

const ItemList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  justify-content: flex-end;
  height: 60px;
  align-items: center;
`;

const ActionButton = styled.button<{ variant: 'approve' | 'reject' | 'preview' | 'exists' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;

  ${(props) => {
    switch (props.variant) {
      case 'approve':
        return `
          background: #16a34a;
          border-color: #16a34a;
          color: white;
          
          &:hover:not(:disabled) {
            background: #15803d;
            border-color: #15803d;
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'reject':
        return `
          background: #dc2626;
          border-color: #dc2626;
          color: white;
          
          &:hover:not(:disabled) {
            background: #b91c1c;
            border-color: #b91c1c;
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'preview':
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
      case 'exists':
        return `
          background: #f59e0b;
          border-color: #f59e0b;
          color: white;
          
          &:hover:not(:disabled) {
            background: #d97706;
            border-color: #d97706;
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
    width: 14px;
    height: 14px;
  }
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

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'artists' | 'events'>('artists');
  const [previewingEvent, setPreviewingEvent] = useState<CoffeeEvent | null>(null);
  const [rejectingArtist, setRejectingArtist] = useState<Artist | null>(null);
  const [rejectingEvent, setRejectingEvent] = useState<CoffeeEvent | null>(null);
  const [approvingArtist, setApprovingArtist] = useState<Artist | null>(null);
  const queryClient = useQueryClient();

  // 使用 React Query 取得待審核藝人
  const { data: pendingArtists = [], isLoading: artistsLoading } = useQuery({
    queryKey: ['admin-pending-artists'],
    queryFn: () => artistsApi.getAll({ status: 'pending', sortBy: 'createdAt', sortOrder: 'asc' }),
    enabled: !!user && userData?.role === 'admin',
    staleTime: 5 * 60 * 1000, // 5分鐘內資料視為新鮮，不會重新請求
    gcTime: 10 * 60 * 1000, // 10分鐘後從快取中移除
  });

  // 使用 React Query 取得待審核活動
  const { data: pendingEventsResponse, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-pending-events'],
    queryFn: () => eventsApi.getAll({ status: 'pending', sortBy: 'createdAt', sortOrder: 'asc' }),
    enabled: !!user && userData?.role === 'admin',
    staleTime: 5 * 60 * 1000, // 5分鐘內資料視為新鮮，不會重新請求
    gcTime: 10 * 60 * 1000, // 10分鐘後從快取中移除
  });

  const pendingEvents = pendingEventsResponse?.events || [];

  // 權限檢查
  useEffect(() => {
    if (!authLoading && (!user || userData?.role !== 'admin')) {
      showToast.error('權限不足');
      router.push('/');
    }
  }, [user, userData, authLoading, router]);

  // 審核藝人 mutations
  const approveArtistMutation = useMutation({
    mutationFn: ({ id, groupName }: { id: string; groupName?: string }) =>
      artistsApi.approve(id, groupName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-artists'] });
      showToast.success('審核成功');
    },
    onError: () => {
      showToast.error('審核失敗');
    },
  });

  const rejectArtistMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      artistsApi.reject(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-artists'] });
      showToast.success('已拒絕此投稿');
    },
    onError: () => {
      showToast.error('操作失敗');
    },
  });

  const markAsExistsMutation = useMutation({
    mutationFn: (id: string) => artistsApi.reject(id, { reason: '藝人已存在' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-artists'] });
      showToast.success('已標記為已存在');
    },
    onError: () => {
      showToast.error('操作失敗');
    },
  });

  // 審核活動 mutations
  const approveEventMutation = useMutation({
    mutationFn: (id: string) => eventsApi.admin.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-events'] });
      showToast.success('審核成功');
    },
    onError: () => {
      showToast.error('操作失敗');
    },
  });

  const rejectEventMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      eventsApi.admin.reject(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-events'] });
      showToast.success('已拒絕此投稿');
    },
    onError: () => {
      showToast.error('操作失敗');
    },
  });

  const handleApproveArtist = (artist: Artist) => {
    setApprovingArtist(artist);
  };

  const handleApproveArtistWithGroupName = (groupName?: string) => {
    if (!approvingArtist) return;

    approveArtistMutation.mutate(
      { id: approvingArtist.id, groupName },
      {
        onSuccess: () => {
          setApprovingArtist(null);
        },
      }
    );
  };

  const handleRejectArtist = (artistId: string, reason: string) => {
    rejectArtistMutation.mutate(
      { id: artistId, reason },
      {
        onSuccess: () => {
          setRejectingArtist(null);
        },
      }
    );
  };

  const handleExistsArtist = (artistId: string) => {
    markAsExistsMutation.mutate(artistId);
  };

  const handleApproveEvent = (eventId: string) => {
    approveEventMutation.mutate(eventId);
  };

  const handleRejectEvent = (eventId: string, reason: string) => {
    rejectEventMutation.mutate(
      { id: eventId, reason },
      {
        onSuccess: () => {
          setRejectingEvent(null);
        },
      }
    );
  };

  const handlePreviewEvent = (event: CoffeeEvent) => {
    setPreviewingEvent(event);
  };

  if (authLoading || artistsLoading || eventsLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div className="spinner" />
          <p>載入中...</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <PageContainer>
      {/* Main Content */}
      <MainContainer>
        {/* Tabs */}
        <TabContainer>
          <TabNav>
            <TabButton active={activeTab === 'artists'} onClick={() => setActiveTab('artists')}>
              待審偶像
              {pendingArtists.length > 0 && <Badge>{pendingArtists.length}</Badge>}
            </TabButton>
            <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')}>
              待審生咖
              {pendingEvents.length > 0 && <Badge>{pendingEvents.length}</Badge>}
            </TabButton>
          </TabNav>
        </TabContainer>

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <ContentCard>
            <CardHeader>
              <h2>待審核偶像</h2>
              <p>{pendingArtists.length} 位偶像等待審核</p>
            </CardHeader>
            {pendingArtists.length === 0 ? (
              <EmptyState>
                <UserIcon className="icon" width={48} height={48} />
                <h3>沒有待審核偶像</h3>
                <p>所有偶像投稿都已處理完成</p>
              </EmptyState>
            ) : (
              <ItemList>
                {pendingArtists.map((artist) => (
                  <VerticalArtistCard
                    key={artist.id}
                    artist={artist}
                    submissionTime={
                      artist.createdAt
                        ? new Date(artist.createdAt as string).toLocaleString('zh-TW')
                        : undefined
                    }
                    actionButtons={
                      <ActionButtons>
                        <ActionButton
                          variant="approve"
                          onClick={() => handleApproveArtist(artist)}
                          disabled={approveArtistMutation.isPending}
                        >
                          <CheckCircleIcon />
                          通過
                        </ActionButton>
                        <ActionButton
                          variant="exists"
                          onClick={() => handleExistsArtist(artist.id)}
                          disabled={markAsExistsMutation.isPending}
                        >
                          <ExclamationTriangleIcon />
                          已存在
                        </ActionButton>
                        <ActionButton
                          variant="reject"
                          onClick={() => setRejectingArtist(artist)}
                          disabled={rejectArtistMutation.isPending}
                        >
                          <XCircleIcon />
                          拒絕
                        </ActionButton>
                      </ActionButtons>
                    }
                  />
                ))}
              </ItemList>
            )}
          </ContentCard>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <ContentCard>
            <CardHeader>
              <h2>待審核生咖</h2>
              <p>{pendingEvents.length} 個生咖等待審核</p>
            </CardHeader>
            {pendingEvents.length === 0 ? (
              <EmptyState>
                <CalendarIcon className="icon" width={48} height={48} />
                <h3>沒有待審核生咖</h3>
                <p>所有生咖投稿都已處理完成</p>
              </EmptyState>
            ) : (
              <ItemList>
                {pendingEvents.map((event) => (
                  <VerticalEventCard
                    key={event.id}
                    event={event}
                    actionButtons={
                      <ActionButtons>
                        <ActionButton variant="preview" onClick={() => handlePreviewEvent(event)}>
                          <EyeIcon />
                          預覽
                        </ActionButton>
                        <ActionButton
                          variant="approve"
                          onClick={() => handleApproveEvent(event.id)}
                          disabled={approveEventMutation.isPending}
                        >
                          <CheckCircleIcon />
                          通過
                        </ActionButton>
                        <ActionButton
                          variant="reject"
                          onClick={() => setRejectingEvent(event)}
                          disabled={rejectEventMutation.isPending}
                        >
                          <XCircleIcon />
                          拒絕
                        </ActionButton>
                      </ActionButtons>
                    }
                  />
                ))}
              </ItemList>
            )}
          </ContentCard>
        )}
      </MainContainer>

      {/* 預覽活動模態框 */}
      {previewingEvent && (
        <EventPreviewModal
          event={previewingEvent}
          isOpen={true}
          onClose={() => setPreviewingEvent(null)}
        />
      )}

      {/* 拒絕藝人模態框 */}
      {rejectingArtist && (
        <RejectModal
          isOpen={true}
          title="拒絕投稿"
          itemName={rejectingArtist.stageName}
          onConfirm={(reason) => handleRejectArtist(rejectingArtist.id, reason)}
          onClose={() => setRejectingArtist(null)}
          loading={rejectArtistMutation.isPending}
        />
      )}

      {/* 拒絕活動模態框 */}
      {rejectingEvent && (
        <RejectModal
          isOpen={true}
          title="拒絕投稿"
          itemName={rejectingEvent.title}
          onConfirm={(reason) => handleRejectEvent(rejectingEvent.id, reason)}
          onClose={() => setRejectingEvent(null)}
          loading={rejectEventMutation.isPending}
        />
      )}

      {/* 設定團名模態框 */}
      {approvingArtist && (
        <GroupNameModal
          isOpen={true}
          artistName={approvingArtist.stageNameZh || approvingArtist.stageName}
          currentGroupName={approvingArtist.groupName}
          onConfirm={handleApproveArtistWithGroupName}
          onCancel={() => setApprovingArtist(null)}
          isLoading={approveArtistMutation.isPending}
        />
      )}
    </PageContainer>
  );
}
