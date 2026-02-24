import { css, cva } from '@/styled-system/css';

const stepIndicator = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '32px',
  gap: '16px',
});

const step = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    '& .step-number': {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
    },
    '& .step-title': {
      fontSize: '14px',
      fontWeight: '500',
    },
  },
  variants: {
    active: {
      true: {
        '& .step-title': {
          color: 'color.text.primary',
        },
      },
      false: {
        '& .step-title': {
          color: 'color.text.secondary',
        },
      },
    },
    completed: {
      true: {
        '& .step-title': {
          color: 'color.text.primary',
        },
      },
    },
  },
  compoundVariants: [
    {
      active: true,
      completed: false,
      css: {
        '& .step-number': {
          background: 'color.primary',
          color: 'white',
        },
      },
    },
    {
      active: false,
      completed: false,
      css: {
        '& .step-number': {
          background: 'color.background.secondary',
          color: 'color.text.secondary',
          border: '1px solid',
          borderColor: 'color.border.light',
        },
      },
    },
    {
      completed: true,
      css: {
        '& .step-number': {
          background: 'color.primary',
          color: 'white',
        },
      },
    },
  ],
});

const stepConnector = cva({
  base: {
    width: '40px',
    height: '2px',
    transition: 'all 0.2s ease',
  },
  variants: {
    completed: {
      true: {
        background: 'color.primary',
      },
      false: {
        background: 'color.border.light',
      },
    },
  },
});

type StepIndicatorProps = {
  currentStep: number;
};

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <nav aria-label="投稿步驟">
      <ol className={stepIndicator} role="list">
        <li
          className={step({ active: currentStep === 1, completed: currentStep > 1 })}
          aria-current={currentStep === 1 ? 'step' : undefined}
        >
          <div className="step-number" aria-hidden="true">
            1
          </div>
          <div className="step-title">
            <span className="sr-only">步驟 1：</span>
            選擇偶像
            {currentStep > 1 && <span className="sr-only">（已完成）</span>}
          </div>
        </li>
        <li className={stepConnector({ completed: currentStep > 1 })} aria-hidden="true" />
        <li
          className={step({ active: currentStep === 2, completed: false })}
          aria-current={currentStep === 2 ? 'step' : undefined}
        >
          <div className="step-number" aria-hidden="true">
            2
          </div>
          <div className="step-title">
            <span className="sr-only">步驟 2：</span>
            應援資訊
          </div>
        </li>
      </ol>
    </nav>
  );
};

export default StepIndicator;
