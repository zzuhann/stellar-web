'use client';

import { Switch as HeadlessSwitch } from '@headlessui/react';
import { css } from '@/styled-system/css';

// 點擊熱區維持 44x44 最小觸控尺寸，內層 track 才是視覺上的開關樣式
const hitArea = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '44px',
  minHeight: '44px',
  padding: '0',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  flexShrink: 0,
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
});

const track = css({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  width: '44px',
  height: '24px',
  borderRadius: '9999px',
  background: 'color.border.light',
  transition: 'background-color 0.2s ease',
  '&[data-checked]': {
    background: 'color.primary',
  },
});

const thumb = css({
  position: 'absolute',
  top: '2px',
  left: '2px',
  width: '20px',
  height: '20px',
  borderRadius: '9999px',
  background: 'white',
  boxShadow: 'shadow.sm',
  transition: 'transform 0.2s ease',
  '&[data-checked]': {
    transform: 'translateX(20px)',
  },
});

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const Switch = ({ checked, onChange, label, disabled }: SwitchProps) => {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={label}
      className={hitArea}
    >
      {({ checked: isChecked }) => (
        <span className={track} data-checked={isChecked ? '' : undefined}>
          <span className={thumb} data-checked={isChecked ? '' : undefined} />
        </span>
      )}
    </HeadlessSwitch>
  );
};

export default Switch;
