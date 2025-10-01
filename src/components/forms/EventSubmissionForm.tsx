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
import { css, cva } from '@/styled-system/css';
import { eventSubmissionSchema, EventSubmissionFormData } from '@/lib/validations';
import { useAuth } from '@/lib/auth-context';
import { useAuthToken } from '@/hooks/useAuthToken';
import PlaceAutocomplete from './PlaceAutocomplete';
import ArtistSelectionModal from './ArtistSelectionModal';
import ImageUpload from '@/components/images/ImageUpload';
import MultiImageUpload from '@/components/images/MultiImageUpload';
import DatePicker from '@/components/DatePicker';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useRouter } from 'next/navigation';
import { CreateEventRequest, UpdateEventRequest, Artist, CoffeeEvent } from '@/types';
import showToast from '@/lib/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { firebaseTimestampToDate } from '@/utils';
import emailjs from '@emailjs/browser';

const formContainer = css({
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.md',
  padding: '32px',
  '@media (min-width: 768px)': {
    padding: '40px',
  },
});

const formHeader = css({
  textAlign: 'center',
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  '& h2': {
    fontSize: '24px',
    fontWeight: '700',
    color: 'color.text.primary',
    margin: '0 0 8px 0',
    '@media (min-width: 768px)': {
      fontSize: '28px',
    },
  },
  '& p': {
    fontSize: '14px',
    color: 'color.text.secondary',
    margin: '0',
    '@media (min-width: 768px)': {
      fontSize: '16px',
    },
  },
});

const form = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const formGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const label = css({
  fontSize: '14px',
  fontWeight: '500',
  color: 'color.text.primary',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '@media (min-width: 768px)': {
    fontSize: '15px',
  },
  '& svg': {
    width: '18px',
    height: '18px',
    color: 'color.text.secondary',
  },
});

const input = css({
  width: '100%',
  padding: '12px 16px',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  fontSize: '16px',
  transition: 'all 0.2s ease',
  '&::placeholder': {
    color: 'color.text.disabled',
  },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px rgba(90, 125, 154, 0.1)',
  },
  '&:disabled': {
    background: 'color.background.secondary',
    color: 'color.text.disabled',
    cursor: 'not-allowed',
  },
  '@media (min-width: 768px)': {
    padding: '14px 18px',
    fontSize: '15px',
  },
});

const textarea = css({
  width: '100%',
  padding: '12px 16px',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  fontSize: '16px',
  transition: 'all 0.2s ease',
  resize: 'vertical',
  minHeight: '100px',
  '&::placeholder': {
    color: 'color.text.secondary',
  },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px rgba(90, 125, 154, 0.1)',
  },
  '&:disabled': {
    background: 'color.background.secondary',
    color: 'color.text.disabled',
    cursor: 'not-allowed',
  },
  '@media (min-width: 768px)': {
    padding: '14px 18px',
    fontSize: '16px',
  },
});

const helperText = css({
  fontSize: '12px',
  color: 'color.text.secondary',
  margin: '0',
  '@media (min-width: 768px)': {
    fontSize: '13px',
  },
});

const errorText = css({
  fontSize: '12px',
  color: '#ef4444',
  margin: '4px 0 0 0',
});

const characterCount = cva({
  base: {
    fontSize: '12px',
    textAlign: 'right',
    marginTop: '4px',
  },
  variants: {
    isOverLimit: {
      true: {
        color: '#ef4444',
      },
      false: {
        color: 'color.text.secondary',
      },
    },
  },
});

const gridContainer = css({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '16px',
});

const sectionDivider = css({
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  paddingTop: '24px',
  marginTop: '24px',
});

const sectionTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  marginBottom: '8px',
});

const buttonGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  paddingTop: '24px',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  '@media (min-width: 480px)': {
    flexDirection: 'row',
    gap: '16px',
  },
});

const button = cva({
  base: {
    padding: '14px 24px',
    borderRadius: 'radius.lg',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flex: '1',
    '@media (min-width: 768px)': {
      padding: '16px 28px',
      fontSize: '16px',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  },
  variants: {
    variant: {
      primary: {
        background: 'color.primary',
        borderColor: 'color.primary',
        color: 'white',
        '&:disabled': {
          background: 'color.text.disabled',
          borderColor: 'color.text.disabled',
        },
      },
      secondary: {
        background: 'color.background.primary',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
      },
    },
  },
});

const loadingSpinner = css({
  width: '16px',
  height: '16px',
  border: '2px solid transparent',
  borderTop: '2px solid white',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
});

const artistSelectionButton = css({
  width: '100%',
  padding: '12px 16px',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  '&:hover': {
    borderColor: 'color.border.medium',
    background: 'color.background.secondary',
  },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px rgba(90, 125, 154, 0.1)',
  },
  '@media (min-width: 768px)': {
    padding: '14px 18px',
    fontSize: '15px',
  },
});

