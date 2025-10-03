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
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artistsApi, eventsApi } from '@/lib/api';
import showToast from '@/lib/toast';
import { css, cva } from '@/styled-system/css';
import EventPreviewModal from '@/components/events/EventPreviewModal';
import RejectModal from '@/components/admin/RejectModal';
import GroupNameModal from '@/components/admin/GroupNameModal';
import BatchGroupNameModal from '@/components/admin/BatchGroupNameModal';
import ArtistSubmissionForm from '@/components/forms/ArtistSubmissionForm';
import { CoffeeEvent, Artist } from '@/types';
import VerticalEventCard from '@/components/EventCard/VerticalEventCard';
import VerticalArtistCard from '@/components/ArtistCard/VerticalArtistCard';
import Loading from '@/components/Loading';

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

const mainContainer = css({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '100px 16px',
});

const tabContainer = css({
  marginBottom: '24px',
});

const tabNav = css({
  display: 'flex',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  padding: '4px',
});

const tabButton = cva({
  base: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 'radius.md',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  variants: {
    active: {
      true: {
        background: 'color.primary',
        color: 'white',
        '&:hover': {
          background: 'color.primary',
        },
      },
      false: {
        background: 'transparent',
        color: 'color.text.primary',
        '&:hover': {
          background: 'color.border.light',
        },
      },
    },
  },
});

const badge = css({
  background: '#fee2e2',
  color: '#991b1b',
  fontSize: '12px',
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 'radius.md',
});

const contentCard = css({
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
});

const cardHeader = css({
  padding: '20px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  background: 'white',
  '& h2': {
    fontSize: '18px',
    fontWeight: 600,
    color: 'color.text.primary',
    margin: '0 0 4px 0',
  },
  '& p': {
    fontSize: '14px',
    color: 'color.text.secondary',
    margin: '0',
  },
});

const emptyState = css({
  textAlign: 'center',
  padding: '60px 20px',
  color: 'color.text.secondary',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  '& h3': {
    fontSize: '18px',
    fontWeight: 600,
    color: 'color.text.primary',
  },
  '& p': {
    fontSize: '14px',
    margin: '0',
    lineHeight: 1.5,
  },
});

const itemList = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
  padding: '20px',
});

const actionButtons = css({
  display: 'flex',
  gap: '8px',
  flexShrink: 0,
  justifyContent: 'flex-end',
  height: '60px',
  alignItems: 'center',
});

const actionButton = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  borderRadius: 'radius.md',
  fontSize: '13px',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },
  '& svg': {
    width: '14px',
    height: '14px',
  },
});

const actionButtonApprove = css({
  background: '#16a34a',
  borderColor: '#16a34a',
  color: 'white',
  '&:hover:not(:disabled)': {
    background: '#15803d',
    borderColor: '#15803d',
    transform: 'translateY(-1px)',
    boxShadow: 'shadow.sm',
  },
  '&:active:not(:disabled)': {
    transform: 'translateY(0)',
  },
});

const actionButtonReject = css({
  background: '#dc2626',
  borderColor: '#dc2626',
  color: 'white',
  '&:hover:not(:disabled)': {
    background: '#b91c1c',
    borderColor: '#b91c1c',
    transform: 'translateY(-1px)',
    boxShadow: 'shadow.sm',
  },
  '&:active:not(:disabled)': {
    transform: 'translateY(0)',
  },
});

const actionButtonPreview = css({
  background: 'color.background.primary',
  borderColor: 'color.border.light',
  color: 'color.text.primary',
  '&:hover:not(:disabled)': {
    background: 'color.background.secondary',
    borderColor: 'color.border.medium',
    transform: 'translateY(-1px)',
    boxShadow: 'shadow.sm',
  },
  '&:active:not(:disabled)': {
    transform: 'translateY(0)',
  },
});

