'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';
import { signUpSchema, SignUpFormData } from '@/lib/validations';
import { signUp } from '@/lib/auth';
import showToast from '@/lib/toast';

interface SignUpFormProps {
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

const InputWrapper = styled.div`
  position: relative;
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

const PasswordInput = styled(Input)`
  padding-right: 48px;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-text-primary);
  }

  svg {
    width: 20px;
    height: 20px;
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

const TextWithLink = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);

  button {
    color: var(--color-primary);
    font-weight: 500;
    margin-left: 4px;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #3a5d7a;
    }
  }
`;

export default function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);

    try {
      const { user, error } = await signUp(data.email, data.password, data.displayName);

      if (error) {
        setError('root', { message: error });
        showToast.error('註冊失敗');
      } else if (user) {
        showToast.success('註冊成功');
        onSuccess?.();
      }
    } catch {
      const errorMessage = '註冊時發生未知錯誤';
      setError('root', { message: errorMessage });
      showToast.error('註冊失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormHeader>
        <Title>建立帳號</Title>
      </FormHeader>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* 顯示名稱 */}
        <FormField>
          <Label htmlFor="displayName">顯示名稱</Label>
          <Input
            id="displayName"
            type="text"
            autoComplete="name"
            placeholder="請輸入您的顯示名稱"
            {...register('displayName')}
          />
          {errors.displayName && <ErrorMessage>{errors.displayName.message}</ErrorMessage>}
        </FormField>

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

        {/* 密碼 */}
        <FormField>
          <Label htmlFor="password">密碼</Label>
          <InputWrapper>
            <PasswordInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="請輸入密碼（至少6個字元）"
              {...register('password')}
            />
            <PasswordToggle type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </PasswordToggle>
          </InputWrapper>
          {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
        </FormField>

        {/* 確認密碼 */}
        <FormField>
          <Label htmlFor="confirmPassword">確認密碼</Label>
          <InputWrapper>
            <PasswordInput
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="請再次輸入密碼"
              {...register('confirmPassword')}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </PasswordToggle>
          </InputWrapper>
          {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
        </FormField>

        {/* 錯誤訊息 */}
        {errors.root && (
          <ErrorBox>
            <p>{errors.root.message}</p>
          </ErrorBox>
        )}

        {/* 註冊按鈕 */}
        <SubmitButton type="submit" loading={isLoading} disabled={isLoading}>
          {isLoading ? (
            <LoadingContent>
              <Spinner />
              <span>註冊中...</span>
            </LoadingContent>
          ) : (
            '建立帳號'
          )}
        </SubmitButton>

        {/* 其他操作 */}
        {onSwitchToSignIn && (
          <ActionsContainer>
            <TextWithLink>
              已經有帳號了？
              <button type="button" onClick={onSwitchToSignIn}>
                立即登入
              </button>
            </TextWithLink>
          </ActionsContainer>
        )}
      </Form>
    </FormContainer>
  );
}
