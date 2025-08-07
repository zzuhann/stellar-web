'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  ChevronDownIcon,
  XMarkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import styled from 'styled-components';
import { eventSubmissionSchema, EventSubmissionFormData } from '@/lib/validations';
import { useAuth } from '@/lib/auth-context';
import { useAuthToken } from '@/hooks/useAuthToken';
import PlaceAutocomplete from './PlaceAutocomplete';
import ArtistSelectionModal from './ArtistSelectionModal';
import ImageUpload from '@/components/ui/ImageUpload';
import MultiImageUpload from '@/components/ui/MultiImageUpload';
import { useRouter } from 'next/navigation';
import { CreateEventRequest, UpdateEventRequest, Artist, CoffeeEvent } from '@/types';
import showToast from '@/lib/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { firebaseTimestampToDate } from '@/utils';

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
  margin-bottom: 8px;
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
  flex: 1;

  ${(props) =>
    props.variant === 'primary'
      ? `
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
    
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

const ArtistSelectionButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    border-color: var(--color-border-medium);
    background: var(--color-bg-secondary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(90, 125, 154, 0.1);
  }

  @media (min-width: 768px) {
    padding: 14px 18px;
    font-size: 15px;
  }
`;

const SelectedArtistInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: space-between;
`;

const ArtistName = styled.span`
  font-weight: 500;
`;

const ArtistRealName = styled.span`
  color: var(--color-text-secondary);
  font-size: 13px;
`;

const PlaceholderText = styled.span`
  color: var(--color-text-secondary);
`;

const IconContainer = styled.div`
  width: 16px;
  height: 16px;
`;

const ImageContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

interface EventSubmissionFormProps {
  mode?: 'create' | 'edit';
  existingEvent?: CoffeeEvent;
  onSuccess?: (event: CoffeeEvent) => void;
  onCancel?: () => void;
}

export default function EventSubmissionForm({
  mode = 'create',
  existingEvent,
  onSuccess,
  onCancel,
}: EventSubmissionFormProps) {
  const [locationCoordinates, setLocationCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(existingEvent?.location.coordinates || null);
  const [locationAddress, setLocationAddress] = useState(existingEvent?.location.address || '');
  const [artistSelectionModalOpen, setArtistSelectionModalOpen] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>(() => {
    if (existingEvent?.artists) {
      // 將 CoffeeEvent.artists 轉換為 Artist 格式（用於顯示）
      return existingEvent.artists.map((artist) => ({
        id: artist.id,
        stageName: artist.name,
        realName: undefined,
        profileImage: artist.profileImage,
        status: 'approved' as const,
        createdBy: '',
        createdAt: {
          _seconds: 0,
          _nanoseconds: 0,
        },
        updatedAt: {
          _seconds: 0,
          _nanoseconds: 0,
        },
      }));
    }
    return [];
  });
  const [mainImageUrl, setMainImageUrl] = useState<string>(existingEvent?.mainImage || '');
  const [detailImageUrls, setDetailImageUrls] = useState<string[]>(() => {
    if (existingEvent?.detailImage) {
      return Array.isArray(existingEvent.detailImage)
        ? existingEvent.detailImage
        : [existingEvent.detailImage];
    }
    return [];
  });
  const { user } = useAuth();
  const { token } = useAuthToken();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EventSubmissionFormData>({
    resolver: zodResolver(eventSubmissionSchema),
    defaultValues: existingEvent
      ? {
          title: existingEvent.title,
          description: existingEvent.description,
          addressName: existingEvent.location.name,
          startDate: firebaseTimestampToDate(existingEvent.datetime.start)
            .toISOString()
            .split('T')[0],
          endDate: firebaseTimestampToDate(existingEvent.datetime.end).toISOString().split('T')[0],
          instagram: existingEvent.socialMedia.instagram || '',
          x: existingEvent.socialMedia.x || '',
          threads: existingEvent.socialMedia.threads || '',
          mainImage: existingEvent.mainImage || '',
          detailImage: Array.isArray(existingEvent.detailImage)
            ? existingEvent.detailImage
            : existingEvent.detailImage
              ? [existingEvent.detailImage]
              : [],
          artistIds: existingEvent.artists.map((artist) => artist.id),
        }
      : undefined,
  });

  // 監聽開始日期變化，自動設定結束日期最小值
  const startDate = watch('startDate');

  // 同步 selectedArtists 和 detailImageUrls 到表單
  useEffect(() => {
    setValue(
      'artistIds',
      selectedArtists.map((artist) => artist.id)
    );
  }, [selectedArtists, setValue]);

  useEffect(() => {
    setValue('detailImage', detailImageUrls);
  }, [detailImageUrls, setValue]);

  // 初始化時同步值
  useEffect(() => {
    setValue(
      'artistIds',
      selectedArtists.map((artist) => artist.id)
    );
    setValue('detailImage', detailImageUrls);
    if (mainImageUrl) {
      setValue('mainImage', mainImageUrl);
    }
  }, []);

  // 處理地點選擇
  const handlePlaceSelect = useCallback(
    (place: { address: string; coordinates: { lat: number; lng: number }; name: string }) => {
      setValue('addressName', place.name, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setLocationCoordinates(place.coordinates);
      setLocationAddress(place.address);
    },
    [setValue]
  );

  // 處理藝人選擇
  const handleArtistSelect = useCallback(
    (artist: Artist) => {
      // 檢查是否已經選擇過這個藝人
      const isAlreadySelected = selectedArtists.some((selected) => selected.id === artist.id);
      if (!isAlreadySelected) {
        const newSelectedArtists = [...selectedArtists, artist];
        setSelectedArtists(newSelectedArtists);
        // 更新表單值，使用藝人ID陣列
        const artistIds = newSelectedArtists.map((a) => a.id);
        setValue('artistIds', artistIds, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [selectedArtists, setValue]
  );

  // 移除藝人
  const removeArtist = useCallback(
    (artistId: string) => {
      const newSelectedArtists = selectedArtists.filter((artist) => artist.id !== artistId);
      setSelectedArtists(newSelectedArtists);

      if (newSelectedArtists.length > 0) {
        const artistIds = newSelectedArtists.map((a) => a.id);
        setValue('artistIds', artistIds, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        setValue('artistIds', [], {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [selectedArtists, setValue]
  );

  // 打開藝人選擇 modal
  const openArtistSelectionModal = () => {
    setArtistSelectionModalOpen(true);
  };

  const createEventMutation = useMutation({
    mutationFn: (eventData: CreateEventRequest) => eventsApi.create(eventData),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('投稿成功');
      onSuccess?.(newEvent);
      if (!onSuccess) {
        router.push('/my-submissions');
      }
    },
    onError: () => {
      showToast.error('投稿失敗');
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) =>
      eventsApi.update(id, data),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('活動更新成功');
      onSuccess?.(updatedEvent);
    },
    onError: () => {
      showToast.error('活動更新失敗');
    },
  });

  const onSubmit = async (data: EventSubmissionFormData) => {
    if (!user) {
      showToast.warning('請先登入');
      return;
    }

    if (mode === 'create') {
      // 準備新增活動資料
      const eventData: CreateEventRequest = {
        title: data.title,
        artistIds: selectedArtists.map((artist) => artist.id),
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
          name: data.addressName,
          address: locationAddress,
          coordinates: locationCoordinates || {
            // 如果沒有座標，使用台北市中心座標
            lat: 25.033,
            lng: 121.5654,
          },
        },
        socialMedia: {
          instagram: data.instagram || undefined,
          x: data.x || undefined,
          threads: data.threads || undefined,
        },
        mainImage: mainImageUrl || undefined,
        detailImage: detailImageUrls,
      };

      createEventMutation.mutate(eventData, {
        onSuccess: () => {
          router.push(`/my-submissions`);
        },
      });
    } else if (mode === 'edit' && existingEvent) {
      // 準備編輯活動資料
      const updateData: UpdateEventRequest = {
        title: data.title,
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
          name: data.addressName,
          address: locationAddress,
          coordinates: locationCoordinates || existingEvent.location.coordinates,
        },
        socialMedia: {
          instagram: data.instagram || undefined,
          x: data.x || undefined,
          threads: data.threads || undefined,
        },
        mainImage: mainImageUrl || undefined,
        detailImage: detailImageUrls,
      };

      updateEventMutation.mutate(
        { id: existingEvent.id, data: updateData },
        {
          onSuccess: () => {
            router.push(`/my-submissions`);
          },
        }
      );
    }
  };

  return (
    <FormContainer>
      <FormHeader>
        <h2>{mode === 'edit' ? '編輯生咖應援' : '投稿生咖應援'}</h2>
        <p>
          {mode === 'edit'
            ? '編輯活動資訊，更新後需要重新審核'
            : '新增生咖應援，審核通過之後其他用戶可以在地圖/列表上看到此活動!'}
        </p>
        {mode === 'edit' && (
          <p style={{ fontSize: '12px', color: '#888', margin: '8px 0 0 0' }}>
            注意：無法修改活動的藝人資訊
          </p>
        )}
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
          <HelperText>
            {mode === 'edit' ? '編輯模式下無法修改偶像資訊' : '若為聯合應援，可選擇多個偶像'}
          </HelperText>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* 已選擇的藝人按鈕 */}
            {selectedArtists.map((artist) => (
              <ArtistSelectionButton
                key={artist.id}
                type="button"
                onClick={mode === 'edit' ? undefined : openArtistSelectionModal}
                className={errors.artistIds ? 'error' : ''}
                style={{
                  opacity: mode === 'edit' ? 0.7 : 1,
                  cursor: mode === 'edit' ? 'not-allowed' : 'pointer',
                  background:
                    mode === 'edit' ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                }}
              >
                <SelectedArtistInfo>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageContainer>
                      <img src={artist.profileImage} alt={artist.stageName} />
                    </ImageContainer>
                    <div>
                      <ArtistName>{artist.stageName}</ArtistName>
                      {artist.realName && <ArtistRealName>({artist.realName})</ArtistRealName>}
                    </div>
                  </div>
                  {mode === 'create' && (
                    <IconContainer>
                      <XMarkIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          removeArtist(artist.id);
                        }}
                      />
                    </IconContainer>
                  )}
                </SelectedArtistInfo>
              </ArtistSelectionButton>
            ))}

            {/* 新增藝人的按鈕 - 只在創建模式顯示 */}
            {mode === 'create' && (
              <ArtistSelectionButton
                type="button"
                onClick={openArtistSelectionModal}
                className={errors.artistIds ? 'error' : ''}
              >
                <PlaceholderText>請選擇偶像</PlaceholderText>
                <IconContainer>
                  <ChevronDownIcon />
                </IconContainer>
              </ArtistSelectionButton>
            )}
          </div>
          <input type="hidden" {...register('artistIds')} />
          {errors.artistIds && <ErrorText>{errors.artistIds.message}</ErrorText>}
        </FormGroup>

        {/* 主視覺圖片 */}
        <FormGroup>
          <Label>
            <PhotoIcon />
            主視覺圖片*
          </Label>
          <HelperText>活動的主要宣傳圖片</HelperText>
          <ImageUpload
            currentImageUrl={mainImageUrl}
            onUploadComplete={(imageUrl) => {
              setMainImageUrl(imageUrl);
              setValue('mainImage', imageUrl, {
                shouldValidate: true,
                shouldDirty: true,
              });
              showToast.success('主視覺圖片上傳成功');
            }}
            onImageRemove={() => {
              setMainImageUrl('');
              setValue('mainImage', '', {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            placeholder="點擊上傳主視覺圖片或拖拽至此"
            maxSizeMB={5}
            disabled={createEventMutation.isPending || updateEventMutation.isPending}
            authToken={token || undefined}
            useRealAPI={!!token}
            enableCrop={false}
          />
          <input type="hidden" {...register('mainImage')} />
          {errors.mainImage && <ErrorText>{errors.mainImage.message}</ErrorText>}
        </FormGroup>

        {/* 活動時間 */}
        <GridContainer>
          <FormGroup>
            <Label htmlFor="startDate">
              <CalendarIcon />
              開始日期*
            </Label>
            <Input id="startDate" type="date" {...register('startDate')} />
            {errors.startDate && <ErrorText>{errors.startDate.message}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="endDate">
              <CalendarIcon />
              結束日期*
            </Label>
            <Input id="endDate" type="date" min={startDate} {...register('endDate')} />
            {errors.endDate && <ErrorText>{errors.endDate.message}</ErrorText>}
          </FormGroup>
        </GridContainer>

        {/* 活動地址 */}
        <FormGroup>
          <Label>
            <MapPinIcon />
            活動地點*
          </Label>
          <HelperText>搜尋店家名稱或地址</HelperText>
          <PlaceAutocomplete
            onPlaceSelect={handlePlaceSelect}
            defaultValue={existingEvent?.location.address}
          />
          <input type="hidden" {...register('addressName')} />
          {errors.addressName && <ErrorText>{errors.addressName.message}</ErrorText>}
        </FormGroup>

        {/* 活動描述 */}
        <FormGroup>
          <Label htmlFor="description">說明</Label>
          <Textarea
            id="description"
            rows={10}
            placeholder="描述活動內容與資訊，例如：活動時間/領取應援/注意事項等等"
            {...register('description')}
          />
          {errors.description && <ErrorText>{errors.description.message}</ErrorText>}
        </FormGroup>

        {/* 詳細說明圖片 */}
        <FormGroup>
          <Label>
            <PhotoIcon />
            詳細說明圖片
          </Label>
          <HelperText>
            活動的詳細說明圖片，可包含活動流程、注意事項等詳細資訊，最多可上傳5張
          </HelperText>
          <MultiImageUpload
            currentImages={detailImageUrls}
            onImagesChange={(imageUrls) => {
              setDetailImageUrls(imageUrls);
              setValue('detailImage', imageUrls, {
                shouldValidate: false,
                shouldDirty: false,
              });
            }}
            maxImages={5}
            placeholder="點擊添加圖片"
            maxSizeMB={5}
            disabled={createEventMutation.isPending || updateEventMutation.isPending}
            authToken={token || undefined}
            useRealAPI={!!token}
          />
          <input type="hidden" {...register('detailImage')} />
          {errors.detailImage && <ErrorText>{errors.detailImage.message}</ErrorText>}
        </FormGroup>

        {/* 聯絡資訊 */}
        <SectionDivider>
          <SectionTitle>社群媒體</SectionTitle>
          <HelperText>
            請提供主要公布資訊的社群平台，請至少填寫一項，若無則會審核失敗（若聯合主辦，請寫主要公布資訊的帳號）
          </HelperText>

          <GridContainer style={{ marginTop: '8px' }}>
            <FormGroup>
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" type="text" {...register('instagram')} />
              {errors.instagram && <ErrorText>{errors.instagram.message}</ErrorText>}
            </FormGroup>
            <FormGroup>
              <Label htmlFor="x">X</Label>
              <Input id="x" type="text" {...register('x')} />
              {errors.x && <ErrorText>{errors.x.message}</ErrorText>}
            </FormGroup>
            <FormGroup>
              <Label htmlFor="threads">Threads</Label>
              <Input id="threads" type="text" {...register('threads')} />
              {errors.threads && <ErrorText>{errors.threads.message}</ErrorText>}
            </FormGroup>
          </GridContainer>
        </SectionDivider>

        {/* 提交按鈕 */}
        <ButtonGroup>
          <Button
            type="submit"
            variant="primary"
            disabled={createEventMutation.isPending || updateEventMutation.isPending}
          >
            {createEventMutation.isPending || updateEventMutation.isPending ? (
              <>
                <LoadingSpinner />
                {mode === 'edit' ? '更新中...' : '投稿中...'}
              </>
            ) : mode === 'edit' ? (
              '更新活動'
            ) : (
              '提交投稿'
            )}
          </Button>

          <Button type="button" variant="secondary" onClick={onCancel || (() => router.push('/'))}>
            取消
          </Button>
        </ButtonGroup>
      </Form>

      {/* 藝人選擇 Modal - 只在創建模式顯示 */}
      {mode === 'create' && (
        <ArtistSelectionModal
          isOpen={artistSelectionModalOpen}
          onClose={() => setArtistSelectionModalOpen(false)}
          onArtistSelect={handleArtistSelect}
        />
      )}
    </FormContainer>
  );
}
