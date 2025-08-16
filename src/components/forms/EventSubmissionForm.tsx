'use client';

import { useState, useEffect } from 'react';
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
import DatePicker from '@/components/ui/DatePicker';
import ConfirmModal from '@/components/ui/ConfirmModal';
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

const Form = styled.div`
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
  font-size: 16px;
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--color-text-disabled);
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
  font-size: 16px;
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
    font-size: 16px;
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

// 步驟指示器樣式
const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  gap: 16px;
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s ease;

    ${(props) => {
      if (props.completed) {
        return `
          background: var(--color-primary);
          color: white;
        `;
      } else if (props.active) {
        return `
          background: var(--color-primary);
          color: white;
        `;
      } else {
        return `
          background: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border-light);
        `;
      }
    }}
  }

  .step-title {
    font-size: 14px;
    font-weight: 500;
    color: ${(props) =>
      props.active || props.completed
        ? 'var(--color-text-primary)'
        : 'var(--color-text-secondary)'};
  }
`;

const StepConnector = styled.div<{ completed: boolean }>`
  width: 40px;
  height: 2px;
  background: ${(props) =>
    props.completed ? 'var(--color-primary)' : 'var(--color-border-light)'};
  transition: all 0.2s ease;
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
  // 步驟狀態：編輯模式直接跳到第二步，創建模式從第一步開始
  const [currentStep, setCurrentStep] = useState(mode === 'edit' ? 2 : 1);
  const [locationCoordinates, setLocationCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(existingEvent?.location.coordinates || null);
  const [locationAddress, setLocationAddress] = useState(existingEvent?.location.address || '');
  const [artistSelectionModalOpen, setArtistSelectionModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<EventSubmissionFormData | null>(null);
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
    formState: { errors, isDirty },
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
  const handlePlaceSelect = (place: {
    address: string;
    coordinates: { lat: number; lng: number };
    name: string;
  }) => {
    setValue('addressName', place.name, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setLocationCoordinates(place.coordinates);
    setLocationAddress(place.address);
  };

  // 處理藝人選擇
  const handleArtistSelect = (artist: Artist) => {
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
  };

  // 移除藝人
  const removeArtist = (artistId: string) => {
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
  };

  // 打開藝人選擇 modal
  const openArtistSelectionModal = () => {
    setArtistSelectionModalOpen(true);
  };

  // 步驟導航處理
  const handleNextStep = () => {
    if (currentStep === 1) {
      // 檢查是否已選擇藝人
      if (selectedArtists.length === 0) {
        showToast.warning('請至少選擇一個偶像');
        return;
      }
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
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
    onError: (error: any) => {
      // 從後端錯誤回應中提取錯誤訊息
      const errorMessage = error?.response?.data?.error || '投稿失敗';
      showToast.error(errorMessage);
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) =>
      eventsApi.update(id, data),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('更新成功');
      onSuccess?.(updatedEvent);
    },
    onError: (error: any) => {
      // 從後端錯誤回應中提取錯誤訊息
      const errorMessage = error?.response?.data?.error || '更新失敗';
      showToast.error(errorMessage);
    },
  });

  const resubmitEventMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.resubmit(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('已重新提交審核！');
      router.push(`/my-submissions`);
    },
    onError: (error: any) => {
      // 從後端錯誤回應中提取錯誤訊息
      const errorMessage = error?.response?.data?.error || '重新提交審核時發生錯誤';
      showToast.error(errorMessage);
    },
  });

  // 檢測是否有任何改動的函數
  const checkForChanges = () => {
    if (mode !== 'edit' || !existingEvent) {
      return true; // 非編輯模式一律允許提交
    }

    // 檢測表單欄位改動
    const formHasChanges = isDirty;

    // 檢測主圖改動
    const mainImageChanged = mainImageUrl !== (existingEvent.mainImage || '');

    // 檢測詳細圖片改動
    const originalDetailImages = existingEvent.detailImage
      ? Array.isArray(existingEvent.detailImage)
        ? existingEvent.detailImage
        : [existingEvent.detailImage]
      : [];
    const detailImagesChanged =
      detailImageUrls.length !== originalDetailImages.length ||
      detailImageUrls.some((url, index) => url !== originalDetailImages[index]);

    // 檢測藝人選擇改動
    const originalArtistIds = existingEvent.artists?.map((artist) => artist.id) || [];
    const selectedArtistIds = selectedArtists.map((artist) => artist.id);
    const artistsChanged =
      originalArtistIds.length !== selectedArtistIds.length ||
      originalArtistIds.some((id) => !selectedArtistIds.includes(id));

    // 檢測地點改動
    const locationChanged =
      locationAddress !== (existingEvent.location.address || '') ||
      locationCoordinates?.lat !== existingEvent.location.coordinates?.lat ||
      locationCoordinates?.lng !== existingEvent.location.coordinates?.lng;

    return (
      formHasChanges || mainImageChanged || detailImagesChanged || artistsChanged || locationChanged
    );
  };

  const onSubmit = async (data: EventSubmissionFormData) => {
    if (!user) {
      showToast.warning('請先登入');
      return;
    }

    // 檢查是否有變更
    if (!checkForChanges()) {
      showToast.success('更新成功');
      return;
    }

    // 如果是編輯模式且狀態是 rejected，顯示確認彈窗
    if (mode === 'edit' && existingEvent?.status === 'rejected') {
      setPendingSubmitData(data);
      setConfirmModalOpen(true);
      return;
    }

    await submitEventData(data);
  };

  const submitEventData = async (data: EventSubmissionFormData) => {
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
            // 如果原本狀態是 rejected，自動調用重新審核 API
            if (existingEvent.status === 'rejected') {
              resubmitEventMutation.mutate(existingEvent.id);
            } else {
              router.push(`/my-submissions`);
            }
          },
        }
      );
    }
  };

  const handleConfirmSubmit = () => {
    if (pendingSubmitData) {
      submitEventData(pendingSubmitData);
      setConfirmModalOpen(false);
      setPendingSubmitData(null);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmModalOpen(false);
    setPendingSubmitData(null);
  };

  return (
    <FormContainer>
      <FormHeader>
        <h2>{mode === 'edit' ? '編輯生咖應援' : '投稿生咖應援'}</h2>
        {mode !== 'edit' && <p>審核通過之後其他用戶可以在地圖/列表上看到此生咖!</p>}
        {mode === 'edit' && (
          <p style={{ fontSize: '14px', color: '#ef4444', margin: '8px 0 0 0' }}>
            無法修改生咖的藝人資訊
          </p>
        )}
      </FormHeader>

      {/* 步驟指示器 - 只在創建模式顯示 */}
      {mode === 'create' && (
        <StepIndicator>
          <Step active={currentStep === 1} completed={currentStep > 1}>
            <div className="step-number">1</div>
            <div className="step-title">選擇偶像</div>
          </Step>
          <StepConnector completed={currentStep > 1} />
          <Step active={currentStep === 2} completed={false}>
            <div className="step-number">2</div>
            <div className="step-title">生咖資訊</div>
          </Step>
        </StepIndicator>
      )}

      <Form>
        {/* 第一步：選擇藝人 */}
        {(currentStep === 1 || mode === 'edit') && (
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
        )}

        {/* 第二步：其他活動資訊 */}
        {(currentStep === 2 || mode === 'edit') && (
          <>
            {/* 活動標題 */}
            <FormGroup>
              <Label htmlFor="title">主題名稱*</Label>
              <Input id="title" type="text" {...register('title')} />
              {errors.title && <ErrorText>{errors.title.message}</ErrorText>}
            </FormGroup>

            {/* 主視覺圖片 */}
            <FormGroup>
              <Label>
                <PhotoIcon />
                主視覺圖片*
              </Label>
              <HelperText>主要宣傳圖片</HelperText>
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
                <DatePicker
                  value={watch('startDate') || ''}
                  onChange={(date) => {
                    setValue('startDate', date, { shouldValidate: true, shouldDirty: true });
                    // 如果結束日期早於新的開始日期，清空結束日期
                    const endDate = watch('endDate');
                    if (endDate && new Date(endDate) < new Date(date)) {
                      setValue('endDate', '', { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                  placeholder="選擇開始日期"
                  disabled={createEventMutation.isPending || updateEventMutation.isPending}
                  error={!!errors.startDate}
                  min={new Date().toISOString().split('T')[0]}
                />
                <input type="hidden" {...register('startDate')} />
                {errors.startDate && <ErrorText>{errors.startDate.message}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="endDate">
                  <CalendarIcon />
                  結束日期*
                </Label>
                <DatePicker
                  value={watch('endDate') || ''}
                  onChange={(date) =>
                    setValue('endDate', date, { shouldValidate: true, shouldDirty: true })
                  }
                  min={watch('startDate')}
                  placeholder="選擇結束日期"
                  disabled={
                    createEventMutation.isPending ||
                    updateEventMutation.isPending ||
                    !watch('startDate')
                  }
                  error={!!errors.endDate}
                />
                {!watch('startDate') && (
                  <HelperText style={{ color: '#f59e0b' }}>請先選擇開始日期</HelperText>
                )}
                <input type="hidden" {...register('endDate')} />
                {errors.endDate && <ErrorText>{errors.endDate.message}</ErrorText>}
              </FormGroup>
            </GridContainer>

            {/* 活動地址 */}
            <FormGroup>
              <Label>
                <MapPinIcon />
                地點*
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
                placeholder="描述生咖內容與資訊，例如：時間/領取應援/注意事項等等"
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
                生咖的詳細說明圖片，可包含活動流程、注意事項等詳細資訊，最多可上傳5張
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
                {errors.instagram && errors.instagram.type === 'custom' && (
                  <ErrorText style={{ marginTop: '8px' }}>{errors.instagram.message}</ErrorText>
                )}
                <FormGroup>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    type="text"
                    placeholder="填寫 id 例如: boynextdoor_official"
                    {...register('instagram')}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="x">X</Label>
                  <Input
                    id="x"
                    type="text"
                    placeholder="填寫 id 例如: BOYNEXTDOOR_KOZ"
                    {...register('x')}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="threads">Threads</Label>
                  <Input
                    id="threads"
                    type="text"
                    placeholder="填寫 id 例如: _muri.ri"
                    {...register('threads')}
                  />
                </FormGroup>
              </GridContainer>
            </SectionDivider>
          </>
        )}

        {/* 步驟導航按鈕 */}
        <ButtonGroup>
          {mode === 'create' && currentStep === 1 ? (
            // 第一步：下一步按鈕
            <>
              <Button type="button" variant="primary" onClick={handleNextStep}>
                下一步
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel || (() => router.push('/'))}
              >
                取消
              </Button>
            </>
          ) : mode === 'create' && currentStep === 2 ? (
            // 第二步：上一步 + 提交按鈕
            <>
              <Button type="button" variant="secondary" onClick={handlePrevStep}>
                上一步
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={createEventMutation.isPending}
                onClick={handleSubmit(onSubmit)}
              >
                {createEventMutation.isPending ? (
                  <>
                    <LoadingSpinner />
                    投稿中...
                  </>
                ) : (
                  '提交投稿'
                )}
              </Button>
            </>
          ) : (
            // 編輯模式：原有的按鈕
            <>
              <Button
                type="button"
                variant="primary"
                disabled={updateEventMutation.isPending || resubmitEventMutation.isPending}
                onClick={handleSubmit(onSubmit)}
              >
                {updateEventMutation.isPending ? (
                  <>
                    <LoadingSpinner />
                    更新中...
                  </>
                ) : resubmitEventMutation.isPending ? (
                  <>
                    <LoadingSpinner />
                    重新提交審核中...
                  </>
                ) : existingEvent?.status === 'rejected' ? (
                  '重新送審'
                ) : (
                  '更新'
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel || (() => router.push('/'))}
              >
                取消
              </Button>
            </>
          )}
        </ButtonGroup>
      </Form>

      {/* 藝人選擇 Modal - 只在創建模式顯示 */}
      {mode === 'create' && (
        <ArtistSelectionModal
          isOpen={artistSelectionModalOpen}
          onClose={() => setArtistSelectionModalOpen(false)}
          onArtistSelect={handleArtistSelect}
          selectedArtistIds={selectedArtists.map((artist) => artist.id)}
        />
      )}

      {/* 確認彈窗 - 只在編輯模式且狀態為 rejected 時顯示 */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="確認重新送審"
        message="是否確認所有資訊都正確？送出之後將會重新送審。"
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelConfirm}
        confirmText="確認送出"
        cancelText="取消"
        isLoading={updateEventMutation.isPending || resubmitEventMutation.isPending}
      />
    </FormContainer>
  );
}
