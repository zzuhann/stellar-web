import CardHeader from './CardHeader';
import { actionButton, actionButtons, actionButtonsContainer, contentCard } from './styles';
import EmptyState from './EmptyState';
import { css } from '@/styled-system/css';
import { useRouter } from 'next/navigation';
import VerticalEventCard from '@/components/EventCard/VerticalEventCard';
import { UseMutationResult } from '@tanstack/react-query';
import { EyeIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import SubmissionsPagination from './SubmissionsPagination';
import type {
  CoffeeEvent,
  UserSubmissionResourceSummary,
  UserSubmissionsPagination,
} from '@/types';

const ctaButton = css({
  paddingY: '3',
  paddingX: '6',
  borderRadius: 'radius.lg',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  background: 'color.primary',
  borderColor: 'color.primary',
  color: 'white',
  maxWidth: '60%',
  margin: '0 auto',
  '&:hover': {
    background: 'stellarBlue.600',
    borderColor: 'stellarBlue.600',
  },
});

const eventGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '4',
  padding: '4',
});

type EventSubmissionsProps = {
  events: CoffeeEvent[];
  summary: UserSubmissionResourceSummary;
  pagination: UserSubmissionsPagination;
  currentPage: number;
  onPageChange: (page: number) => void;
  deleteEventMutation: UseMutationResult<void, Error, string>;
  setPreviewingEvent: (event: CoffeeEvent | null) => void;
  setDeleteConfirmModal: (modal: { isOpen: boolean; event: CoffeeEvent | null }) => void;
};

const EventSubmissions = ({
  events,
  summary,
  pagination,
  currentPage,
  onPageChange,
  deleteEventMutation,
  setPreviewingEvent,
  setDeleteConfirmModal,
}: EventSubmissionsProps) => {
  const router = useRouter();

  const hasAnySubmission = summary.total > 0;

  const handlePreviewEvent = (e: React.MouseEvent, event: CoffeeEvent) => {
    e.stopPropagation();
    setPreviewingEvent(event);
  };

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
          hasAnySubmission ? `共投稿過 ${summary.total} 個生日應援` : '還沒有投稿過生日應援'
        }
      />

      {!hasAnySubmission ? (
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
        <>
          <div className={eventGrid}>
            {events.map((event) => (
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

          <SubmissionsPagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default EventSubmissions;
