'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { CoffeeEvent, FirebaseTimestamp } from '@/types';
import EventSubmissionForm from '@/components/forms/EventSubmissionForm';
import EventPreviewModal from '@/components/events/EventPreviewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { showToast } from '@/lib/toast';
import { firebaseTimestampToDate } from '@/utils';
import styled from 'styled-components';
import Header from '@/components/layout/Header';

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
    font-size: 48px;
    margin-bottom: 16px;
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

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

const ItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);

  &:last-child {
    border-bottom: none;
  }
`;

const ArtistItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ArtistInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const ArtistAvatar = styled.div<{ imageUrl?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background-image: url(${(props) => props.imageUrl ?? ''});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--color-bg-secondary);
  flex-shrink: 0;
`;

const ArtistDetails = styled.div`
  flex: 1;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 4px 0;
  }

  p {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0 0 2px 0;
  }

  .timestamp {
    font-size: 12px;
    color: var(--color-text-secondary);
  }
`;

const ArtistStatusSection = styled.div`
  flex-shrink: 0;
  width: 100%;
`;

const ArtistStatusBadge = styled.span<{ status: 'pending' | 'approved' | 'rejected' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;

  ${(props) => {
    switch (props.status) {
      case 'approved':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'rejected':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
      case 'pending':
      default:
        return `
          background: #fef3c7;
          color: #92400e;
        `;
    }
  }}
`;

const EventItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
`;

const EventInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EventTitle = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  margin-bottom: 4px;
`;

const BottomSection = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DescriptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);

  @media (max-width: 400px) {
    font-size: 12px;
  }
`;

const Description = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

// 藝人資訊區域 - 參考 event detail 頁面
const EventArtistSection = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 12px;
`;

const TopLeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EventArtistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const EventArtistAvatar = styled.div<{ imageUrl?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  background-image: url(${(props) => props.imageUrl ?? ''});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--color-bg-secondary);
  flex-shrink: 0;
`;

const EventArtistName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
`;

const EventArtistSeparator = styled.span`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 4px;
`;

const EventTimestamp = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ variant: 'edit' | 'delete' }>`
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
    width: 14px;
    height: 14px;
  }
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 120px;
  flex-shrink: 0;
`;

const StatusBadge = styled.span<{ status: 'pending' | 'approved' | 'rejected' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;

  ${(props) => {
    switch (props.status) {
      case 'approved':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'rejected':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
      case 'pending':
      default:
        return `
          background: #fef3c7;
          color: #92400e;
        `;
    }
  }}
`;

const StatusMessage = styled.p<{ status: 'pending' | 'approved' | 'rejected' }>`
  font-size: 12px;
  margin: 0;
  text-align: right;

  ${(props) => {
    switch (props.status) {
      case 'approved':
        return `color: #166534;`;
      case 'rejected':
        return `color: #991b1b;`;
      case 'pending':
      default:
        return `color: #92400e;`;
    }
  }}
`;

const RejectedReasonContainer = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  border-left: 3px solid #dc2626;
`;

const RejectedReasonLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const RejectedReasonText = styled.p`
  font-size: 12px;
  color: #991b1b;
  margin: 0;
  line-height: 1.4;
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 16px;
  grid-template-columns: repeat(4, 1fr);
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 8px;
  text-align: center;
`;

const StatNumber = styled.div<{ color: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.color};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
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

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

