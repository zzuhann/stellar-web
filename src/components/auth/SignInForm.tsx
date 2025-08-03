'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';
import { signInSchema, SignInFormData } from '@/lib/validations';
import { signIn, signInWithGoogle } from '@/lib/auth';
import showToast from '@/lib/toast';

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onSwitchToReset?: () => void;
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border-light);
  }

  span {
    padding: 0 16px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }
`;

const GoogleButton = styled.button<{ loading?: boolean }>`
  width: 100%;
  padding: 14px 24px;
  border-radius: var(--radius-lg);
  background: white;
  border: 1px solid var(--color-border-light);
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: ${(props) => (props.loading ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.loading ? 0.7 : 1)};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  &:hover:not(:disabled) {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-medium);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:disabled {
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
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

export default function SignInForm({
  onSuccess,
  onSwitchToSignUp,
  onSwitchToReset,
}: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);

    try {
      const { user, error } = await signIn(data.email, data.password);

      if (error) {
        setError('root', { message: error });
        showToast.error('登入失敗');
      } else if (user) {
        showToast.success('登入成功');
        onSuccess?.();
      }
    } catch {
      const errorMessage = '登入時發生未知錯誤';
      setError('root', { message: errorMessage });
      showToast.error('登入失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      const { user, error } = await signInWithGoogle();

      if (error) {
        showToast.error('Google 登入失敗');
      } else if (user) {
        showToast.success('登入成功');
        onSuccess?.();
      }
    } catch {
      showToast.error('Google 登入失敗');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormHeader>
        <Title>登入帳號</Title>
        <Subtitle>歡迎回來！請登入您的帳號</Subtitle>
      </FormHeader>

      {/* Google 登入按鈕 */}
      <GoogleButton
        type="button"
        onClick={handleGoogleSignIn}
        loading={isGoogleLoading}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <LoadingContent>
            <Spinner />
            <span>登入中...</span>
          </LoadingContent>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            使用 Google 登入
          </>
        )}
      </GoogleButton>

      <Divider>
        <span>或</span>
      </Divider>

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

        {/* 密碼 */}
        <FormField>
          <Label htmlFor="password">密碼</Label>
          <InputWrapper>
            <PasswordInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="請輸入您的密碼"
              {...register('password')}
            />
            <PasswordToggle type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </PasswordToggle>
          </InputWrapper>
          {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
        </FormField>

        {/* 錯誤訊息 */}
        {errors.root && (
          <ErrorBox>
            <p>{errors.root.message}</p>
          </ErrorBox>
        )}

        {/* 登入按鈕 */}
        <SubmitButton type="submit" loading={isLoading} disabled={isLoading}>
          {isLoading ? (
            <LoadingContent>
              <Spinner />
              <span>登入中...</span>
            </LoadingContent>
          ) : (
            '登入'
          )}
        </SubmitButton>

        {/* 其他操作 */}
        <ActionsContainer>
          {onSwitchToReset && (
            <LinkButton type="button" onClick={onSwitchToReset}>
              忘記密碼？
            </LinkButton>
          )}

          {onSwitchToSignUp && (
            <TextWithLink>
              還沒有帳號？
              <button type="button" onClick={onSwitchToSignUp}>
                立即註冊
              </button>
            </TextWithLink>
          )}
        </ActionsContainer>
      </Form>
    </FormContainer>
  );
}
