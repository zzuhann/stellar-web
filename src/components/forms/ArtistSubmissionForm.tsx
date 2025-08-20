'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserIcon, CalendarIcon, PhotoIcon } from '@heroicons/react/24/outline';
import * as z from 'zod';
import styled from 'styled-components';
import { useArtistStore } from '@/store';
import { useAuth } from '@/lib/auth-context';
import { useAuthToken } from '@/hooks/useAuthToken';
import ImageUpload from '@/components/ui/ImageUpload';
import DatePicker from '@/components/ui/DatePicker';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useRouter } from 'next/navigation';
import { Artist } from '@/types';
import { artistsApi } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import showToast from '@/lib/toast';

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

const InfoBox = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: var(--radius-lg);
  padding: 20px;

  .title {
    font-size: 14px;
    font-weight: 600;
    color: #0369a1;
    margin: 0 0 12px 0;
  }

  ul {
    font-size: 13px;
    color: #0369a1;
    margin: 0;
    padding-left: 16px;

    li {
      margin-bottom: 6px;
      line-height: 1.5;
    }
  }

  @media (min-width: 768px) {
    .title {
      font-size: 15px;
    }

    ul {
      font-size: 14px;
    }
  }
`;

const ImageSection = styled.div`
  .manual-input {
    margin-top: 16px;
  }
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

// 藝人投稿表單驗證
const artistSubmissionSchema = z.object({
  stageName: z
    .string()
    .min(1, '請輸入英文藝名')
    .min(2, '英文藝名至少需要2個字元')
    .max(50, '英文藝名不能超過50個字元'),
  stageNameZh: z.string().max(50, '中文藝名不能超過50個字元').optional().or(z.literal('')),
  realName: z.string().max(50, '本名不能超過50個字元').optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  profileImage: z.string().url('請輸入正確的圖片連結格式').optional().or(z.literal('')),
});

type ArtistSubmissionFormData = z.infer<typeof artistSubmissionSchema>;

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
      : undefined,
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
      // 然後自動重新送審
      await artistsApi.resubmit(id);
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

    // 檢測圖片改動
    const imageChanged = uploadedImageUrl !== (existingArtist.profileImage || '');

    return formHasChanges || imageChanged;
  };

  const onSubmit = async (data: ArtistSubmissionFormData) => {
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
    if (mode === 'edit' && existingArtist?.status === 'rejected') {
      setPendingSubmitData(data);
      setConfirmModalOpen(true);
      return;
    }

    await submitArtistData(data);
  };

  const submitArtistData = async (data: ArtistSubmissionFormData) => {
    // 準備藝人資料
    const artistData = {
      stageName: data.stageName,
      stageNameZh: data.stageNameZh || undefined,
      realName: data.realName || undefined,
      birthday: data.birthday || undefined,
      profileImage: uploadedImageUrl || data.profileImage || undefined,
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
    <FormContainer>
      <FormHeader>
        <h2>{mode === 'edit' ? '編輯偶像' : '投稿偶像'}</h2>
        {mode !== 'edit' && <p>新增偶像到我們的資料庫，審核通過後其他用戶可以為他們建立生咖應援</p>}
        {mode === 'edit' && (
          <p style={{ fontSize: '14px', color: '#ef4444', margin: '8px 0 0 0' }}>
            編輯後的資料將重新進入審核流程
          </p>
        )}
      </FormHeader>

      <Form>
        {/* 英文藝名 */}
        <FormGroup>
          <Label htmlFor="stageName">
            <UserIcon />
            藝名（請填寫官方正名的英文名稱）*
          </Label>
          <Input
            id="stageName"
            type="text"
            placeholder="例：S.COUPS、Riku、RIWOO"
            {...register('stageName')}
          />
          {errors.stageName && <ErrorText>{errors.stageName.message}</ErrorText>}
        </FormGroup>

        {/* 中文藝名 */}
        <FormGroup>
          <Label htmlFor="stageNameZh">藝名（中文）</Label>
          <Input
            id="stageNameZh"
            type="text"
            placeholder="例：泰山、李涵（沒有可不填）"
            {...register('stageNameZh')}
          />
          {errors.stageNameZh && <ErrorText>{errors.stageNameZh.message}</ErrorText>}
        </FormGroup>

        {/* 本名 */}
        <FormGroup>
          <Label htmlFor="realName">本名（中文）</Label>
          <Input
            id="realName"
            type="text"
            placeholder="例：漢東旼、明宰鉉、崔勝哲"
            {...register('realName')}
          />
          {errors.realName && <ErrorText>{errors.realName.message}</ErrorText>}
        </FormGroup>

        {/* 生日 */}
        <FormGroup>
          <Label htmlFor="birthday">
            <CalendarIcon />
            生日*
          </Label>
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
          {errors.birthday && <ErrorText>{errors.birthday.message}</ErrorText>}
        </FormGroup>

        {/* 個人照片/團體照 */}
        <ImageSection>
          <FormGroup>
            <Label>
              <PhotoIcon />
              偶像照片*
            </Label>
            <HelperText>
              請注意來源、是否可公開使用，避免侵權(若未來有爭議將直接下架替換其他照片)
            </HelperText>

            <ImageUpload
              currentImageUrl={uploadedImageUrl}
              onUploadComplete={(imageUrl) => {
                setUploadedImageUrl(imageUrl);
                setValue('profileImage', imageUrl, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                showToast.success('圖片上傳成功');
              }}
              onImageRemove={() => {
                setUploadedImageUrl('');
                setValue('profileImage', '', {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              onCropCancel={() => {
                // 如果是第一次上傳且取消裁切，清空圖片
                if (!existingArtist?.profileImage) {
                  setUploadedImageUrl('');
                  setValue('profileImage', '', {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                } else {
                  // 如果是編輯模式，恢復到原始圖片
                  setUploadedImageUrl(existingArtist.profileImage);
                  setValue('profileImage', existingArtist.profileImage, {
                    shouldValidate: true,
                    shouldDirty: false,
                  });
                }
              }}
              placeholder="點擊上傳偶像照片或拖拽至此"
              maxSizeMB={5}
              disabled={createArtistMutation.isPending || updateArtistMutation.isPending}
              authToken={token || undefined}
              useRealAPI={!!token}
              enableCrop={mode === 'create'}
              cropAspectRatio={1}
              cropShape="circle"
              cropOutputSize={400}
            />
          </FormGroup>
        </ImageSection>

        {/* 說明區塊 */}
        <InfoBox>
          <div className="title">投稿說明：</div>
          <ul>
            <li>投稿的偶像將經過審核</li>
            <li>審核通過後，所有用戶都可以選擇這位偶像來建立生咖應援</li>
            <li>請確保偶像資訊的正確性以及照片來源是否可公開使用</li>
            <li>資料錯誤、重複的偶像投稿審核不會通過</li>
            <li>若有多人重複投稿偶像，將以投稿時間較早者為準</li>
          </ul>
        </InfoBox>

        {/* 提交按鈕 */}
        <ButtonGroup>
          <Button
            type="button"
            variant="primary"
            disabled={createArtistMutation.isPending || updateArtistMutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {createArtistMutation.isPending || updateArtistMutation.isPending ? (
              <>
                <LoadingSpinner />
                {mode === 'edit' ? '更新中...' : '投稿中...'}
              </>
            ) : mode === 'edit' ? (
              '更新資料'
            ) : (
              '提交投稿'
            )}
          </Button>

          <Button type="button" variant="secondary" onClick={onCancel || (() => router.push('/'))}>
            取消
          </Button>
        </ButtonGroup>
      </Form>

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
    </FormContainer>
  );
}
