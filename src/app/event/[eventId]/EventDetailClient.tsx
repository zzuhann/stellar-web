'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useEvent } from '@/hooks/useEvent';
import Banner from '@/components/layout/Banner';
import { firebaseTimestampToDate } from '@/utils';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { InstagramIcon, ThreadsIcon, XIcon } from '@/components/ui/SocialMediaIcons';
import Image from 'next/image';

// Styled Components - 參考 EventSubmissionForm 的設計風格
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: var(--color-bg-primary);
`;

const MainContainer = styled.div`
  padding-top: 70px;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--color-text-secondary);
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px 20px;

  h1 {
    color: var(--color-text-primary);
    margin-bottom: 16px;
  }

  p {
    color: var(--color-text-secondary);
  }
`;

// 主要內容區域
const ContentSection = styled.div`
  background: #fff;
  padding: 0 20px 16px 20px;
  margin-bottom: 24px;
`;

const EventTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (min-width: 768px) {
    font-size: 24px;
  }
`;

// 藝人資訊區域
const ArtistSection = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border-light);
`;

const ArtistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

const ArtistAvatar = styled.div<{ $imageUrl?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  background-image: url(${(props) => props.$imageUrl ?? ''});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--color-bg-secondary);
  flex-shrink: 0;
`;

const ArtistName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
`;

const ArtistSeparator = styled.span`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 4px;
`;

// 活動詳情區域
const EventDetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 4px;
`;

const DetailIcon = styled.div`
  width: 20px;
  height: 20px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  margin-top: 2px;
`;

const DetailContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
`;

// 活動說明區域
const DescriptionSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border-light);
`;

const DescriptionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DescriptionContent = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
`;

// CTA 按鈕樣式
const CTAButton = styled.button`
  padding: 10px 40px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 32px;
  margin-bottom: 20px;

  &:hover {
    background: #3a5d7a;
    border-color: #3a5d7a;
    transform: translateX(-50%) translateY(-1px);
  }

  &:active {
    transform: translateX(-50%) translateY(0);
  }
`;

// 藝人選擇模態框
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  margin: 20px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
  text-align: center;
`;

const ArtistOption = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: white;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-medium);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const CancelButton = styled.button`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-text-secondary);
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-secondary);
  }
`;

interface EventDetailClientProps {
  eventId: string;
}

