'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styled from 'styled-components';
import Header from '@/components/layout/Header';
import EventSubmissionForm from '@/components/forms/EventSubmissionForm';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-bg-primary);
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 16px 40px;

  @media (min-width: 768px) {
    padding: 100px 24px 60px;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingContent = styled.div`
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border-light);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 0;
`;

export default function SubmitEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <LoadingSpinner />
          <LoadingText>載入中...</LoadingText>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageContainer>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <MainContent>
        <EventSubmissionForm />
      </MainContent>
    </PageContainer>
  );
}
