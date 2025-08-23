'use client';

import styled from 'styled-components';
import { CoffeeEvent } from '@/types';
import Banner from '@/components/layout/Banner';
import { firebaseTimestampToDate } from '@/utils';
import { CalendarIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { InstagramIcon, ThreadsIcon, XIcon } from '../ui/SocialMediaIcons';
import { useScrollLock } from '@/hooks/useScrollLock';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface EventPreviewModalProps {
  event: CoffeeEvent;
  isOpen: boolean;
  onClose: () => void;
}

// Styled Components - 重用 event detail 頁面的樣式
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
  z-index: 100;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  position: sticky;
  top: 0;
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-secondary);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

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
`;

const ArtistAvatar = styled.div<{ imageUrl?: string }>`
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

export default function EventPreviewModal({ event, isOpen, onClose }: EventPreviewModalProps) {
  const router = useRouter();
  // 使用 scroll lock hook
  useScrollLock(isOpen);

  if (!isOpen) return null;

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
      event.detailImage.forEach((image, index) => {
        items.push({
          id: `detail-${index}`,
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

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>生咖預覽</ModalTitle>
          <CloseButton onClick={onClose}>
            <XMarkIcon />
          </CloseButton>
        </ModalHeader>

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
                  <ArtistAvatar imageUrl={artist.profileImage} />
                  <ArtistName>{artist.name || 'Unknown Artist'}</ArtistName>
                </ArtistItem>
              </div>
            ))}
          </ArtistSection>

          {/* 主辦資訊 */}
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

          {/* 時間地點 */}
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
                    // 帶入 lat, lng
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
        </ContentSection>

        {/* Banner 項目圖片 - 滿版顯示 */}
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
      </ModalContent>
    </ModalOverlay>
  );
}
