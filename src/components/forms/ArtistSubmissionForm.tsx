'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserIcon, CalendarIcon, PhotoIcon } from '@heroicons/react/24/outline';
import * as z from 'zod';
import { useArtistStore, useUIStore } from '@/store';
import { useAuth } from '@/lib/auth-context';
import { useAuthToken } from '@/hooks/useAuthToken';
import ImageUpload from '@/components/ui/ImageUpload';
import styled from 'styled-components';

// Styled Components (reuse from EventEditForm)
const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;

  @media (min-width: 768px) {
    padding: 32px;
  }
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin: 0 0 8px 0;

    @media (min-width: 768px) {
      font-size: 28px;
    }
  }

  p {
    font-size: 14px;
    color: #666;
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
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;

  @media (min-width: 768px) {
    font-size: 15px;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background: #fff;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: #999;
  }

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    padding: 14px 18px;
    font-size: 15px;
  }
`;

const HelperText = styled.p`
  font-size: 12px;
  color: #888;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 13px;
  }
`;

const ErrorText = styled.p`
  font-size: 13px;
  color: #dc3545;
  margin: 0;
`;

const InfoBox = styled.div`
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  padding: 16px;

  .title {
    font-size: 14px;
    font-weight: 600;
    color: #0066cc;
    margin: 0 0 8px 0;
  }

  ul {
    font-size: 13px;
    color: #0066cc;
    margin: 0;
    padding-left: 16px;

    li {
      margin-bottom: 4px;
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
  border-top: 1px solid #e9ecef;

  @media (min-width: 480px) {
    flex-direction: row;
    gap: 16px;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
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
    background: #007bff;
    border-color: #007bff;
    color: white;
    flex: 1;
    
    &:hover:not(:disabled) {
      background: #0056b3;
      border-color: #0056b3;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }
    
    &:disabled {
      background: #6c757d;
      border-color: #6c757d;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `
      : `
    background: #fff;
    border-color: #ddd;
    color: #666;
    
    &:hover {
      background: #f8f9fa;
      border-color: #adb5bd;
    }
  `}

  @media (min-width: 768px) {
    padding: 14px 28px;
    font-size: 15px;
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

interface ArtistSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ArtistSubmissionForm({ onSuccess, onCancel }: ArtistSubmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
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
      onSuccess?.();
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
        <h2>投稿藝人</h2>
        <p>新增 K-pop 藝人到我們的資料庫</p>
      </FormHeader>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* 藝名 */}
        <FormGroup>
          <Label htmlFor="stageName">
            <UserIcon />
            藝名 / 團體名稱 *
          </Label>
          <Input
            id="stageName"
            type="text"
            placeholder="例：IU、BTS、BLACKPINK"
            {...register('stageName')}
          />
          {errors.stageName && <ErrorText>{errors.stageName.message}</ErrorText>}
        </FormGroup>

        {/* 本名 */}
        <FormGroup>
          <Label htmlFor="realName">本名 / 韓文名稱</Label>
          <Input
            id="realName"
            type="text"
            placeholder="例：이지은 (李知恩)、방탄소년단"
            {...register('realName')}
          />
          {errors.realName && <ErrorText>{errors.realName.message}</ErrorText>}
          <HelperText>可選填，有助於其他用戶識別</HelperText>
        </FormGroup>

        {/* 生日 */}
        <FormGroup>
          <Label htmlFor="birthday">
            <CalendarIcon />
            生日 / 出道日期
          </Label>
          <Input id="birthday" type="date" {...register('birthday')} />
          {errors.birthday && <ErrorText>{errors.birthday.message}</ErrorText>}
          <HelperText>個人藝人填生日，團體可填出道日期</HelperText>
        </FormGroup>

        {/* 個人照片/團體照 */}
        <ImageSection>
          <FormGroup>
            <Label>
              <PhotoIcon />
              個人照片 / 團體照
            </Label>

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

            {/* 仍保留手動輸入連結的選項 */}
            <div className="manual-input">
              <Label htmlFor="profileImage">或手動輸入圖片連結</Label>
              <Input
                id="profileImage"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register('profileImage')}
                disabled={!!uploadedImageUrl}
              />
              {errors.profileImage && <ErrorText>{errors.profileImage.message}</ErrorText>}
              <HelperText>
                {uploadedImageUrl ? '已使用上傳的圖片' : '可選填，上傳圖片或提供公開的圖片連結'}
              </HelperText>
            </div>
          </FormGroup>
        </ImageSection>

        {/* 說明區塊 */}
        <InfoBox>
          <div className="title">投稿說明：</div>
          <ul>
            <li>投稿的藝人將經過管理員審核</li>
            <li>審核通過後，所有用戶都可以選擇這位藝人來投稿活動</li>
            <li>請確保藝人資訊的正確性</li>
            <li>重複的藝人投稿將被拒絕</li>
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

          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              取消
            </Button>
          )}
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
}
