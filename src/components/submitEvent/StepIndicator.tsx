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
    <div className={stepIndicator}>
      <div className={step({ active: currentStep === 1, completed: currentStep > 1 })}>
        <div className="step-number">1</div>
        <div className="step-title">選擇偶像</div>
      </div>
      <div className={stepConnector({ completed: currentStep > 1 })} />
      <div className={step({ active: currentStep === 2, completed: false })}>
        <div className="step-number">2</div>
        <div className="step-title">應援資訊</div>
      </div>
    </div>
  );
};

export default StepIndicator;
