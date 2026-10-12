'use client';

import { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { PlaceReselectAddressChoice, VenuePlaceReselectPreview } from '@/types';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const content = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  paddingX: '5',
  paddingBottom: '3',
});

const note = css({ textStyle: 'caption', color: 'color.text.secondary', margin: 0 });

const sectionTitle = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  margin: 0,
});

const eventList = css({
  margin: 0,
  marginTop: '1',
  paddingLeft: '5',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  maxHeight: '200px',
  overflowY: 'auto',
});

const fieldset = css({
  border: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  minWidth: 0,
});

const legend = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  padding: 0,
  marginBottom: '2',
});

const radioRow = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '3',
  minHeight: '44px',
  paddingY: '2.5',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  cursor: 'pointer',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  '&:has(input:checked)': {
    borderColor: 'stellarBlue.600',
    background: 'stellarBlue.50',
    boxShadow: '0 0 0 1px var(--colors-stellar-blue-600)',
  },
  '&:has(input:focus-visible)': { outline: '2px solid', outlineColor: 'stellarBlue.600' },
});

const radioInput = css({ marginTop: '0.5', flexShrink: 0, width: '16px', height: '16px' });

const radioText = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5',
  overflowWrap: 'anywhere',
});

const radioLabelText = css({ fontWeight: 'semibold' });

const hintText = css({ textStyle: 'caption', color: 'red.700', margin: 0 });

const amberBox = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '2',
  paddingX: '3',
  paddingY: '2.5',
  borderRadius: 'radius.md',
  background: 'amber.50',
  border: '1px solid',
  borderColor: 'amber.500',
  color: 'amber.800',
  textStyle: 'caption',
  '& svg': { width: '16px', height: '16px', flexShrink: 0, marginTop: '0.5' },
});

const linkButton = css({
  alignSelf: 'flex-start',
  minHeight: '44px',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  background: 'white',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  cursor: 'pointer',
  '&:hover': { background: 'color.background.secondary' },
});

// ─── Interface ────────────────────────────────────────────────────────────────

export type VenueReselectDialogErrorKind = 'generic' | 'address-changed' | 'in-use';

interface VenueReselectDialogProps {
  open: boolean;
  venueName: string;
  newPlaceName: string;
  preview: VenuePlaceReselectPreview;
  formAddressDiffers: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  errorKind: VenueReselectDialogErrorKind | null;
  onConfirm: (addressChoice: PlaceReselectAddressChoice | undefined) => void;
  onClose: () => void;
  onRepreview: () => void;
  onBackToSearch: () => void;
}

export const ADDRESS_TYPE_REMINDER =
  '這是地址不是店家：活動要選到完全相同的地址（包含樓層寫法）才會自動連上';

const REQUIRED_HINT_ID = 'venue-reselect-choice-hint';

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenueReselectDialog({
  open,
  venueName,
  newPlaceName,
  preview,
  formAddressDiffers,
  isLoading,
  errorMessage,
  errorKind,
  onConfirm,
  onClose,
  onRepreview,
  onBackToSearch,
}: VenueReselectDialogProps) {
  const [choice, setChoice] = useState<PlaceReselectAddressChoice | undefined>();

  const { unchanged, linkableEvents, linkableEventCount, address, google } = preview;
  const addressEmpty = !address.current.trim();
  // Backend keeps the current address when Google returns none, so no choice is offered
  const googleAddressEmpty = !address.google.trim() && !google.formattedAddress.trim();
  const choiceRequired = address.choiceRequired && !googleAddressEmpty;
  const needsRepreview = errorKind === 'address-changed';
  const missingChoice = choiceRequired && !choice && !needsRepreview;

  const summary = unchanged
    ? `地點與目前相同，將以 Google 資料更新座標${
        linkableEventCount > 0 ? `，並補連 ${linkableEventCount} 場活動` : ''
      }；placeId 不變。`
    : `「${venueName}」的地點將改為「${newPlaceName}」。座標與 placeId 會一併更新；地區、最近捷運站等其他欄位不會變動。`;

  const confirmLabel = isLoading ? '套用中…' : needsRepreview ? '關閉並重新預覽' : '確認套用';

  function handleConfirm() {
    if (needsRepreview) {
      onRepreview();
      return;
    }
    onConfirm(choiceRequired ? choice : undefined);
  }

  return (
    <ConfirmDialog
      open={open}
      title={unchanged ? '確認更新座標並補連活動？' : '確認套用新地點？'}
      description={summary}
      confirmLabel={confirmLabel}
      confirmVariant="primary"
      onConfirm={handleConfirm}
      onClose={onClose}
      isLoading={isLoading}
      error={errorMessage}
      confirmDisabled={errorKind === 'in-use' || missingChoice}
      confirmDescribedBy={missingChoice ? REQUIRED_HINT_ID : undefined}
      autoFocusCancel
    >
      <div className={content}>
        {googleAddressEmpty && (
          <p className={note}>
            {addressEmpty ? '地址維持空白' : 'Google 沒有提供地址，將保留目前地址'}
          </p>
        )}
        {addressEmpty && !googleAddressEmpty && !choiceRequired && (
          <p className={note}>地址原為空，將使用 Google 地址：{google.formattedAddress}</p>
        )}
        {formAddressDiffers && <p className={note}>表單中未儲存的地址修改會被覆蓋</p>}

        <section>
          <h3 className={sectionTitle}>活動連結</h3>
          {linkableEventCount > 0 ? (
            <>
              <p className={note}>將新連上 {linkableEventCount} 場活動</p>
              <ul className={eventList}>
                {linkableEvents.map((event) => (
                  <li key={event.id}>{event.title}</li>
                ))}
              </ul>
              {linkableEventCount > linkableEvents.length && (
                <p className={note}>
                  僅顯示前 {linkableEvents.length} 筆，共 {linkableEventCount} 場
                </p>
              )}
            </>
          ) : (
            <p className={note}>
              沒有可新連上的活動。仍可套用，之後符合的活動審核通過時會自動連上。
            </p>
          )}
          <p className={note}>已連到其他場地的活動不會被改動；原本已連到此場地的活動會保留。</p>
        </section>

        {choiceRequired && (
          <fieldset className={fieldset}>
            <legend className={legend}>要保留哪一個地址？（必選）</legend>
            <label className={radioRow}>
              <input
                type="radio"
                name="venue-reselect-address-choice"
                className={radioInput}
                required
                checked={choice === 'existing'}
                onChange={() => setChoice('existing')}
                disabled={isLoading}
              />
              <span className={radioText}>
                <span className={radioLabelText}>店家填的</span>
                <span>{address.current}</span>
              </span>
            </label>
            <label className={radioRow}>
              <input
                type="radio"
                name="venue-reselect-address-choice"
                className={radioInput}
                required
                checked={choice === 'google'}
                onChange={() => setChoice('google')}
                disabled={isLoading}
              />
              <span className={radioText}>
                <span className={radioLabelText}>Google 的</span>
                <span>{address.google}</span>
              </span>
            </label>
            {missingChoice && (
              <p id={REQUIRED_HINT_ID} className={hintText}>
                請先選擇要保留的地址
              </p>
            )}
          </fieldset>
        )}

        {google.isAddressType && (
          <div className={amberBox}>
            <ExclamationTriangleIcon aria-hidden="true" />
            <span>{ADDRESS_TYPE_REMINDER}</span>
          </div>
        )}

        {errorKind === 'in-use' && (
          <button type="button" className={linkButton} onClick={onBackToSearch}>
            回到搜尋
          </button>
        )}
      </div>
    </ConfirmDialog>
  );
}