const selectedArtistInfo = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: '1',
  justifyContent: 'space-between',
});

const artistName = css({
  fontWeight: '500',
});

const placeholderText = css({
  color: 'color.text.secondary',
});

const iconContainer = css({
  width: '16px',
  height: '16px',
});

const imageContainer = css({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  overflow: 'hidden',
  marginRight: '8px',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const stepIndicator = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '32px',
  gap: '16px',
});

const step = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    '& .step-number': {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
    },
    '& .step-title': {
      fontSize: '14px',
      fontWeight: '500',
    },
  },
  variants: {
    active: {
      true: {
        '& .step-title': {
          color: 'color.text.primary',
        },
      },
      false: {
        '& .step-title': {
          color: 'color.text.secondary',
        },
      },
    },
    completed: {
      true: {
        '& .step-title': {
          color: 'color.text.primary',
        },
      },
    },
  },
  compoundVariants: [
    {
      active: true,
      completed: false,
      css: {
        '& .step-number': {
          background: 'color.primary',
          color: 'white',
        },
      },
    },
    {
      active: false,
      completed: false,
      css: {
        '& .step-number': {
          background: 'color.background.secondary',
          color: 'color.text.secondary',
          border: '1px solid',
          borderColor: 'color.border.light',
        },
      },
    },
    {
      completed: true,
      css: {
        '& .step-number': {
          background: 'color.primary',
          color: 'white',
        },
      },
    },
  ],
});

