'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import EventSubmissionModal from '@/components/forms/EventSubmissionModal';
import styled from 'styled-components';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
`;

const Header = styled.header`
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;

  @media (min-width: 768px) {
    padding: 20px 32px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover {
    color: #333;
    background: #f8f9fa;
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (min-width: 768px) {
    font-size: 15px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: #dee2e6;
`;

const HeaderInfo = styled.div`
  h1 {
    font-size: 20px;
    font-weight: 700;
    color: #333;
    margin: 0 0 4px 0;

    @media (min-width: 768px) {
      font-size: 24px;
    }
  }

  p {
    font-size: 13px;
    color: #666;
    margin: 0;

    @media (min-width: 768px) {
      font-size: 14px;
    }
  }
`;

const MainContent = styled.main`
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;

  @media (min-width: 768px) {
    padding: 32px;
  }

  @media (min-width: 1024px) {
    padding: 40px 32px;
  }
`;

const ContentCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  padding: 32px;

  @media (min-width: 768px) {
    padding: 40px;
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    margin-bottom: 40px;
  }
`;

const IconContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-radius: 50%;
  margin-bottom: 16px;

  span {
    font-size: 28px;
  }

  @media (min-width: 768px) {
    width: 72px;
    height: 72px;

    span {
      font-size: 32px;
    }
  }
`;

const PageTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;

  @media (min-width: 768px) {
    font-size: 28px;
    margin: 0 0 12px 0;
  }
`;

const PageDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
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
  border: 3px solid #f3f4f6;
  border-top: 3px solid #007bff;
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
  color: #666;
  font-size: 14px;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 16px;
  }
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
      <Header>
        <HeaderContent>
          <BackButton onClick={() => router.push('/')}>
            <ArrowLeftIcon />
            返回地圖
          </BackButton>
          <Divider />
          <HeaderInfo>
            <h1>投稿活動</h1>
            <p>分享您發現的應援咖啡活動</p>
          </HeaderInfo>
        </HeaderContent>
      </Header>

      {/* Main Content */}
      <MainContent>
        <ContentCard>
          <PageHeader>
            <IconContainer>
              <span>☕</span>
            </IconContainer>
            <PageTitle>投稿應援咖啡活動</PageTitle>
            <PageDescription>
              幫助我們建立更完整的 K-pop 應援活動資料庫，讓更多粉絲可以找到並參與這些活動
            </PageDescription>
          </PageHeader>

          {/* Event Submission Form - 使用現有的模態框組件但不作為模態框 */}
          <FormContainer>
            <EventSubmissionModal isOpen={true} onClose={() => router.push('/')} embedded={true} />
          </FormContainer>
        </ContentCard>
      </MainContent>
    </PageContainer>
  );
}
