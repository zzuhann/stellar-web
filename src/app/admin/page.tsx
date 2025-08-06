'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useEventStore, useArtistStore } from '@/store';
import { firebaseTimestampToDate } from '@/utils';
import showToast from '@/lib/toast';
import styled from 'styled-components';
import EventPreviewModal from '@/components/events/EventPreviewModal';
import { CoffeeEvent } from '@/types';
import Header from '@/components/layout/Header';
import { InstagramIcon, ThreadsIcon, XIcon } from '@/components/ui/SocialMediaIcons';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-bg-primary);
`;

const MainContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 90px 16px;

  @media (min-width: 768px) {
    padding: 40px 24px;
  }
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
    margin: 0;
    line-height: 1.5;
  }
`;

const ItemList = styled.div`
  .item {
    padding: 20px;
    border-bottom: 1px solid var(--color-border-light);
    background: white;

    &:last-child {
      border-bottom: none;
    }
  }
`;

const ArtistItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ArtistInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const ArtistAvatar = styled.div<{ imageUrl?: string }>`
  width: 56px;
  height: 56px;
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
    font-size: 18px;
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

const EventItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EventInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EventTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
`;

const EventDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
  flex-wrap: wrap;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EventTimestamp = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 8px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  justify-content: flex-end;
`;

const ActionButton = styled.button<{ variant: 'approve' | 'reject' | 'preview' }>`
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
  const [loading, setLoading] = useState(false);
  const [previewingEvent, setPreviewingEvent] = useState<CoffeeEvent | null>(null);

  // 狀態管理
  const { artists: pendingArtists, fetchArtists, approveArtist, rejectArtist } = useArtistStore();
  const { events: pendingEvents, fetchEvents, admin } = useEventStore();

  // 權限檢查
  useEffect(() => {
    if (!authLoading && (!user || userData?.role !== 'admin')) {
      showToast.error('權限不足');
      router.push('/');
    }
  }, [user, userData, authLoading, router]);

  // 載入資料
  useEffect(() => {
    if (user && userData?.role === 'admin') {
      fetchArtists({ status: 'pending' });
      fetchEvents({ status: 'pending' });
    }
  }, [user, userData, fetchArtists, fetchEvents]);

  const handleApproveArtist = async (artistId: string) => {
    setLoading(true);
    try {
      await approveArtist(artistId);
      showToast.success('審核成功');
    } catch {
      showToast.error('審核失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectArtist = async (artistId: string) => {
    setLoading(true);
    try {
      await rejectArtist(artistId);
      showToast.success('已拒絕此投稿');
    } catch {
      showToast.error('操作失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    setLoading(true);
    try {
      await admin.approveEvent(eventId);
      showToast.success('審核成功');
    } catch {
      showToast.error('操作失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    setLoading(true);
    try {
      await admin.rejectEvent(eventId);
      showToast.success('已拒絕此投稿');
    } catch {
      showToast.error('操作失敗');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewEvent = (event: CoffeeEvent) => {
    setPreviewingEvent(event);
  };

  if (authLoading) {
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
      {/* Header */}
      <Header />

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
              待審活動
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
                <UserIcon className="icon" />
                <h3>沒有待審核偶像</h3>
                <p>所有偶像投稿都已處理完成</p>
              </EmptyState>
            ) : (
              <ItemList>
                {pendingArtists.map((artist) => (
                  <div key={artist.id} className="item">
                    <ArtistItem>
                      <ArtistInfo>
                        <ArtistAvatar imageUrl={artist.profileImage} />
                        <ArtistDetails>
                          <h3>{artist.stageName}</h3>
                          {artist.realName && <p>{artist.realName}</p>}
                          {artist.birthday && (
                            <p>生日：{new Date(artist.birthday).toLocaleDateString('zh-TW')}</p>
                          )}
                          <p className="timestamp">
                            投稿時間：{new Date(artist.createdAt as string).toLocaleString('zh-TW')}
                          </p>
                        </ArtistDetails>
                      </ArtistInfo>
                      <ActionButtons>
                        <ActionButton
                          variant="approve"
                          onClick={() => handleApproveArtist(artist.id)}
                          disabled={loading}
                        >
                          <CheckCircleIcon />
                          通過
                        </ActionButton>
                        <ActionButton
                          variant="reject"
                          onClick={() => handleRejectArtist(artist.id)}
                          disabled={loading}
                        >
                          <XCircleIcon />
                          拒絕
                        </ActionButton>
                      </ActionButtons>
                    </ArtistItem>
                  </div>
                ))}
              </ItemList>
            )}
          </ContentCard>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <ContentCard>
            <CardHeader>
              <h2>待審核活動</h2>
              <p>{pendingEvents.length} 個活動等待審核</p>
            </CardHeader>
            {pendingEvents.length === 0 ? (
              <EmptyState>
                <CalendarIcon className="icon" />
                <h3>沒有待審核活動</h3>
                <p>所有活動投稿都已處理完成</p>
              </EmptyState>
            ) : (
              <ItemList>
                {pendingEvents.map((event) => (
                  <div key={event.id} className="item">
                    <EventItem>
                      <EventInfo>
                        <EventTitle>{event.title}</EventTitle>
                        <EventDetails>
                          <DetailItem>
                            <CalendarIcon width={16} height={16} />
                            {firebaseTimestampToDate(event.datetime.start).toLocaleDateString(
                              'zh-TW'
                            )}{' '}
                            -{' '}
                            {firebaseTimestampToDate(event.datetime.end).toLocaleDateString(
                              'zh-TW'
                            )}
                          </DetailItem>
                          <DetailItem>
                            <div style={{ flexShrink: 0 }}>
                              <MapPinIcon width={16} height={16} />
                            </div>
                            {event.location.name}({event.location.address})
                          </DetailItem>
                        </EventDetails>

                        {event.socialMedia.instagram && (
                          <EventDetails>
                            <DetailItem>
                              <InstagramIcon size={16} color="var(--color-text-secondary)" />
                              {event.socialMedia.instagram}
                            </DetailItem>
                          </EventDetails>
                        )}

                        {event.socialMedia.x && (
                          <EventDetails>
                            <DetailItem>
                              <XIcon size={16} color="var(--color-text-secondary)" />
                            </DetailItem>
                          </EventDetails>
                        )}

                        {event.socialMedia.threads && (
                          <EventDetails>
                            <DetailItem>
                              <ThreadsIcon size={16} color="var(--color-text-secondary)" />
                            </DetailItem>
                          </EventDetails>
                        )}

                        <EventTimestamp>
                          投稿時間：
                          {firebaseTimestampToDate(event.createdAt).toLocaleString('zh-TW')}
                        </EventTimestamp>
                      </EventInfo>

                      <ActionButtons>
                        <ActionButton variant="preview" onClick={() => handlePreviewEvent(event)}>
                          <EyeIcon />
                          預覽
                        </ActionButton>
                        <ActionButton
                          variant="approve"
                          onClick={() => handleApproveEvent(event.id)}
                          disabled={loading}
                        >
                          <CheckCircleIcon />
                          通過
                        </ActionButton>
                        <ActionButton
                          variant="reject"
                          onClick={() => handleRejectEvent(event.id)}
                          disabled={loading}
                        >
                          <XCircleIcon />
                          拒絕
                        </ActionButton>
                      </ActionButtons>
                    </EventItem>
                  </div>
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
    </PageContainer>
  );
}