const stepConnector = cva({
  base: {
    width: '40px',
    height: '2px',
    transition: 'all 0.2s ease',
  },
  variants: {
    completed: {
      true: {
        background: 'color.primary',
      },
      false: {
        background: 'color.border.light',
      },
    },
  },
});

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

      // 發送 EmailJS 通知
      emailjs
        .send(
          'service_ufrmaop',
          'template_d1lxldp',
          {},
          {
            publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
          }
        )
        .catch(() => {});

      onSuccess?.(newEvent);
      if (!onSuccess) {
        router.push('/my-submissions?tab=event');
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
      showToast.success('已重新送出審核！');

      // 發送 EmailJS 通知
      emailjs
        .send(
          'service_ufrmaop',
          'template_d1lxldp',
          {},
          {
            publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
          }
        )
        .catch(() => {});

      router.push(`/my-submissions?tab=event`);
    },
    onError: (error: any) => {
      // 從後端錯誤回應中提取錯誤訊息
      const errorMessage = error?.response?.data?.error || '重新送出審核時發生錯誤';
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
            // 00:00:00
            _seconds: Math.floor(new Date(data.startDate + 'T00:00:00').getTime() / 1000),
            _nanoseconds: 0,
          },
          end: {
            // 23:59:59
            _seconds: Math.floor(new Date(data.endDate + 'T23:59:59').getTime() / 1000),
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
          router.push(`/my-submissions?tab=event`);
        },
      });
    } else if (mode === 'edit' && existingEvent) {
      // 準備編輯活動資料
      const updateData: UpdateEventRequest = {
        title: data.title,
        description: data.description || '',
        datetime: {
          start: {
            // 00:00:00
            _seconds: Math.floor(new Date(data.startDate + 'T00:00:00').getTime() / 1000),
            _nanoseconds: 0,
          },
          end: {
            // 23:59:59
            _seconds: Math.floor(new Date(data.endDate + 'T23:59:59').getTime() / 1000),
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
              router.push(`/my-submissions?tab=event`);
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
    <div className={formContainer}>
      <div className={formHeader}>
        <h2>{mode === 'edit' ? '編輯' : '投稿'}</h2>
        {mode !== 'edit' && <p>審核通過之後其他用戶可以在地圖/列表上看到此生日應援!</p>}
        {mode === 'edit' && (
          <p style={{ fontSize: '14px', color: '#ef4444', margin: '8px 0 0 0' }}>
            無法修改藝人資訊
          </p>
        )}
      </div>

      {/* 步驟指示器 - 只在創建模式顯示 */}
      {mode === 'create' && (
        <div className={stepIndicator}>
          <div className={step({ active: currentStep === 1, completed: currentStep > 1 })}>
            <div className="step-number">1</div>
            <div className="step-title">選擇偶像</div>
          </div>
          <div className={stepConnector({ completed: currentStep > 1 })} />
          <div className={step({ active: currentStep === 2, completed: false })}>
            <div className="step-number">2</div>
            <div className="step-title">應援資訊</div>
          </div>
        </div>
      )}

      <form className={form}>
        {/* 第一步：選擇藝人 */}
        {(currentStep === 1 || mode === 'edit') && (
          <div className={formGroup}>
            <label className={label} htmlFor="artistName">
              <UserIcon />
              應援偶像*
            </label>
            <p className={helperText}>
              {mode === 'edit' ? '編輯模式下無法修改偶像資訊' : '若為聯合應援，可選擇多個偶像'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* 已選擇的藝人按鈕 */}
              {selectedArtists.map((artist) => (
                <button
                  className={artistSelectionButton}
                  key={artist.id}
                  type="button"
                  onClick={mode === 'edit' ? undefined : openArtistSelectionModal}
                  style={{
                    opacity: mode === 'edit' ? 0.7 : 1,
                    cursor: mode === 'edit' ? 'not-allowed' : 'pointer',
                    background:
                      mode === 'edit' ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                  }}
                >
                  <div className={selectedArtistInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={imageContainer}>
                        <img src={artist.profileImage} alt={artist.stageName} />
                      </div>
                      <div>
                        <span className={artistName}>
                          {artist.stageName.toUpperCase()} {artist.realName}
                        </span>
                      </div>
                    </div>
                    {mode === 'create' && (
                      <div className={iconContainer}>
                        <XMarkIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            removeArtist(artist.id);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* 新增藝人的按鈕 - 只在創建模式顯示 */}
              {mode === 'create' && (
                <button
                  className={artistSelectionButton}
                  type="button"
                  onClick={openArtistSelectionModal}
                >
                  <span className={placeholderText}>請選擇偶像</span>
                  <div className={iconContainer}>
                    <ChevronDownIcon />
                  </div>
                </button>
              )}
            </div>
            <input type="hidden" {...register('artistIds')} />
            {errors.artistIds && <p className={errorText}>{errors.artistIds.message}</p>}
          </div>
        )}

        {/* 第二步：其他活動資訊 */}
        {(currentStep === 2 || mode === 'edit') && (
          <>
            {/* 活動標題 */}
            <div className={formGroup}>
              <label className={label} htmlFor="title">
                主題名稱*
              </label>
              <input className={input} id="title" type="text" {...register('title')} />
              {errors.title && <p className={errorText}>{errors.title.message}</p>}
            </div>

            {/* 主視覺圖片 */}
            <div className={formGroup}>
              <label className={label}>
                <PhotoIcon />
                主視覺圖片*
              </label>
              <p className={helperText}>主要宣傳圖片(推薦上傳比例 3:4)</p>
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
                compressionParams={{ maxWidth: 1200, maxHeight: 1200, quality: 0.9 }}
                placeholder="點擊上傳主視覺圖片"
                maxSizeMB={5}
                disabled={createEventMutation.isPending || updateEventMutation.isPending}
                authToken={token || undefined}
                enableCrop={false}
              />
              <input type="hidden" {...register('mainImage')} />
              {errors.mainImage && <p className={errorText}>{errors.mainImage.message}</p>}
            </div>

            {/* 活動時間 */}
            <div className={gridContainer}>
              <div className={formGroup}>
                <label className={label} htmlFor="startDate">
                  <CalendarIcon />
                  開始日期*
                </label>
                <DatePicker
                  value={watch('startDate') || ''}
                  onChange={(date) => {
                    setValue('startDate', date, { shouldValidate: true, shouldDirty: true });
                    // 如果結束日期早於新的開始日期，自動設為開始日期
                    const endDate = watch('endDate');
                    if (endDate && new Date(endDate) < new Date(date)) {
                      setValue('endDate', date, { shouldValidate: true, shouldDirty: true });
                    }

                    // 如果還沒有結束日期，自動設為開始日期
                    if (!endDate) {
                      setValue('endDate', date, { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                  placeholder="選擇開始日期"
                  disabled={createEventMutation.isPending || updateEventMutation.isPending}
                  error={!!errors.startDate}
                  min={new Date().toISOString().split('T')[0]}
                />
                <input type="hidden" {...register('startDate')} />
                {errors.startDate && <p className={errorText}>{errors.startDate.message}</p>}
              </div>

              <div className={formGroup}>
                <label className={label} htmlFor="endDate">
                  <CalendarIcon />
                  結束日期*
                </label>
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
                  <p className={helperText} style={{ color: '#f59e0b' }}>
                    請先選擇開始日期
                  </p>
                )}
                <input type="hidden" {...register('endDate')} />
                {errors.endDate && <p className={errorText}>{errors.endDate.message}</p>}
              </div>
            </div>

            {/* 活動地址 */}
            <div className={formGroup}>
              <label className={label}>
                <MapPinIcon />
                地點*
              </label>
              <p className={helperText}>搜尋店家名稱或地址（出現選項之後，選擇正確的店家即可！）</p>
              <PlaceAutocomplete
                onPlaceSelect={handlePlaceSelect}
                defaultValue={existingEvent?.location.name}
              />
              <input type="hidden" {...register('addressName')} />
              {errors.addressName && <p className={errorText}>{errors.addressName.message}</p>}
            </div>

            {/* 活動描述 */}
            <div className={formGroup}>
              <label className={label} htmlFor="description">
                詳細說明
              </label>
              <textarea
                className={textarea}
                id="description"
                rows={10}
                placeholder="描述應援內容與資訊，例如：時間/領取應援/注意事項等等"
                {...register('description')}
              />
              <div
                className={characterCount({
                  isOverLimit: (watch('description')?.length || 0) > 1500,
                })}
              >
                {watch('description')?.length || 0} / 1500
              </div>
              {errors.description && <p className={errorText}>{errors.description.message}</p>}
            </div>

            {/* 詳細說明圖片 */}
            <div className={formGroup}>
              <label className={label}>
                <PhotoIcon />
                詳細說明圖片
              </label>
              <p className={helperText}>
                應援的詳細說明圖片，可包含活動流程、注意事項等詳細資訊，最多可上傳 5 張
              </p>
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
                placeholder="點擊新增圖片"
                maxSizeMB={5}
                disabled={createEventMutation.isPending || updateEventMutation.isPending}
                authToken={token || undefined}
                compressionParams={{ maxWidth: 1200, maxHeight: 1200, quality: 0.9 }}
              />
              <input type="hidden" {...register('detailImage')} />
              {errors.detailImage && <p className={errorText}>{errors.detailImage.message}</p>}
            </div>

            {/* 聯絡資訊 */}
            <div className={sectionDivider}>
              <h3 className={sectionTitle}>社群媒體</h3>
              <p className={helperText}>
                請提供主要公布資訊的社群平台，請至少填寫一項，若無則會審核失敗（若聯合主辦，請寫主要公布資訊的帳號）
              </p>

              <div className={gridContainer} style={{ marginTop: '8px' }}>
                {errors.instagram && errors.instagram.type === 'custom' && (
                  <p className={errorText} style={{ marginTop: '8px' }}>
                    {errors.instagram.message}
                  </p>
                )}
                <div className={formGroup}>
                  <label className={label} htmlFor="instagram">
                    Instagram
                  </label>
                  <input
                    className={input}
                    id="instagram"
                    type="text"
                    placeholder="填寫 id 例如: boynextdoor_official"
                    {...register('instagram')}
                  />
                </div>
                <div className={formGroup}>
                  <label className={label} htmlFor="x">
                    X
                  </label>
                  <input
                    className={input}
                    id="x"
                    type="text"
                    placeholder="填寫 id 例如: BOYNEXTDOOR_KOZ"
                    {...register('x')}
                  />
                </div>
                <div className={formGroup}>
                  <label className={label} htmlFor="threads">
                    Threads
                  </label>
                  <input
                    className={input}
                    id="threads"
                    type="text"
                    placeholder="填寫 id 例如: _muri.ri"
                    {...register('threads')}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* 步驟導航按鈕 */}
        <div className={buttonGroup}>
          {mode === 'create' && currentStep === 1 ? (
            // 第一步：下一步按鈕
            <>
              <button
                className={button({ variant: 'primary' })}
                type="button"
                onClick={handleNextStep}
              >
                下一步
              </button>
              <button
                className={button({ variant: 'secondary' })}
                type="button"
                onClick={onCancel || (() => router.push('/'))}
              >
                取消
              </button>
            </>
          ) : mode === 'create' && currentStep === 2 ? (
            // 第二步：上一步 + 提交按鈕
            <>
              <button
                className={button({ variant: 'secondary' })}
                type="button"
                onClick={handlePrevStep}
              >
                上一步
              </button>
              <button
                className={button({ variant: 'primary' })}
                type="button"
                disabled={createEventMutation.isPending}
                onClick={handleSubmit(onSubmit)}
              >
                {createEventMutation.isPending ? (
                  <>
                    <div className={loadingSpinner} />
                    投稿中...
                  </>
                ) : (
                  '送出投稿'
                )}
              </button>
            </>
          ) : (
            // 編輯模式：原有的按鈕
            <>
              <button
                className={button({ variant: 'primary' })}
                type="button"
                disabled={updateEventMutation.isPending || resubmitEventMutation.isPending}
                onClick={handleSubmit(onSubmit)}
              >
                {updateEventMutation.isPending ? (
                  <>
                    <div className={loadingSpinner} />
                    更新中...
                  </>
                ) : resubmitEventMutation.isPending ? (
                  <>
                    <div className={loadingSpinner} />
                    重新送出審核中...
                  </>
                ) : existingEvent?.status === 'rejected' ? (
                  '重新送審'
                ) : (
                  '更新'
                )}
              </button>
              <button
                className={button({ variant: 'secondary' })}
                type="button"
                onClick={onCancel || (() => router.push('/'))}
              >
                取消
              </button>
            </>
          )}
        </div>
      </form>

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
    </div>
  );
}
