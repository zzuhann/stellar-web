'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserIcon, CalendarIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import { artistSubmissionSchema, ArtistSubmissionFormData } from '@/lib/validations';
import { useArtistStore } from '@/store';
import { useAuth } from '@/lib/auth-context';
import { useAuthToken } from '@/hooks/useAuthToken';
import ImageUpload from '@/components/images/ImageUpload';
import DatePicker from '@/components/DatePicker';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useRouter } from 'next/navigation';
import { Artist } from '@/types';
import { artistsApi } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import showToast from '@/lib/toast';
import { uploadImageToAPI } from '@/lib/r2-upload';
import { CDN_DOMAIN } from '@/constants';

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

const infoBox = css({
  background: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: 'radius.lg',
  padding: '20px',
  '& .title': {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0369a1',
    margin: '0 0 12px 0',
    '@media (min-width: 768px)': {
      fontSize: '15px',
    },
  },
  '& ul': {
    fontSize: '13px',
    color: '#0369a1',
    margin: '0',
    paddingLeft: '16px',
    '@media (min-width: 768px)': {
      fontSize: '14px',
    },
    '& li': {
      marginBottom: '6px',
      lineHeight: '1.5',
    },
  },
});

const imageSection = css({
  '& .manual-input': {
    marginTop: '16px',
  },
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
        '&:hover:not(:disabled)': {
          background: '#3a5d7a',
          borderColor: '#3a5d7a',
          transform: 'translateY(-1px)',
          boxShadow: 'shadow.md',
        },
        '&:disabled': {
          background: 'color.text.disabled',
          borderColor: 'color.text.disabled',
        },
      },
      secondary: {
        background: 'color.background.primary',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
        '&:hover': {
          background: 'color.background.secondary',
          borderColor: 'color.border.medium',
        },
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

interface ArtistSubmissionFormProps {
  mode?: 'create' | 'edit';
  existingArtist?: Artist;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ArtistSubmissionForm({
  mode = 'create',
  existingArtist,
  onSuccess,
  onCancel,
}: ArtistSubmissionFormProps) {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(
    existingArtist?.profileImage || ''
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null); // 存儲選擇的圖片檔案
  const [isUploadingImage, setIsUploadingImage] = useState(false); // 圖片上傳狀態
  const [hasImageChanged, setHasImageChanged] = useState(false); // 追蹤圖片是否有變更
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<ArtistSubmissionFormData | null>(null);
  const router = useRouter();
  const { createArtist } = useArtistStore();
  const { user } = useAuth();
  const { token } = useAuthToken();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<ArtistSubmissionFormData>({
    resolver: zodResolver(artistSubmissionSchema),
    defaultValues: existingArtist
      ? {
          stageName: existingArtist.stageName,
          stageNameZh: existingArtist.stageNameZh || '',
          realName: existingArtist.realName || '',
          birthday: existingArtist.birthday || '',
          profileImage: existingArtist.profileImage || '',
        }
      : {
          stageName: '',
          stageNameZh: '',
          realName: '',
          birthday: '',
          profileImage: '',
        },
  });

  // 新增藝人 mutation
  const createArtistMutation = useMutation({
    mutationFn: createArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('投稿成功');
      onSuccess?.();
      if (!onSuccess) {
        router.push('/my-submissions?tab=artist');
      }
    },
    onError: (error: any) => {
      // 從後端錯誤回應中提取錯誤訊息
      const errorMessage = error?.response?.data?.error || '投稿失敗';
      showToast.error(errorMessage);
    },
  });

  // 編輯藝人 mutation
  const updateArtistMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // 先更新藝人資料
      const updatedArtist = await artistsApi.update(id, data);
      // 只有在狀態是 rejected 時才重新送審
      if (existingArtist?.status === 'rejected') {
        await artistsApi.resubmit(id);
      }
      return updatedArtist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('更新成功');
      onSuccess?.();
    },
    onError: (error: any) => {
      // 從後端錯誤回應中提取錯誤訊息
      const errorMessage = error?.response?.data?.error || '藝人更新失敗';
      showToast.error(errorMessage);
    },
  });

  // 檢測是否有任何改動的函數
  const checkForChanges = () => {
    if (mode !== 'edit' || !existingArtist) {
      return true; // 非編輯模式一律允許提交
    }

    // 檢測表單欄位改動
    const formHasChanges = isDirty;

    // 檢測圖片改動 - 使用 hasImageChanged 標記
    const imageChanged = hasImageChanged;

    return formHasChanges || imageChanged;
  };

  const onSubmit = async (data: ArtistSubmissionFormData) => {
    if (!user) {
      showToast.warning('請先登入');
      return;
    }

    // 檢查是否有變更
    const hasChanges = checkForChanges();

    if (!hasChanges) {
      showToast.success('更新成功');
      return;
    }

    // 如果是編輯模式且狀態是 rejected，顯示確認彈窗
    if (mode === 'edit' && existingArtist?.status === 'rejected') {
      setPendingSubmitData(data);
      setConfirmModalOpen(true);
      return;
    }

    await submitArtistData(data);
  };

  const submitArtistData = async (data: ArtistSubmissionFormData) => {
    let finalImageUrl = uploadedImageUrl || data.profileImage || undefined;

    // 如果有選擇新的圖片檔案且圖片確實有變更，先上傳圖片
    if (selectedImageFile && hasImageChanged) {
      try {
        setIsUploadingImage(true);
        const uploadResult = await uploadImageToAPI(selectedImageFile, token || '');
        if (uploadResult.success && uploadResult.filename) {
          finalImageUrl = CDN_DOMAIN + uploadResult.filename;
        } else {
          showToast.error(uploadResult.error || '圖片上傳失敗');
          return;
        }
      } catch {
        showToast.error('圖片上傳失敗，請重試');
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    // 準備藝人資料
    const artistData = {
      stageName: data.stageName,
      stageNameZh: data.stageNameZh,
      realName: data.realName || undefined,
      birthday: data.birthday || undefined,
      profileImage: finalImageUrl,
    };

    if (mode === 'create') {
      createArtistMutation.mutate(artistData);
    } else if (mode === 'edit' && existingArtist) {
      updateArtistMutation.mutate({
        id: existingArtist.id,
        data: artistData,
      });
    }
  };

  const handleConfirmSubmit = () => {
    if (pendingSubmitData) {
      submitArtistData(pendingSubmitData);
      setConfirmModalOpen(false);
      setPendingSubmitData(null);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmModalOpen(false);
    setPendingSubmitData(null);
  };

  // 初始化時同步值
  useEffect(() => {
    if (uploadedImageUrl) {
      setValue('profileImage', uploadedImageUrl);
    }
  }, [uploadedImageUrl, setValue]);

  return (
    <div className={formContainer}>
      <div className={formHeader}>
        <h2>{mode === 'edit' ? '編輯偶像' : '投稿偶像'}</h2>
        {mode !== 'edit' && <p>新增偶像到我們的資料庫，審核通過後其他用戶可以為他們建立生日應援</p>}
        {mode === 'edit' && (
          <p style={{ fontSize: '14px', color: '#ef4444', margin: '8px 0 0 0' }}>
            編輯後的資料將重新進入審核流程
          </p>
        )}
      </div>

      <div className={form}>
        {/* 英文藝名 */}
        <div className={formGroup}>
          <label className={label} htmlFor="stageName">
            <UserIcon />
            藝名（請填寫官方正名的英文名稱）*
          </label>
          <input
            className={input}
            id="stageName"
            type="text"
            placeholder="例：S.COUPS、Riku、RIWOO"
            {...register('stageName')}
          />
          {errors.stageName && <p className={errorText}>{errors.stageName.message}</p>}
        </div>

        {/* 中文藝名 */}
        <div className={formGroup}>
          <label className={label} htmlFor="stageNameZh">
            藝名（中文）
          </label>
          <input
            className={input}
            id="stageNameZh"
            type="text"
            placeholder="例：泰山、李涵（沒有可不填）"
            {...register('stageNameZh')}
          />
          {errors.stageNameZh && <p className={errorText}>{errors.stageNameZh.message}</p>}
        </div>

        {/* 本名 */}
        <div className={formGroup}>
          <label className={label} htmlFor="realName">
            本名（中文）
          </label>
          <input
            className={input}
            id="realName"
            type="text"
            placeholder="例：漢東旼、明宰鉉、崔勝哲"
            {...register('realName')}
          />
          {errors.realName && <p className={errorText}>{errors.realName.message}</p>}
        </div>

        {/* 生日 */}
        <div className={formGroup}>
          <label className={label} htmlFor="birthday">
            <CalendarIcon />
            生日*
          </label>
          <DatePicker
            value={watch('birthday') || ''}
            onChange={(date) =>
              setValue('birthday', date, { shouldValidate: true, shouldDirty: true })
            }
            placeholder="選擇生日"
            disabled={createArtistMutation.isPending || updateArtistMutation.isPending}
            error={!!errors.birthday}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.birthday && <p className={errorText}>{errors.birthday.message}</p>}
        </div>

        {/* 個人照片/團體照 */}
        <div className={imageSection}>
          <div className={formGroup}>
            <label className={label}>
              <PhotoIcon />
              偶像照片*
            </label>
            <p className={helperText}>
              請注意來源、是否可公開使用，避免侵權(若未來有爭議將直接下架替換其他照片)
            </p>

            <ImageUpload
              currentImageUrl={uploadedImageUrl}
              delayUpload={true}
              onFileReady={(file) => {
                // 保存選擇的檔案，不立即上傳
                setSelectedImageFile(file);
                setHasImageChanged(true); // 標記圖片已變更
                // 更新預覽 URL（ImageUpload 組件會處理預覽，這裡不需要設定 uploadedImageUrl）
                setValue('profileImage', 'pending', {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              onImageRemove={() => {
                setUploadedImageUrl('');
                setSelectedImageFile(null);
                setHasImageChanged(true); // 移除圖片也算變更
                setValue('profileImage', '', {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              onCropCancel={() => {
                // 如果是第一次上傳且取消裁切，清空圖片
                if (!existingArtist?.profileImage) {
                  setUploadedImageUrl('');
                  setSelectedImageFile(null);
                  setValue('profileImage', '', {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                } else {
                  // 如果是編輯模式，恢復到原始圖片
                  setUploadedImageUrl(existingArtist.profileImage);
                  setSelectedImageFile(null);
                  setHasImageChanged(false); // 取消時重置變更狀態
                  setValue('profileImage', existingArtist.profileImage, {
                    shouldValidate: true,
                    shouldDirty: false,
                  });
                }
              }}
              placeholder="點擊上傳偶像照片"
              maxSizeMB={5}
              disabled={
                createArtistMutation.isPending || updateArtistMutation.isPending || isUploadingImage
              }
              authToken={token || undefined}
              enableCrop
              cropAspectRatio={1}
              cropOutputSize={400}
            />
            {errors.profileImage && <p className={errorText}>{errors.profileImage.message}</p>}
          </div>
        </div>

        {/* 說明區塊 */}
        <div className={infoBox}>
          <div className="title">投稿說明：</div>
          <ul>
            <li>投稿的偶像將經過審核</li>
            <li>審核通過後，所有用戶都可以選擇這位偶像來建立生日應援</li>
            <li>請確保偶像資訊的正確性以及照片來源是否可公開使用</li>
            <li>資料錯誤、重複的偶像投稿審核不會通過</li>
            <li>若有多人重複投稿偶像，將以投稿時間較早者為準</li>
          </ul>
        </div>

        {/* 提交按鈕 */}
        <div className={buttonGroup}>
          <button
            type="button"
            className={button({ variant: 'primary' })}
            disabled={
              createArtistMutation.isPending || updateArtistMutation.isPending || isUploadingImage
            }
            onClick={handleSubmit(onSubmit, (errors) => {
              // 找出第一個錯誤並顯示
              const firstError = Object.values(errors)[0]?.message;
              if (firstError) {
                showToast.error(firstError);
              }
            })}
          >
            {isUploadingImage ||
            createArtistMutation.isPending ||
            updateArtistMutation.isPending ? (
              <>
                <div className={loadingSpinner} />
                {mode === 'edit' ? '更新中...' : '投稿中...'}
              </>
            ) : mode === 'edit' ? (
              '更新資料'
            ) : (
              '送出投稿'
            )}
          </button>

          <button
            type="button"
            className={button({ variant: 'secondary' })}
            onClick={onCancel || (() => router.push('/'))}
          >
            取消
          </button>
        </div>
      </div>

      {/* 確認彈窗 - 只在編輯模式且狀態為 rejected 時顯示 */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="確認重新送審"
        message="是否確認所有資訊都正確？送出之後將會重新送審。"
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelConfirm}
        confirmText="確認送出"
        cancelText="取消"
        isLoading={createArtistMutation.isPending || updateArtistMutation.isPending}
      />
    </div>
  );
}
