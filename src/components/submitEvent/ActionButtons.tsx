import { EventSubmissionFormData } from '@/lib/validations';
import { css, cva } from '@/styled-system/css';
import { useRouter } from 'next/navigation';
import { UseFormHandleSubmit } from 'react-hook-form';

const buttonGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  paddingTop: '24px',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  '@media (min-width: 480px)': {
    flexDirection: 'row',
    gap: '16px',
  },
});

const button = cva({
  base: {
    padding: '14px 24px',
    borderRadius: 'radius.lg',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flex: '1',
    '@media (min-width: 768px)': {
      padding: '16px 28px',
      fontSize: '16px',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  },
  variants: {
    variant: {
      primary: {
        background: 'color.primary',
        borderColor: 'color.primary',
        color: 'white',
        '&:disabled': {
          background: 'color.text.disabled',
          borderColor: 'color.text.disabled',
        },
      },
      secondary: {
        background: 'color.background.primary',
        borderColor: 'color.border.light',
        color: 'color.text.primary',
      },
    },
  },
});

const loadingSpinner = css({
  width: '16px',
  height: '16px',
  border: '2px solid transparent',
  borderTop: '2px solid white',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
});

type ActionButtonsProps = {
  mode: 'create' | 'edit';
  currentStep: number;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  onCancel?: () => void;
  createEventPending: boolean;
  updateEventPending: boolean;
  resubmitEventPending: boolean;
  handleSubmit: UseFormHandleSubmit<EventSubmissionFormData>;
  onSubmit: (data: EventSubmissionFormData) => void;
  existingEventStatus: 'approved' | 'rejected' | 'pending';
};

const ActionButtons = ({
  mode,
  currentStep,
  handleNextStep,
  handlePrevStep,
  onCancel,
  createEventPending,
  updateEventPending,
  resubmitEventPending,
  handleSubmit,
  onSubmit,
  existingEventStatus,
}: ActionButtonsProps) => {
  const router = useRouter();

  return (
    <div className={buttonGroup}>
      {mode === 'create' && currentStep === 1 ? (
        // 第一步：下一步按鈕
        <>
          <button className={button({ variant: 'primary' })} type="button" onClick={handleNextStep}>
            下一步
          </button>
          <button
            className={button({ variant: 'secondary' })}
            type="button"
            onClick={onCancel || (() => router.push('/'))}
          >
            取消
          </button>
        </>
      ) : mode === 'create' && currentStep === 2 ? (
        // 第二步：上一步 + 提交按鈕
        <>
          <button
            className={button({ variant: 'secondary' })}
            type="button"
            onClick={handlePrevStep}
          >
            上一步
          </button>
          <button
            className={button({ variant: 'primary' })}
            type="button"
            disabled={createEventPending}
            onClick={handleSubmit(onSubmit)}
          >
            {createEventPending ? (
              <>
                <div className={loadingSpinner} />
                投稿中...
              </>
            ) : (
              '送出投稿'
            )}
          </button>
        </>
      ) : (
        // 編輯模式：原有的按鈕
        <>
          <button
            className={button({ variant: 'primary' })}
            type="button"
            disabled={updateEventPending || resubmitEventPending}
            onClick={handleSubmit(onSubmit)}
          >
            {updateEventPending ? (
              <>
                <div className={loadingSpinner} />
                更新中...
              </>
            ) : resubmitEventPending ? (
              <>
                <div className={loadingSpinner} />
                重新送出審核中...
              </>
            ) : existingEventStatus === 'rejected' ? (
              '重新送審'
            ) : (
              '更新'
            )}
          </button>
          <button
            className={button({ variant: 'secondary' })}
            type="button"
            onClick={onCancel || (() => router.push('/'))}
          >
            取消
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