const actionButtonExists = css({
  background: '#f59e0b',
  borderColor: '#f59e0b',
  color: 'white',
  '&:hover:not(:disabled)': {
    background: '#d97706',
    borderColor: '#d97706',
    transform: 'translateY(-1px)',
    boxShadow: 'shadow.sm',
  },
  '&:active:not(:disabled)': {
    transform: 'translateY(0)',
  },
});

const batchActionsContainer = css({
  padding: '16px 20px',
  background: '#f8fafc',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
});

const batchActionsLeft = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const batchActionsRight = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const checkbox = css({
  width: '16px',
  height: '16px',
  cursor: 'pointer',
});

const batchButton = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  borderRadius: 'radius.md',
  fontSize: '13px',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },
  '& svg': {
    width: '14px',
    height: '14px',
  },
});

const batchButtonApprove = css({
  background: '#16a34a',
  borderColor: '#16a34a',
  color: 'white',
  '&:hover:not(:disabled)': {
    background: '#15803d',
    borderColor: '#15803d',
    transform: 'translateY(-1px)',
    boxShadow: 'shadow.sm',
  },
});

const batchButtonReject = css({
  background: '#dc2626',
  borderColor: '#dc2626',
  color: 'white',
  '&:hover:not(:disabled)': {
    background: '#b91c1c',
    borderColor: '#b91c1c',
    transform: 'translateY(-1px)',
    boxShadow: 'shadow.sm',
  },
});

const batchButtonExists = css({
  background: '#f59e0b',
  borderColor: '#f59e0b',
  color: 'white',
  '&:hover:not(:disabled)': {
    background: '#d97706',
    borderColor: '#d97706',
    transform: 'translateY(-1px)',
    boxShadow: 'shadow.sm',
  },
});

const editModal = css({
  position: 'fixed',
  inset: '0',
  zIndex: 1000,
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.5)',
  padding: '16px',
});

const editModalOpen = css({
  display: 'flex',
});

const editModalClosed = css({
  display: 'none',
});

