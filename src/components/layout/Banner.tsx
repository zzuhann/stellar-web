'use client';

import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';
import Image from 'next/image';

// Banner 數據類型
interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  description?: string;
}

// Styled Components
const BannerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border-light);

  @media (max-width: 500px) {
    height: 450px;
  }
`;

const SlideContainer = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SlideContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  color: white;
  text-align: center;
`;

const ProductImage = styled(Image)`
  object-fit: cover;
  width: 100%;
  height: 100%;
`;

// 隱藏的預載入容器
const PreloadContainer = styled.div`
  position: absolute;
  top: -9999px;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const PrevButton = styled(NavigationButton)`
  left: 16px;
`;

const NextButton = styled(NavigationButton)`
  right: 16px;
`;

const PaginationDots = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  max-width: 8px;
  max-height: 8px;
  min-width: 8px;
  min-height: 8px;
  padding: 0;
  margin: 0;
  border-radius: 50%;
  background: ${(props) => (props.$active ? 'white' : 'rgba(255, 255, 255, 0.3)')};
  border: ${(props) => (props.$active ? 'none' : '1px solid rgba(255, 255, 255, 0.5)')};
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  flex-shrink: 0;

  &:hover {
    background: ${(props) => (props.$active ? 'white' : 'rgba(255, 255, 255, 0.5)')};
  }
`;

const PageIndicator = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  z-index: 10;
`;

// 預設的 banner 數據
const defaultBannerItems: BannerItem[] = [
  {
    id: '1',
    imageUrl: '/api/placeholder/200/300',
    title: 'Milk Oil',
    subtitle: '33 ingredients',
    description: 'patchouli',
  },
  {
    id: '2',
    imageUrl: '/api/placeholder/200/300',
    title: "Re'lilla",
    subtitle: 'Premium Care',
    description: 'DIRECTIONS FOR USE',
  },
  {
    id: '3',
    imageUrl: '/api/placeholder/200/300',
    title: 'Special Event',
    subtitle: 'Limited Edition',
    description: 'Exclusive Collection',
  },
];

interface BannerProps {
  items?: BannerItem[];
}

export default function Banner({ items = defaultBannerItems }: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  // React Spring 動畫
  const [springs, api] = useSpring(() => ({
    from: { opacity: 0, transform: 'translateX(100%)' },
    to: { opacity: 1, transform: 'translateX(0%)' },
    config: { tension: 200, friction: 20, mass: 1 },
  }));

  // 計算下一張和上一張的索引
  const nextIndex = (currentIndex + 1) % items.length;
  const prevIndex = (currentIndex - 1 + items.length) % items.length;

  // 預載入圖片
  useEffect(() => {
    const preloadImages = () => {
      const imagesToPreload = [nextIndex, prevIndex].filter(
        (index) => !preloadedImages.has(items[index].imageUrl)
      );

      imagesToPreload.forEach((index) => {
        const img = new window.Image();
        img.src = items[index].imageUrl;
        setPreloadedImages((prev) => new Set(prev).add(items[index].imageUrl));
      });
    };

    if (items.length > 1) {
      preloadImages();
    }
  }, [currentIndex, items, nextIndex, prevIndex, preloadedImages]);

  // 切換到下一張
  const nextSlide = () => {
    setCurrentIndex(nextIndex);
  };

  // 切換到上一張
  const prevSlide = () => {
    setCurrentIndex(prevIndex);
  };

  // 直接跳轉到指定索引
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // 當索引改變時觸發動畫
  useEffect(() => {
    api.start({
      from: { opacity: 0, transform: 'translateX(100%)' },
      to: { opacity: 1, transform: 'translateX(0%)' },
      config: { tension: 150, friction: 20, mass: 1.5 },
    });
  }, [currentIndex, api]);

  if (items.length === 0) {
    return null;
  }

  return (
    <BannerContainer>
      <SlideContainer style={springs}>
        <SlideContent>
          <ProductImage
            src={items[currentIndex].imageUrl}
            alt={items[currentIndex].title}
            width={800}
            height={600}
          />
        </SlideContent>
      </SlideContainer>

      {/* 隱藏的預載入圖片 */}
      {items.length > 1 && (
        <PreloadContainer>
          <Image src={items[nextIndex].imageUrl} alt="preload next" width={1} height={1} />
          <Image src={items[prevIndex].imageUrl} alt="preload prev" width={1} height={1} />
        </PreloadContainer>
      )}

      {/* 導航按鈕 */}
      {items.length > 1 && (
        <>
          <PrevButton onClick={prevSlide}>
            <ChevronLeftIcon />
          </PrevButton>
          <NextButton onClick={nextSlide}>
            <ChevronRightIcon />
          </NextButton>
        </>
      )}

      {/* 分頁指示器 */}
      {items.length > 1 && (
        <PaginationDots>
          {items.map((_, index) => (
            <Dot key={index} $active={index === currentIndex} onClick={() => goToSlide(index)} />
          ))}
        </PaginationDots>
      )}

      {/* 頁面指示器 */}
      <PageIndicator>
        {currentIndex + 1} / {items.length}
      </PageIndicator>
    </BannerContainer>
  );
}
