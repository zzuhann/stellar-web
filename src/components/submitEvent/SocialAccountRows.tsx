import { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { formGroup, label as labelStyle, input } from './styles';
import { splitSocialAccounts, joinSocialAccounts } from './socialAccounts';

const rowsList = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const row = css({
  display: 'flex',
  gap: '2',
  alignItems: 'center',
});

const removeRowButton = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  flexShrink: 0,
  border: 'none',
  background: 'transparent',
  color: 'color.text.secondary',
  cursor: 'pointer',
  borderRadius: 'radius.md',
  transition: 'color 0.2s ease, background 0.2s ease',
  '&:hover': {
    color: 'red.600',
    background: 'color.background.secondary',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

const addRowButton = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  minHeight: '44px',
  paddingX: '3',
  alignSelf: 'flex-start',
  border: 'none',
  background: 'transparent',
  color: 'color.primary',
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  cursor: 'pointer',
  borderRadius: 'radius.md',
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

type SocialAccountRowsProps = {
  fieldId: 'instagram' | 'threads';
  fieldLabel: string;
  placeholderExample: string;
  // RHF 欄位在這個元件掛載當下的值，只用來做「初次渲染」split，之後改由內部 state 管理，
  // 不會因為外部 prop 變動（例如自己 setValue 觸發的重新渲染）而重新 split 蓋掉使用者輸入
  initialValue: string;
  onChange: (joinedValue: string) => void;
  disabled?: boolean;
  describedBy?: string;
};

const SocialAccountRows = ({
  fieldId,
  fieldLabel,
  placeholderExample,
  initialValue,
  onChange,
  disabled,
  describedBy,
}: SocialAccountRowsProps) => {
  const [accounts, setAccounts] = useState<string[]>(() => splitSocialAccounts(initialValue));

  const updateAccounts = (nextAccounts: string[]) => {
    setAccounts(nextAccounts);
    onChange(joinSocialAccounts(nextAccounts));
  };

  const handleRowChange = (index: number, value: string) => {
    updateAccounts(accounts.map((account, i) => (i === index ? value : account)));
  };

  const handleAddRow = () => {
    updateAccounts([...accounts, '']);
  };

  const handleRemoveRow = (index: number) => {
    if (accounts.length <= 1) return;
    updateAccounts(accounts.filter((_, i) => i !== index));
  };

  return (
    <div className={formGroup}>
      <label className={labelStyle} htmlFor={`${fieldId}-0`}>
        {fieldLabel}
      </label>
      <div className={rowsList} role="group" aria-label={`${fieldLabel} 帳號列表`}>
        {accounts.map((account, index) => (
          <div className={row} key={index}>
            <input
              className={input}
              style={{ flex: 1, minWidth: 0 }}
              id={`${fieldId}-${index}`}
              type="text"
              placeholder={placeholderExample}
              value={account}
              disabled={disabled}
              onChange={(e) => handleRowChange(index, e.target.value)}
              aria-label={accounts.length > 1 ? `${fieldLabel} 帳號 ${index + 1}` : undefined}
              aria-describedby={describedBy}
            />
            {accounts.length > 1 && (
              <button
                type="button"
                className={removeRowButton}
                aria-label={`移除 ${fieldLabel} 帳號 ${index + 1}`}
                onClick={() => handleRemoveRow(index)}
                disabled={disabled}
              >
                <XMarkIcon width={16} height={16} aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className={addRowButton}
        onClick={handleAddRow}
        aria-label={`新增共同主辦 - ${fieldLabel}`}
        disabled={disabled}
      >
        <PlusIcon width={16} height={16} aria-hidden="true" />
        新增共同主辦
      </button>
    </div>
  );
};

export default SocialAccountRows;
