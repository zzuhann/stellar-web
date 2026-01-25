import { CoffeeEvent } from '@/types';
import CardHeader from './CardHeader';
import { actionButton, actionButtons, actionButtonsContainer, contentCard } from './styles';
import EmptyState from './EmptyState';
import { css } from '@/styled-system/css';
import { useRouter } from 'next/navigation';
import VerticalEventCard from '@/components/EventCard/VerticalEventCard';
import { UseMutationResult } from '@tanstack/react-query';
import { EyeIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';

const ctaButton = css({
  padding: '12px 24px',
  borderRadius: 'radius.lg',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  background: 'color.primary',
  borderColor: 'color.primary',
  color: 'white',
  maxWidth: '60%',
  margin: '0 auto',
  '&:hover': {
    background: '#3a5d7a',
    borderColor: '#3a5d7a',
  },
});

const eventGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '16px',
  padding: '16px',
});

type EventSubmissionsProps = {
  events: CoffeeEvent[];
  deleteEventMutation: UseMutationResult<void, Error, string>;
  setPreviewingEvent: (event: CoffeeEvent | null) => void;
  setDeleteConfirmModal: (modal: { isOpen: boolean; event: CoffeeEvent | null }) => void;
};

const EventSubmissions = ({
  events,
  deleteEventMutation,
  setPreviewingEvent,
  setDeleteConfirmModal,
}: EventSubmissionsProps) => {
  const router = useRouter();

  const isSubmitted = events.length > 0;

  const userEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort((a, b) => {
      // rejected 狀態排在最上面，其他保持原順序
      if (a.status === 'rejected' && b.status !== 'rejected') return -1;
      if (a.status !== 'rejected' && b.status === 'rejected') return 1;
      return 0;
    });
  }, [events]);

  // 處理預覽活動
  const handlePreviewEvent = (e: React.MouseEvent, event: CoffeeEvent) => {
    e.stopPropagation();
    setPreviewingEvent(event);
  };

  // 處理刪除活動
  const handleDeleteEvent = (e: React.MouseEvent, event: CoffeeEvent) => {
    e.stopPropagation();
    setDeleteConfirmModal({ isOpen: true, event });
  };

  const handleEditEvent = (e: React.MouseEvent, event: CoffeeEvent) => {
    e.stopPropagation();
    router.push(`/submit-event?edit=${event.id}`);
  };

  const handleCopyEvent = (e: React.MouseEvent, event: CoffeeEvent) => {
    e.stopPropagation();
    router.push(`/submit-event?copy=${event.id}`);
  };

  return (
    <div className={contentCard}>
      <CardHeader
        title="我投稿的生日應援"
        description={
          isSubmitted ? `共投稿過 ${userEvents.length} 個生日應援` : '還沒有投稿過生日應援'
        }
      />

      {!isSubmitted ? (
        <EmptyState
          icon="🍰"
          title="還沒有舉辦過生日應援"
          description="如果你是主辦，可以點擊投稿生日應援 ✨"
          cta={
            <button className={ctaButton} onClick={() => router.push('/submit-event')}>
              前往投稿
            </button>
          }
        />
      ) : (
        <div className={eventGrid}>
          {userEvents.map((event) => (
            <VerticalEventCard
              key={event.id}
              event={event}
              actionButtons={
                <div className={actionButtonsContainer}>
                  <div className={actionButtons}>
                    <button
                      className={actionButton({ variant: 'edit' })}
                      onClick={(e) => handlePreviewEvent(e, event)}
                      title="預覽"
                    >
                      <EyeIcon width={12} height={12} />
                      預覽
                    </button>
                    <button
                      className={actionButton({ variant: 'edit' })}
                      onClick={(e) => handleEditEvent(e, event)}
                      title="編輯"
                    >
                      <PencilIcon width={12} height={12} />
                      編輯
                    </button>
                  </div>
                  <div className={actionButtons}>
                    <button
                      className={actionButton({ variant: 'edit' })}
                      onClick={(e) => handleCopyEvent(e, event)}
                      title="複製"
                    >
                      <DocumentDuplicateIcon width={12} height={12} />
                      複製
                    </button>
                    <button
                      className={actionButton()}
                      onClick={(e) => handleDeleteEvent(e, event)}
                      disabled={deleteEventMutation.isPending}
                      title="刪除"
                    >
                      <TrashIcon width={12} height={12} />
                      {deleteEventMutation.isPending ? '刪除中...' : '刪除'}
                    </button>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventSubmissions;
