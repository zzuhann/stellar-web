'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, MapPinIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';
import { eventSubmissionSchema, EventSubmissionFormData } from '@/lib/validations';
import { useEventStore, useArtistStore, useUIStore } from '@/store';
import { useAuth } from '@/lib/auth-context';
import PlaceAutocomplete from './PlaceAutocomplete';
import { useRouter } from 'next/navigation';

// Styled Components - 與其他組件保持一致的設計風格
const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 32px;

  @media (min-width: 768px) {
    padding: 40px;
  }
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border-light);

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 8px 0;

    @media (min-width: 768px) {
      font-size: 28px;
    }
  }

  p {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0;

    @media (min-width: 768px) {
      font-size: 16px;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;

  @media (min-width: 768px) {
    font-size: 15px;
  }

  svg {
    width: 18px;
    height: 18px;
    color: var(--color-text-secondary);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--color-text-secondary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(90, 125, 154, 0.1);
  }

  &:disabled {
    background: var(--color-bg-secondary);
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    padding: 14px 18px;
    font-size: 15px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(90, 125, 154, 0.1);
  }

  &:disabled {
    background: var(--color-bg-secondary);
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    padding: 14px 18px;
    font-size: 15px;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 100px;

  &::placeholder {
    color: var(--color-text-secondary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(90, 125, 154, 0.1);
  }

  &:disabled {
    background: var(--color-bg-secondary);
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    padding: 14px 18px;
    font-size: 15px;
  }
`;

const HelperText = styled.p`
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;

  @media (min-width: 768px) {
    font-size: 13px;
  }
`;

const ErrorText = styled.p`
  font-size: 12px;
  color: #ef4444;
  margin: 4px 0 0 0;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const SectionDivider = styled.div`
  border-top: 1px solid var(--color-border-light);
  padding-top: 24px;
  margin-top: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border-light);

  @media (min-width: 480px) {
    flex-direction: row;
    gap: 16px;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 14px 24px;
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  ${(props) =>
    props.variant === 'primary'
      ? `
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
    flex: 1;
    
    &:hover:not(:disabled) {
      background: #3a5d7a;
      border-color: #3a5d7a;
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    &:disabled {
      background: var(--color-text-disabled);
      border-color: var(--color-text-disabled);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `
      : `
    background: var(--color-bg-primary);
    border-color: var(--color-border-light);
    color: var(--color-text-primary);
    
    &:hover {
      background: var(--color-bg-secondary);
      border-color: var(--color-border-medium);
    }
  `}

  @media (min-width: 768px) {
    padding: 16px 28px;
    font-size: 16px;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default function EventSubmissionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { createEvent } = useEventStore();
  const { artists } = useArtistStore();
  const { addNotification } = useUIStore();
  const { user } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EventSubmissionFormData>({
    resolver: zodResolver(eventSubmissionSchema),
  });

  // 監聽開始日期變化，自動設定結束日期最小值
  const startDate = watch('startDate');

  // 處理地點選擇
  const handlePlaceSelect = useCallback(
    (place: { address: string; coordinates: { lat: number; lng: number } }) => {
      setValue('address', place.address, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setLocationCoordinates(place.coordinates);
    },
    [setValue]
  );

  const onSubmit = async (data: EventSubmissionFormData) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: '請先登入',
        message: '您需要登入後才能投稿活動',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 檢查是否能取得 token
      const _token = await user.getIdToken();
      // 找到選中的藝人
      const selectedArtist = artists.find((artist) => artist.stageName === data.artistName);

      // 準備活動資料
      const eventData = {
        title: data.title,
        artistId: selectedArtist?.id || '',
        artistName: data.artistName, // TODO: 拿掉
        description: data.description || '',
        datetime: {
          start: {
            _seconds: Math.floor(new Date(data.startDate).getTime() / 1000),
            _nanoseconds: 0,
          },
          end: {
            _seconds: Math.floor(new Date(data.endDate).getTime() / 1000),
            _nanoseconds: 0,
          },
        },
        location: {
          address: data.address,
          coordinates: locationCoordinates || {
            // 如果沒有座標，使用台北市中心座標
            lat: 25.033,
            lng: 121.5654,
          },
        },
        contactInfo: {
          phone: data.phone || undefined,
          instagram: data.instagram || undefined,
          facebook: data.facebook || undefined,
        },
        images: [], // 暫時不支援圖片上傳
        isDeleted: false,
      };

      await createEvent(eventData);

      addNotification({
        type: 'success',
        title: '投稿成功',
        message: '您的活動已送出審核，審核通過後將會出現在地圖上',
      });
    } catch {
      addNotification({
        type: 'error',
        title: '投稿失敗',
        message: '投稿時發生錯誤，請稍後再試',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormHeader>
        <h2>投稿生咖應援</h2>
        <p>新增生咖應援，審核通過之後其他用戶可以在地圖/列表上看到此活動!</p>
      </FormHeader>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* 活動標題 */}
        <FormGroup>
          <Label htmlFor="title">主題名稱*</Label>
          <Input id="title" type="text" {...register('title')} />
          {errors.title && <ErrorText>{errors.title.message}</ErrorText>}
        </FormGroup>

        {/* 應援藝人 */}
        <FormGroup>
          <Label htmlFor="artistName">
            <UserIcon />
            應援偶像*
          </Label>
          <Select id="artistName" {...register('artistName')}>
            <option value="">請選擇偶像</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.stageName}>
                {artist.stageName}
                {artist.realName && ` (${artist.realName})`}
              </option>
            ))}
          </Select>
          {errors.artistName && <ErrorText>{errors.artistName.message}</ErrorText>}
        </FormGroup>

        {/* 活動描述 */}
        <FormGroup>
          <Label htmlFor="description">活動描述</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="描述活動內容、特色、提供的飲品或周邊等..."
            {...register('description')}
          />
          {errors.description && <ErrorText>{errors.description.message}</ErrorText>}
        </FormGroup>

        {/* 活動時間 */}
        <GridContainer>
          <FormGroup>
            <Label htmlFor="startDate">
              <CalendarIcon />
              開始日期 *
            </Label>
            <Input id="startDate" type="date" {...register('startDate')} />
            {errors.startDate && <ErrorText>{errors.startDate.message}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="endDate">
              <CalendarIcon />
              結束日期 *
            </Label>
            <Input id="endDate" type="date" min={startDate} {...register('endDate')} />
            {errors.endDate && <ErrorText>{errors.endDate.message}</ErrorText>}
          </FormGroup>
        </GridContainer>

        {/* 活動地址 */}
        <FormGroup>
          <Label>
            <MapPinIcon />
            活動地址 *
          </Label>
          <PlaceAutocomplete
            onPlaceSelect={handlePlaceSelect}
            placeholder="搜尋活動地點名稱或地址"
          />
          <input type="hidden" {...register('address')} />
          {errors.address && <ErrorText>{errors.address.message}</ErrorText>}
          <HelperText>請從搜尋結果中選擇地點，以確保地址正確</HelperText>
        </FormGroup>

        {/* 聯絡資訊 */}
        <SectionDivider>
          <SectionTitle>聯絡資訊</SectionTitle>

          <GridContainer>
            <FormGroup>
              <Label htmlFor="phone">
                <PhoneIcon />
                電話號碼
              </Label>
              <Input id="phone" type="tel" placeholder="09xxxxxxxx" {...register('phone')} />
              {errors.phone && <ErrorText>{errors.phone.message}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                type="text"
                placeholder="@username"
                {...register('instagram')}
              />
              {errors.instagram && <ErrorText>{errors.instagram.message}</ErrorText>}
            </FormGroup>
          </GridContainer>

          <FormGroup>
            <Label htmlFor="facebook">Facebook 連結</Label>
            <Input
              id="facebook"
              type="url"
              placeholder="https://facebook.com/..."
              {...register('facebook')}
            />
            {errors.facebook && <ErrorText>{errors.facebook.message}</ErrorText>}
          </FormGroup>
        </SectionDivider>

        {/* 提交按鈕 */}
        <ButtonGroup>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                投稿中...
              </>
            ) : (
              '提交投稿'
            )}
          </Button>

          <Button type="button" variant="secondary" onClick={() => router.push('/')}>
            取消
          </Button>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
}
