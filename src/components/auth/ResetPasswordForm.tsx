'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations';
import { resetPassword } from '@/lib/auth';
import showToast from '@/lib/toast';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

// Styled Components
const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
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
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  font-size: 12px;
  color: #ef4444;
  margin: 4px 0 0 0;
`;

const ErrorBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-lg);
  padding: 12px 16px;

  p {
    font-size: 14px;
    color: #dc2626;
    margin: 0;
  }
`;

const SubmitButton = styled.button<{ loading?: boolean }>`
  width: 100%;
  padding: 14px 24px;
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: ${(props) => (props.loading ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.loading ? 0.7 : 1)};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #3a5d7a;
    border-color: #3a5d7a;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Spinner = styled.div`
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

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
`;

const LinkButton = styled.button`
  font-size: 14px;
  color: var(--color-primary);
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #3a5d7a;
    text-decoration: underline;
  }
`;

// Success State Components
const SuccessContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
`;

const SuccessIcon = styled.div`
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: 48px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const SuccessTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
`;

const SuccessSubtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 16px 0;
`;

const EmailHighlight = styled.p`
  font-weight: 600;
  color: #d97706;
  margin: 8px 0 0 0;
`;

const InfoBox = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
`;

const InfoTitle = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #1d4ed8;
  margin: 0 0 8px 0;
`;

const InfoList = styled.ol`
  font-size: 14px;
  color: #1e40af;
  margin: 0;
  padding-left: 16px;

  li {
    margin-bottom: 4px;
  }
`;

const BackButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #3a5d7a;
    border-color: #3a5d7a;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

const ResendContainer = styled.div`
  margin-top: 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
`;

const ResendButton = styled.button`
  color: var(--color-primary);
  font-weight: 500;
  margin-left: 4px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #3a5d7a;
  }
`;

export default function ResetPasswordForm({ onSuccess, onSwitchToSignIn }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        setError('root', { message: error });
        showToast.error('重設密碼失敗');
      } else {
        setIsEmailSent(true);
        showToast.success('重設密碼郵件已發送');
      }
    } catch {
      const errorMessage = '發送重設密碼郵件時發生未知錯誤';
      setError('root', { message: errorMessage });
      showToast.error('重設密碼失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    onSuccess?.();
    onSwitchToSignIn?.();
  };

  if (isEmailSent) {
    return (
      <SuccessContainer>
        <SuccessIcon>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </SuccessIcon>

        <SuccessTitle>郵件已發送</SuccessTitle>
        <SuccessSubtitle>我們已經發送重設密碼的郵件到</SuccessSubtitle>
        <EmailHighlight>{getValues('email')}</EmailHighlight>

        <InfoBox>
          <InfoTitle>請按照以下步驟完成密碼重設：</InfoTitle>
          <InfoList>
            <li>檢查您的電子郵件信箱</li>
            <li>點擊郵件中的重設密碼連結</li>
            <li>設定新的密碼</li>
            <li>使用新密碼登入</li>
          </InfoList>
        </InfoBox>

        <BackButton type="button" onClick={handleBackToSignIn}>
          返回登入
        </BackButton>

        <ResendContainer>
          沒有收到郵件？檢查垃圾郵件資料夾或
          <ResendButton type="button" onClick={() => setIsEmailSent(false)}>
            重新發送
          </ResendButton>
        </ResendContainer>
      </SuccessContainer>
    );
  }

  return (
    <FormContainer>
      <FormHeader>
        <Title>重設密碼</Title>
        <Subtitle>請輸入您的電子郵件地址，我們將發送重設密碼的連結給您</Subtitle>
      </FormHeader>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* 電子郵件 */}
        <FormField>
          <Label htmlFor="email">電子郵件</Label>
          <Input
            id="email"
            type="text"
            autoComplete="email"
            placeholder="請輸入您的電子郵件"
            {...register('email')}
          />
          {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
        </FormField>

        {/* 錯誤訊息 */}
        {errors.root && (
          <ErrorBox>
            <p>{errors.root.message}</p>
          </ErrorBox>
        )}

        {/* 發送重設郵件按鈕 */}
        <SubmitButton type="submit" loading={isLoading} disabled={isLoading}>
          {isLoading ? (
            <LoadingContent>
              <Spinner />
              <span>發送中...</span>
            </LoadingContent>
          ) : (
            '發送重設郵件'
          )}
        </SubmitButton>

        {/* 其他操作 */}
        <ActionsContainer>
          {onSwitchToSignIn && (
            <LinkButton type="button" onClick={onSwitchToSignIn}>
              返回登入
            </LinkButton>
          )}
        </ActionsContainer>
      </Form>
    </FormContainer>
  );
}