export default function EventDetailClient({ eventId }: EventDetailClientProps) {
  const router = useRouter();
  const [showArtistModal, setShowArtistModal] = useState(false);

  // 使用 React Query 獲取事件詳情
  const { data: event, isLoading, error } = useEvent(eventId);

  const formatEventDate = (startDate: any, endDate: any) => {
    const start = firebaseTimestampToDate(startDate);
    const end = firebaseTimestampToDate(endDate);

    const startStr = start.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const endStr = end.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return `${startStr} - ${endStr}`;
  };

  // 準備 banner 數據
  const getBannerItems = () => {
    if (!event) return [];

    const items = [];

    // 主圖
    if (event.mainImage) {
      items.push({
        id: 'main',
        imageUrl: event.mainImage,
        title: event.title,
        subtitle: '主視覺',
      });
    }

    // 詳細圖片
    if (event.detailImage && event.detailImage.length > 0) {
      event.detailImage.forEach((image) => {
        items.push({
          id: 'detail',
          imageUrl: image,
          title: event.title,
          subtitle: '生咖詳情',
        });
      });
    }

    // 如果沒有圖片，使用預設圖片
    if (items.length === 0) {
      items.push({
        id: 'default',
        imageUrl: '/api/placeholder/400/600',
        title: event.title,
        subtitle: '生咖圖片',
      });
    }

    return items;
  };

  // 處理回到地圖頁按鈕點擊
  const handleBackToMap = () => {
    if (!event?.artists || event.artists.length === 0) {
      router.push('/map');
      return;
    }

    if (event.artists.length === 1) {
      // 只有一個藝人，直接跳轉
      router.push(`/map?artistId=${event.artists[0].id}`);
    } else {
      // 多個藝人，顯示選擇模態框
      setShowArtistModal(true);
    }
  };

  // 處理藝人選擇
  const handleArtistSelect = (artistId: string) => {
    setShowArtistModal(false);
    router.push(`/map?artistId=${artistId}`);
  };

  // 關閉模態框
  const handleCloseModal = () => {
    setShowArtistModal(false);
  };

  return (
    <PageContainer>
      <MainContainer>
        {isLoading && (
          <LoadingContainer>
            <div>載入中...</div>
          </LoadingContainer>
        )}

        {error && (
          <ErrorContainer>
            <h1>載入失敗</h1>
            <p>載入生咖時發生錯誤</p>
          </ErrorContainer>
        )}

        {event && !isLoading && !error && (
          <>
            {/* Banner 區域 */}
            <Banner items={getBannerItems()} />

            {/* 主要內容 */}
            <ContentSection>
              <EventTitle>{event.title}</EventTitle>

              {/* 藝人資訊 */}
              <ArtistSection>
                {event.artists?.map((artist, index) => (
                  <div key={artist.id || index} style={{ display: 'flex', alignItems: 'center' }}>
                    {index > 0 && <ArtistSeparator>/</ArtistSeparator>}
                    <ArtistItem onClick={() => router.push(`/map?artistId=${artist.id}`)}>
                      <ArtistAvatar $imageUrl={artist.profileImage} />
                      <ArtistName>{artist.name || 'Unknown Artist'}</ArtistName>
                    </ArtistItem>
                  </div>
                ))}
              </ArtistSection>

              <DescriptionTitle>主辦</DescriptionTitle>
              <EventDetailsSection>
                {event.socialMedia.instagram && (
                  <DetailItem>
                    <InstagramIcon size={20} color="var(--color-text-secondary)" />
                    <DetailContent>
                      <DetailValue>
                        <a
                          href={`https://www.instagram.com/${event.socialMedia.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3a64c7' }}
                        >
                          @{event.socialMedia.instagram}
                        </a>
                      </DetailValue>
                    </DetailContent>
                  </DetailItem>
                )}

                {event.socialMedia.threads && (
                  <DetailItem>
                    <ThreadsIcon size={20} color="var(--color-text-secondary)" />
                    <DetailContent>
                      <DetailValue>
                        <a
                          href={`https://www.threads.net/@${event.socialMedia.threads}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3a64c7' }}
                        >
                          @{event.socialMedia.threads}
                        </a>
                      </DetailValue>
                    </DetailContent>
                  </DetailItem>
                )}

                {event.socialMedia.x && (
                  <DetailItem>
                    <XIcon size={20} color="var(--color-text-secondary)" />
                    <DetailContent>
                      <DetailValue>
                        <a
                          href={`https://x.com/${event.socialMedia.x}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3a64c7' }}
                        >
                          @{event.socialMedia.x}
                        </a>
                      </DetailValue>
                    </DetailContent>
                  </DetailItem>
                )}
              </EventDetailsSection>

              {/* 活動詳情 */}
              <DescriptionSection>
                <DescriptionTitle>時間/地點</DescriptionTitle>
                <DetailItem>
                  <DetailIcon>
                    <CalendarIcon />
                  </DetailIcon>
                  <DetailContent>
                    <DetailValue>
                      {formatEventDate(event.datetime.start, event.datetime.end)}
                    </DetailValue>
                  </DetailContent>
                </DetailItem>

                <DetailItem>
                  <DetailIcon>
                    <MapPinIcon />
                  </DetailIcon>
                  <DetailContent>
                    <DetailValue>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${event.location.coordinates.lat},${event.location.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3a64c7' }}
                      >
                        {event.location.name}({event.location.address}){' '}
                      </a>
                    </DetailValue>
                  </DetailContent>
                </DetailItem>
              </DescriptionSection>

              {/* 活動說明 */}
              {event.description && (
                <DescriptionSection>
                  <DescriptionTitle>詳細說明</DescriptionTitle>
                  <DescriptionContent>{event.description}</DescriptionContent>
                </DescriptionSection>
              )}

              <div>
                {getBannerItems().map((item, index) => (
                  <div key={item.id}>
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={800}
                      height={600}
                      quality={95}
                      priority={index === 0}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* 回到地圖頁按鈕 */}
              <CTAButton onClick={handleBackToMap}>
                回地圖頁
                <br />
                看其他生咖
              </CTAButton>
            </ContentSection>
          </>
        )}
      </MainContainer>

      {/* 藝人選擇模態框 */}
      {showArtistModal && event && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>選擇要查看的偶像</ModalTitle>
            {event.artists?.map((artist) => (
              <ArtistOption key={artist.id} onClick={() => handleArtistSelect(artist.id)}>
                <ArtistAvatar $imageUrl={artist.profileImage} />
                <ArtistName>{artist.name || 'Unknown Artist'}</ArtistName>
              </ArtistOption>
            ))}
            <CancelButton onClick={handleCloseModal}>取消</CancelButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}