export default function MySubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'artists' | 'events'>('artists');
  const [editingEvent, setEditingEvent] = useState<CoffeeEvent | null>(null);
  const [previewingEvent, setPreviewingEvent] = useState<CoffeeEvent | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    event: CoffeeEvent | null;
  }>({ isOpen: true, event: null });
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

  // 處理編輯活動
  const handleEditEvent = useCallback((event: CoffeeEvent) => {
    setEditingEvent(event);
  }, []);

  // 處理預覽活動
  const handlePreviewEvent = useCallback((event: CoffeeEvent) => {
    setPreviewingEvent(event);
  }, []);

  // 處理刪除活動
  const handleDeleteEvent = useCallback((event: CoffeeEvent) => {
    setDeleteConfirmModal({ isOpen: true, event });
  }, []);

  // 確認刪除活動
  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmModal.event) {
      deleteEventMutation.mutate(deleteConfirmModal.event.id);
      setDeleteConfirmModal({ isOpen: false, event: null });
    }
  }, [deleteConfirmModal.event, deleteEventMutation]);

  // 取消刪除活動
  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmModal({ isOpen: false, event: null });
  }, []);

  // 編輯成功後的處理
  const handleEditSuccess = useCallback(() => {
    setEditingEvent(null);
    queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
    showToast.success('活動資訊更新成功');
  }, [queryClient]);

  const getStatusBadge = useCallback((status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return (
          <ArtistStatusBadge status={status}>
            <CheckCircleIcon className="h-3 w-3" />
            已通過
          </ArtistStatusBadge>
        );
      case 'rejected':
        return (
          <ArtistStatusBadge status={status}>
            <XCircleIcon className="h-3 w-3" />
            已拒絕
          </ArtistStatusBadge>
        );
      case 'pending':
      default:
        return (
          <ArtistStatusBadge status={status}>
            <PendingIcon className="h-3 w-3" />
            審核中
          </ArtistStatusBadge>
        );
    }
  }, []);

  if (authLoading || loading) {
    return (
      <PageContainer>
        <Header />
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
      <Header />

      <MainContainer>
        <ContentWrapper>
          {/* 統計摘要 */}
          {userSubmissions &&
            (userSubmissions.summary.totalArtists > 0 ||
              userSubmissions.summary.totalEvents > 0) && (
              <StatsGrid>
                <StatCard>
                  <StatNumber color="var(--color-primary)">
                    {userSubmissions.summary.totalArtists + userSubmissions.summary.totalEvents}
                  </StatNumber>
                  <StatLabel>總投稿數</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber color="#16a34a">
                    {userSubmissions.summary.approvedArtists +
                      userSubmissions.summary.approvedEvents}
                  </StatNumber>
                  <StatLabel>已通過</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber color="#ca8a04">
                    {userSubmissions.summary.pendingArtists + userSubmissions.summary.pendingEvents}
                  </StatNumber>
                  <StatLabel>審核中</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber color="#dc2626">
                    {userSubmissions.summary.totalArtists -
                      userSubmissions.summary.approvedArtists -
                      userSubmissions.summary.pendingArtists +
                      (userSubmissions.summary.totalEvents -
                        userSubmissions.summary.approvedEvents -
                        userSubmissions.summary.pendingEvents)}
                  </StatNumber>
                  <StatLabel>未通過</StatLabel>
                </StatCard>
              </StatsGrid>
            )}

          {/* 標籤頁 */}
          <TabContainer>
            <TabNav>
              <TabButton active={activeTab === 'artists'} onClick={() => setActiveTab('artists')}>
                偶像投稿
              </TabButton>
              <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')}>
                活動投稿
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
                <ItemList>
                  {userArtists.map((artist) => (
                    <ItemContainer key={artist.id}>
                      <ArtistItem>
                        <ArtistInfo>
                          <ArtistAvatar imageUrl={artist.profileImage} />
                          <ArtistDetails>
                            <h3>
                              {artist.stageName} ({artist.realName})
                            </h3>
                            {artist.birthday && (
                              <p>🎂 {new Date(artist.birthday).toLocaleDateString('zh-TW')}</p>
                            )}
                            <p className="timestamp">
                              投稿時間：
                              {firebaseTimestampToDate(
                                artist.createdAt as FirebaseTimestamp
                              ).toLocaleString('zh-TW')}
                            </p>
                          </ArtistDetails>
                        </ArtistInfo>

                        <ArtistStatusSection>
                          {artist.status === 'rejected' && artist.rejectedReason && (
                            <RejectedReasonContainer>
                              <RejectedReasonLabel>拒絕原因</RejectedReasonLabel>
                              <RejectedReasonText>{artist.rejectedReason}</RejectedReasonText>
                            </RejectedReasonContainer>
                          )}
                        </ArtistStatusSection>
                      </ArtistItem>
                      {getStatusBadge(artist.status)}
                    </ItemContainer>
                  ))}
                </ItemList>
              )}
            </ContentCard>
          )}

          {/* 活動標籤頁 */}
          {activeTab === 'events' && userSubmissions && (
            <ContentCard>
              <CardHeader>
                <h2>我投稿的活動</h2>
                <p>共 {userEvents.length} 個活動投稿</p>
              </CardHeader>

              {userEvents.length === 0 ? (
                <EmptyState>
                  <div className="icon">📅</div>
                  <h3>還沒有活動投稿</h3>
                  <p>分享您發現的應援咖啡活動吧！</p>
                  <CTAButton onClick={() => router.push('/')}>前往投稿</CTAButton>
                </EmptyState>
              ) : (
                <ItemList>
                  {userEvents.map((event) => (
                    <EventItem key={event.id}>
                      <EventInfo>
                        <TopSection>
                          <TopLeftSection>
                            <EventTitle>{event.title}</EventTitle>

                            <EventArtistSection>
                              {event.artists?.map((artist, index) => (
                                <div
                                  key={artist.id || index}
                                  style={{ display: 'flex', alignItems: 'center' }}
                                >
                                  {index > 0 && <EventArtistSeparator>/</EventArtistSeparator>}
                                  <EventArtistItem>
                                    <EventArtistAvatar imageUrl={artist.profileImage} />
                                    <EventArtistName>
                                      {artist.name || 'Unknown Artist'}
                                    </EventArtistName>
                                  </EventArtistItem>
                                </div>
                              ))}
                            </EventArtistSection>
                          </TopLeftSection>
                          <StatusSection>
                            <StatusBadge status={event.status}>
                              {event.status === 'approved' && (
                                <CheckCircleIcon className="h-3 w-3" />
                              )}
                              {event.status === 'rejected' && <XCircleIcon className="h-3 w-3" />}
                              {event.status === 'pending' && <PendingIcon className="h-3 w-3" />}
                              {event.status === 'approved' && '已通過'}
                              {event.status === 'rejected' && '未通過'}
                              {event.status === 'pending' && '審核中'}
                            </StatusBadge>
                            {event.status === 'approved' && (
                              <StatusMessage status={event.status}>
                                活動已顯示在地圖上!
                              </StatusMessage>
                            )}
                            {event.status === 'pending' && (
                              <StatusMessage status={event.status}>⏳ 等待管理員審核</StatusMessage>
                            )}
                            {event.status === 'rejected' && event.rejectedReason && (
                              <RejectedReasonContainer>
                                <RejectedReasonLabel>拒絕原因</RejectedReasonLabel>
                                <RejectedReasonText>{event.rejectedReason}</RejectedReasonText>
                              </RejectedReasonContainer>
                            )}
                          </StatusSection>
                        </TopSection>

                        <BottomSection>
                          <DescriptionContainer>
                            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                            <Description>
                              {firebaseTimestampToDate(event.datetime.start).toLocaleDateString(
                                'zh-TW'
                              )}{' '}
                              -{' '}
                              {firebaseTimestampToDate(event.datetime.end).toLocaleDateString(
                                'zh-TW'
                              )}
                            </Description>
                          </DescriptionContainer>
                          <DescriptionContainer>
                            <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                            <Description>
                              {event.location.name && `${event.location.name}`}
                              {event.location.address && `(${event.location.address})`}
                            </Description>
                          </DescriptionContainer>

                          <EventTimestamp>
                            投稿時間：
                            {firebaseTimestampToDate(event.createdAt).toLocaleString('zh-TW')}
                          </EventTimestamp>

                          <ActionButtons>
                            <ActionButton
                              variant="edit"
                              onClick={() => handlePreviewEvent(event)}
                              title="預覽活動"
                            >
                              <EyeIcon />
                              預覽
                            </ActionButton>
                            <ActionButton
                              variant="edit"
                              onClick={() => handleEditEvent(event)}
                              title="編輯活動"
                            >
                              <PencilIcon />
                              編輯
                            </ActionButton>
                            <ActionButton
                              variant="delete"
                              onClick={() => handleDeleteEvent(event)}
                              disabled={deleteEventMutation.isPending}
                              title="刪除活動"
                            >
                              <TrashIcon />
                              {deleteEventMutation.isPending ? '刪除中...' : '刪除'}
                            </ActionButton>
                          </ActionButtons>
                        </BottomSection>
                      </EventInfo>
                    </EventItem>
                  ))}
                </ItemList>
              )}
            </ContentCard>
          )}
        </ContentWrapper>
      </MainContainer>

      {/* 編輯活動模態框 */}
      {editingEvent && (
        <ModalOverlay>
          <ModalContent>
            <EventSubmissionForm
              mode="edit"
              existingEvent={editingEvent}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingEvent(null)}
            />
          </ModalContent>
        </ModalOverlay>
      )}

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
