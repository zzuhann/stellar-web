'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artistsApi, eventsApi } from '@/lib/api';
import showToast from '@/lib/toast';
import styled from 'styled-components';
import EventPreviewModal from '@/components/events/EventPreviewModal';
import RejectModal from '@/components/admin/RejectModal';
import GroupNameModal from '@/components/admin/GroupNameModal';
import BatchGroupNameModal from '@/components/admin/BatchGroupNameModal';
import ArtistSubmissionForm from '@/components/forms/ArtistSubmissionForm';
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

const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: ${(props) => (props.$active ? 'var(--color-primary)' : 'transparent')};
  color: ${(props) => (props.$active ? 'white' : 'var(--color-text-primary)')};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${(props) =>
      props.$active ? 'var(--color-primary)' : 'var(--color-border-light)'};
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

const ActionButton = styled.button<{ $variant: 'approve' | 'reject' | 'preview' | 'exists' }>`
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
    switch (props.$variant) {
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

const BatchActionsContainer = styled.div`
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const BatchActionsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BatchActionsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const BatchButton = styled.button<{ $variant: 'approve' | 'reject' | 'exists' }>`
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
    switch (props.$variant) {
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

const EditModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 16px;
`;

const EditModalContent = styled.div`
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'artists' | 'events' | 'weekly-events'>('artists');
  const [previewingEvent, setPreviewingEvent] = useState<CoffeeEvent | null>(null);
  const [rejectingArtist, setRejectingArtist] = useState<Artist | null>(null);
  const [rejectingEvent, setRejectingEvent] = useState<CoffeeEvent | null>(null);
  const [approvingArtist, setApprovingArtist] = useState<Artist | null>(null);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(new Set());
  const [batchApproving, setBatchApproving] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  });
  const queryClient = useQueryClient();

  // 使用 React Query 取得待審核藝人
  const { data: pendingArtists = [], isLoading: artistsLoading } = useQuery({
    queryKey: ['admin-pending-artists'],
    queryFn: () => artistsApi.getAll({ status: 'pending', sortBy: 'createdAt', sortOrder: 'asc' }),
    enabled: !!user && userData?.role === 'admin' && activeTab === 'artists',
    staleTime: 5 * 60 * 1000, // 5分鐘內資料視為新鮮，不會重新請求
    gcTime: 10 * 60 * 1000, // 10分鐘後從快取中移除
  });

  // 使用 React Query 取得待審核活動
  const { data: pendingEventsResponse, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-pending-events'],
    queryFn: () => eventsApi.getAll({ status: 'pending', sortBy: 'createdAt', sortOrder: 'asc' }),
    enabled: !!user && userData?.role === 'admin' && activeTab === 'events',
    staleTime: 5 * 60 * 1000, // 5分鐘內資料視為新鮮，不會重新請求
    gcTime: 10 * 60 * 1000, // 10分鐘後從快取中移除
  });

  const pendingEvents = pendingEventsResponse?.events || [];

  // 計算當週日期範圍
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const formatDateForAPI = (date: Date): string => {
    return date.toISOString();
  };

  // 使用 React Query 取得當週生咖列表
  const { data: weeklyEventsResponse, isLoading: weeklyEventsLoading } = useQuery({
    queryKey: ['admin-weekly-events', currentWeekStart.toISOString()],
    queryFn: () =>
      eventsApi.getAll({
        status: 'approved',
        startTimeFrom: formatDateForAPI(currentWeekStart),
        startTimeTo: formatDateForAPI(weekEnd),
        sortBy: 'startTime',
        sortOrder: 'asc',
      }),
    enabled: !!user && userData?.role === 'admin' && activeTab === 'weekly-events',
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const weeklyEvents = weeklyEventsResponse?.events || [];

  const weeklyEventsTitle = useMemo(() => {
    const formatDate = (date: Date): string => `${date.getMonth() + 1}/${date.getDate()}`;
    return `${formatDate(currentWeekStart)} - ${formatDate(weekEnd)} (${weeklyEvents.length} 個生咖)`;
  }, [currentWeekStart, weekEnd, weeklyEvents.length]);

  const weekNavigationTitle = useMemo(() => {
    const thisWeekStart = new Date();
    const day = thisWeekStart.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    thisWeekStart.setDate(thisWeekStart.getDate() + diff);
    thisWeekStart.setHours(0, 0, 0, 0);
    return currentWeekStart.getTime() === thisWeekStart.getTime() ? '本週生咖' : '當週生咖';
  }, [currentWeekStart]);

  const weekNavigationDateRange = useMemo(() => {
    const formatDate = (date: Date): string => `${date.getMonth() + 1}/${date.getDate()}`;
    return `${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}`;
  }, [currentWeekStart, weekEnd]);

  // 權限檢查
  useEffect(() => {
    if (!authLoading && (!user || userData?.role !== 'admin')) {
      showToast.error('權限不足');
      router.push('/');
    }
  }, [user, userData, authLoading, router]);

  // 審核藝人 mutations
  const approveArtistMutation = useMutation({
    mutationFn: ({ id, groupNames }: { id: string; groupNames?: string[] }) =>
      artistsApi.approve(id, groupNames),
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

  // 批次審核藝人 mutation
  const batchReviewMutation = useMutation({
    mutationFn: (
      updates: Array<{
        artistId: string;
        status: 'approved' | 'rejected' | 'exists';
        groupNames?: string[];
        reason?: string;
      }>
    ) => artistsApi.batchReview(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-artists'] });
      setSelectedArtists(new Set());
      setBatchApproving(false);
      showToast.success('批次審核成功');
    },
    onError: () => {
      showToast.error('批次審核失敗');
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

  const handleApproveArtistWithGroupNames = (groupNames?: string[]) => {
    if (!approvingArtist) return;

    approveArtistMutation.mutate(
      { id: approvingArtist.id, groupNames },
      {
        onSuccess: () => {
          setApprovingArtist(null);
        },
      }
    );
  };

  const handleRejectArtist = (artistId: string, reason: string) => {
    if (artistId === 'batch') {
      // 批次拒絕
      handleBatchReject(reason);
      setRejectingArtist(null);
    } else {
      // 單一拒絕
      rejectArtistMutation.mutate(
        { id: artistId, reason },
        {
          onSuccess: () => {
            setRejectingArtist(null);
          },
        }
      );
    }
  };

  const handleExistsArtist = (artistId: string) => {
    markAsExistsMutation.mutate(artistId);
  };

  // 批次審核處理函數
  const handleBatchApprove = (artistGroupNames: { [artistId: string]: string[] }) => {
    if (selectedArtists.size === 0) return;

    const updates = Array.from(selectedArtists).map((artistId) => ({
      artistId,
      status: 'approved' as const,
      groupNames: artistGroupNames[artistId] || [],
    }));

    batchReviewMutation.mutate(updates);
  };

  const handleBatchReject = (reason: string) => {
    if (selectedArtists.size === 0) return;

    const updates = Array.from(selectedArtists).map((artistId) => ({
      artistId,
      status: 'rejected' as const,
      reason,
    }));

    batchReviewMutation.mutate(updates);
  };

  const handleBatchExists = () => {
    if (selectedArtists.size === 0) return;

    const updates = Array.from(selectedArtists).map((artistId) => ({
      artistId,
      status: 'exists' as const,
      reason: '藝人已存在',
    }));

    batchReviewMutation.mutate(updates);
  };

  const handleSelectArtist = (artistId: string, selected: boolean) => {
    const newSelected = new Set(selectedArtists);
    if (selected) {
      newSelected.add(artistId);
    } else {
      newSelected.delete(artistId);
    }
    setSelectedArtists(newSelected);
  };

  const handleSelectAllArtists = (selected: boolean) => {
    if (selected) {
      setSelectedArtists(new Set(pendingArtists.map((artist) => artist.id)));
    } else {
      setSelectedArtists(new Set());
    }
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

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-pending-artists'] });
    const wasRejected = editingArtist?.status === 'rejected';
    setEditingArtist(null);

    if (wasRejected) {
      showToast.success('藝人資料已更新並重新送審');
    } else {
      showToast.success('藝人資料已更新');
    }
  };

  const handleEditCancel = () => {
    setEditingArtist(null);
  };

  if (authLoading || artistsLoading || eventsLoading || weeklyEventsLoading) {
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
            <TabButton $active={activeTab === 'artists'} onClick={() => setActiveTab('artists')}>
              待審偶像
              {pendingArtists.length > 0 && <Badge>{pendingArtists.length}</Badge>}
            </TabButton>
            <TabButton $active={activeTab === 'events'} onClick={() => setActiveTab('events')}>
              待審生咖
              {pendingEvents.length > 0 && <Badge>{pendingEvents.length}</Badge>}
            </TabButton>
            <TabButton
              $active={activeTab === 'weekly-events'}
              onClick={() => setActiveTab('weekly-events')}
            >
              生咖列表
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
              <>
                {/* 批次操作區域 */}
                {selectedArtists.size > 0 && (
                  <BatchActionsContainer>
                    <BatchActionsLeft>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        已選擇 {selectedArtists.size} 位偶像
                      </span>
                    </BatchActionsLeft>
                    <BatchActionsRight>
                      <BatchButton
                        $variant="approve"
                        onClick={() => setBatchApproving(true)}
                        disabled={batchReviewMutation.isPending}
                      >
                        <CheckCircleIcon />
                        批次通過
                      </BatchButton>
                      <BatchButton
                        $variant="exists"
                        onClick={handleBatchExists}
                        disabled={batchReviewMutation.isPending}
                      >
                        <ExclamationTriangleIcon />
                        批次標記已存在
                      </BatchButton>
                      <BatchButton
                        $variant="reject"
                        onClick={() =>
                          setRejectingArtist({ id: 'batch', stageName: '選中的偶像' } as Artist)
                        }
                        disabled={batchReviewMutation.isPending}
                      >
                        <XCircleIcon />
                        批次拒絕
                      </BatchButton>
                    </BatchActionsRight>
                  </BatchActionsContainer>
                )}

                {/* 全選區域 */}
                <div
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--color-border-light)',
                    background: 'white',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Checkbox
                      type="checkbox"
                      checked={
                        selectedArtists.size === pendingArtists.length && pendingArtists.length > 0
                      }
                      onChange={(e) => handleSelectAllArtists(e.target.checked)}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      全選 ({selectedArtists.size}/{pendingArtists.length})
                    </span>
                  </div>
                </div>

                <ItemList>
                  {pendingArtists.map((artist) => (
                    <div key={artist.id} style={{ position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          zIndex: 10,
                          background: 'white',
                          borderRadius: '4px',
                          padding: '4px',
                        }}
                      >
                        <Checkbox
                          type="checkbox"
                          checked={selectedArtists.has(artist.id)}
                          onChange={(e) => handleSelectArtist(artist.id, e.target.checked)}
                        />
                      </div>
                      <VerticalArtistCard
                        artist={artist}
                        submissionTime={
                          artist.createdAt
                            ? new Date(artist.createdAt as string).toLocaleString('zh-TW')
                            : undefined
                        }
                        actionButtons={
                          <ActionButtons>
                            <ActionButton
                              $variant="preview"
                              onClick={() => handleEditArtist(artist)}
                            >
                              <PencilSquareIcon />
                              編輯
                            </ActionButton>
                            <ActionButton
                              $variant="approve"
                              onClick={() => handleApproveArtist(artist)}
                              disabled={approveArtistMutation.isPending}
                            >
                              <CheckCircleIcon />
                              通過
                            </ActionButton>
                            <ActionButton
                              $variant="exists"
                              onClick={() => handleExistsArtist(artist.id)}
                              disabled={markAsExistsMutation.isPending}
                            >
                              <ExclamationTriangleIcon />
                              已存在
                            </ActionButton>
                            <ActionButton
                              $variant="reject"
                              onClick={() => setRejectingArtist(artist)}
                              disabled={rejectArtistMutation.isPending}
                            >
                              <XCircleIcon />
                              拒絕
                            </ActionButton>
                          </ActionButtons>
                        }
                      />
                    </div>
                  ))}
                </ItemList>
              </>
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
                        <ActionButton $variant="preview" onClick={() => handlePreviewEvent(event)}>
                          <EyeIcon />
                          預覽
                        </ActionButton>
                        <ActionButton
                          $variant="approve"
                          onClick={() => handleApproveEvent(event.id)}
                          disabled={approveEventMutation.isPending}
                        >
                          <CheckCircleIcon />
                          通過
                        </ActionButton>
                        <ActionButton
                          $variant="reject"
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

        {/* Weekly Events Tab */}
        {activeTab === 'weekly-events' && (
          <ContentCard>
            <CardHeader>
              <h2>生咖列表</h2>
              <p>{weeklyEventsTitle}</p>
            </CardHeader>

            {/* 週導航 */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border-light)',
                background: 'white',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-light)',
                }}
              >
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    background: 'transparent',
                  }}
                  onClick={() => {
                    const newWeekStart = new Date(currentWeekStart);
                    newWeekStart.setDate(newWeekStart.getDate() - 7);
                    setCurrentWeekStart(newWeekStart);
                  }}
                >
                  <ChevronLeftIcon style={{ width: '20px', height: '20px' }} />
                </button>

                <div
                  style={{
                    textAlign: 'center',
                    flex: 1,
                    margin: '0 16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      margin: '0 0 4px 0',
                    }}
                  >
                    {weekNavigationTitle}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                    }}
                  >
                    {weekNavigationDateRange}
                  </div>
                </div>

                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    background: 'transparent',
                  }}
                  onClick={() => {
                    const newWeekStart = new Date(currentWeekStart);
                    newWeekStart.setDate(newWeekStart.getDate() + 7);
                    setCurrentWeekStart(newWeekStart);
                  }}
                >
                  <ChevronRightIcon style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>

            {weeklyEvents.length === 0 ? (
              <EmptyState>
                <CalendarIcon className="icon" width={48} height={48} />
                <h3>本週沒有生咖</h3>
                <p>當週沒有已審核通過的生日應援活動</p>
              </EmptyState>
            ) : (
              <ItemList>
                {weeklyEvents.map((event) => (
                  <VerticalEventCard
                    key={event.id}
                    event={event}
                    onClick={(event) => handlePreviewEvent(event)}
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
          currentGroupNames={approvingArtist.groupNames}
          onConfirm={handleApproveArtistWithGroupNames}
          onCancel={() => setApprovingArtist(null)}
          isLoading={approveArtistMutation.isPending}
        />
      )}

      {/* 批次審核模態框 */}
      {batchApproving && (
        <BatchGroupNameModal
          isOpen={true}
          artists={pendingArtists.filter((artist) => selectedArtists.has(artist.id))}
          onConfirm={handleBatchApprove}
          onCancel={() => setBatchApproving(false)}
          isLoading={batchReviewMutation.isPending}
        />
      )}

      {/* 編輯藝人模態框 */}
      <EditModal $isOpen={!!editingArtist}>
        <EditModalContent>
          {editingArtist && (
            <ArtistSubmissionForm
              mode="edit"
              existingArtist={editingArtist}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </EditModalContent>
      </EditModal>
    </PageContainer>
  );
}
