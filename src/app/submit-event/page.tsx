import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';

const SubmitEventClient = dynamic(() => import('./SubmitEventClient'), {
  ssr: false,
});

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-bg-primary);
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

function SubmitEventFallback() {
  return (
    <LoadingContainer>
      <LoadingContent>
        <LoadingSpinner />
        <LoadingText>載入中...</LoadingText>
      </LoadingContent>
    </LoadingContainer>
  );
}

export default function SubmitEventPage() {
  return (
    <PageContainer>
      <Suspense fallback={<SubmitEventFallback />}>
        <SubmitEventClient />
      </Suspense>
    </PageContainer>
  );
}
