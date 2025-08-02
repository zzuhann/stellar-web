'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserIcon, CalendarIcon, PhotoIcon } from '@heroicons/react/24/outline';
import * as z from 'zod';
import styled from 'styled-components';
import { useArtistStore, useUIStore } from '@/store';
import { useAuth } from '@/lib/auth-context';
import { useAuthToken } from '@/hooks/useAuthToken';
import ImageUpload from '@/components/ui/ImageUpload';
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

// 藝人投稿表單驗證
const artistSubmissionSchema = z.object({
  stageName: z
    .string()
    .min(1, '請輸入藝名')
    .min(2, '藝名至少需要2個字元')
    .max(50, '藝名不能超過50個字元'),
  realName: z.string().max(50, '本名不能超過50個字元').optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  profileImage: z.string().url('請輸入正確的圖片連結格式').optional().or(z.literal('')),
});

type ArtistSubmissionFormData = z.infer<typeof artistSubmissionSchema>;

export default function ArtistSubmissionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const router = useRouter();
  const { createArtist } = useArtistStore();
  const { addNotification } = useUIStore();
  const { user } = useAuth();
  const { token } = useAuthToken();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ArtistSubmissionFormData>({
    resolver: zodResolver(artistSubmissionSchema),
  });

  const onSubmit = async (data: ArtistSubmissionFormData) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: '請先登入',
        message: '您需要登入後才能投稿藝人',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 準備藝人資料
      const artistData = {
        stageName: data.stageName,
        realName: data.realName || undefined,
        birthday: data.birthday || undefined,
        profileImage: uploadedImageUrl || data.profileImage || undefined,
      };

      await createArtist(artistData);

      addNotification({
        type: 'success',
        title: '藝人投稿成功',
        message: '您投稿的藝人已送出審核，審核通過後其他用戶就可以選擇了',
      });

      reset();
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
        <h2>投稿偶像</h2>
        <p>新增偶像到我們的資料庫，審核通過後其他用戶可以為他們建立應援活動!</p>
      </FormHeader>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* 藝名 */}
        <FormGroup>
          <Label htmlFor="stageName">
            <UserIcon />
            藝名（偶像活動名稱、中譯名稱）*
          </Label>
          <Input
            id="stageName"
            type="text"
            placeholder="例：泰山、明宰鉉、S.COUPS"
            {...register('stageName')}
          />
          {errors.stageName && <ErrorText>{errors.stageName.message}</ErrorText>}
        </FormGroup>

        {/* 本名 */}
        <FormGroup>
          <Label htmlFor="realName">本名（中譯名稱）*</Label>
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
          <Input id="birthday" type="date" {...register('birthday')} />
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
              onUploadComplete={(imageUrl) => {
                setUploadedImageUrl(imageUrl);
                addNotification({
                  type: 'success',
                  title: '圖片上傳成功',
                  message: '圖片已成功上傳並裁切',
                });
              }}
              onImageRemove={() => {
                setUploadedImageUrl('');
              }}
              placeholder="點擊上傳藝人照片或拖拽至此"
              maxSizeMB={3}
              disabled={isLoading}
              authToken={token || undefined}
              useRealAPI={!!token}
              enableCrop={true}
              cropAspectRatio={1}
              cropShape="square"
              cropOutputSize={400}
            />
          </FormGroup>
        </ImageSection>

        {/* 說明區塊 */}
        <InfoBox>
          <div className="title">投稿說明：</div>
          <ul>
            <li>投稿的偶像將經過管理員審核</li>
            <li>審核通過後，所有用戶都可以選擇這位偶像來投稿應援活動</li>
            <li>請確保偶像資訊的正確性以及照片來源是否可公開使用</li>
            <li>資料錯誤、重複的偶像投稿將被拒絕</li>
          </ul>
        </InfoBox>

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