const editModalContent = css({
  background: 'color.background.primary',
  borderRadius: 'radius.lg',
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
});

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'artists' | 'events'>('artists');
  const [previewingEvent, setPreviewingEvent] = useState<CoffeeEvent | null>(null);
  const [rejectingArtist, setRejectingArtist] = useState<Artist | null>(null);
  const [rejectingEvent, setRejectingEvent] = useState<CoffeeEvent | null>(null);
  const [approvingArtist, setApprovingArtist] = useState<Artist | null>(null);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(new Set());
  const [batchApproving, setBatchApproving] = useState(false);
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

  const isLoading = authLoading || artistsLoading || eventsLoading;

  if (isLoading) {
    return <Loading description="載入中..." style={{ height: '100vh', width: '100%' }} />;
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <div className={pageContainer}>
      {/* Main Content */}
      <div className={mainContainer}>
        {/* Tabs */}
        <div className={tabContainer}>
          <nav className={tabNav}>
            <button
              className={tabButton({ active: activeTab === 'artists' })}
              onClick={() => setActiveTab('artists')}
            >
              待審偶像
              {pendingArtists.length > 0 && <span className={badge}>{pendingArtists.length}</span>}
            </button>
            <button
              className={tabButton({ active: activeTab === 'events' })}
              onClick={() => setActiveTab('events')}
            >
              待審生咖
              {pendingEvents.length > 0 && <span className={badge}>{pendingEvents.length}</span>}
            </button>
          </nav>
        </div>

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <div className={contentCard}>
            <div className={cardHeader}>
              <h2>待審核偶像</h2>
              <p>{pendingArtists.length} 位偶像等待審核</p>
            </div>
            {pendingArtists.length === 0 ? (
              <div className={emptyState}>
                <UserIcon className="icon" width={48} height={48} />
                <h3>沒有待審核偶像</h3>
                <p>所有偶像投稿都已處理完成</p>
              </div>
            ) : (
              <>
                {/* 批次操作區域 */}
                {selectedArtists.size > 0 && (
                  <div className={batchActionsContainer}>
                    <div className={batchActionsLeft}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        已選擇 {selectedArtists.size} 位偶像
                      </span>
                    </div>
                    <div className={batchActionsRight}>
                      <button
                        className={`${batchButton} ${batchButtonApprove}`}
                        onClick={() => setBatchApproving(true)}
                        disabled={batchReviewMutation.isPending}
                      >
                        <CheckCircleIcon />
                        批次通過
                      </button>
                      <button
                        className={`${batchButton} ${batchButtonExists}`}
                        onClick={handleBatchExists}
                        disabled={batchReviewMutation.isPending}
                      >
                        <ExclamationTriangleIcon />
                        批次標記已存在
                      </button>
                      <button
                        className={`${batchButton} ${batchButtonReject}`}
                        onClick={() =>
                          setRejectingArtist({ id: 'batch', stageName: '選中的偶像' } as Artist)
                        }
                        disabled={batchReviewMutation.isPending}
                      >
                        <XCircleIcon />
                        批次拒絕
                      </button>
                    </div>
                  </div>
                )}

                {/* 全選區域 */}
                <div
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid',
                    borderBottomColor: 'var(--color-border-light)',
                    background: 'white',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      className={checkbox}
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

                <div className={itemList}>
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
                        <input
                          className={checkbox}
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
                          <div className={actionButtons}>
                            <button
                              className={`${actionButton} ${actionButtonPreview}`}
                              onClick={() => handleEditArtist(artist)}
                            >
                              <PencilSquareIcon />
                              編輯
                            </button>
                            <button
                              className={`${actionButton} ${actionButtonApprove}`}
                              onClick={() => handleApproveArtist(artist)}
                              disabled={approveArtistMutation.isPending}
                            >
                              <CheckCircleIcon />
                              通過
                            </button>
                            <button
                              className={`${actionButton} ${actionButtonExists}`}
                              onClick={() => handleExistsArtist(artist.id)}
                              disabled={markAsExistsMutation.isPending}
                            >
                              <ExclamationTriangleIcon />
                              已存在
                            </button>
                            <button
                              className={`${actionButton} ${actionButtonReject}`}
                              onClick={() => setRejectingArtist(artist)}
                              disabled={rejectArtistMutation.isPending}
                            >
                              <XCircleIcon />
                              拒絕
                            </button>
                          </div>
                        }
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className={contentCard}>
            <div className={cardHeader}>
              <h2>待審核生咖</h2>
              <p>{pendingEvents.length} 個生咖等待審核</p>
            </div>
            {pendingEvents.length === 0 ? (
              <div className={emptyState}>
                <CalendarIcon className="icon" width={48} height={48} />
                <h3>沒有待審核生咖</h3>
                <p>所有生咖投稿都已處理完成</p>
              </div>
            ) : (
              <div className={itemList}>
                {pendingEvents.map((event) => (
                  <VerticalEventCard
                    key={event.id}
                    event={event}
                    actionButtons={
                      <div className={actionButtons}>
                        <button
                          className={`${actionButton} ${actionButtonPreview}`}
                          onClick={() => handlePreviewEvent(event)}
                        >
                          <EyeIcon />
                          預覽
                        </button>
                        <button
                          className={`${actionButton} ${actionButtonApprove}`}
                          onClick={() => handleApproveEvent(event.id)}
                          disabled={approveEventMutation.isPending}
                        >
                          <CheckCircleIcon />
                          通過
                        </button>
                        <button
                          className={`${actionButton} ${actionButtonReject}`}
                          onClick={() => setRejectingEvent(event)}
                          disabled={rejectEventMutation.isPending}
                        >
                          <XCircleIcon />
                          拒絕
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
      <div className={`${editModal} ${!!editingArtist ? editModalOpen : editModalClosed}`}>
        <div className={editModalContent}>
          {editingArtist && (
            <ArtistSubmissionForm
              mode="edit"
              existingArtist={editingArtist}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
}
