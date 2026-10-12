'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import PlaceAutocomplete from '@/components/forms/PlaceAutocomplete';
import { placesApi } from '@/lib/api';
import { isMissingVenueCoords } from '@/utils/geo';
import type { PlaceReselectAddressChoice } from '@/types';
import VenueReselectDialog, {
  ADDRESS_TYPE_REMINDER,
  type VenueReselectDialogErrorKind,
} from './VenueReselectDialog';
import { usePlaceReselectPreviewMutation } from './hooks/usePlaceReselectPreviewMutation';
import { usePlaceReselectApplyMutation } from './hooks/usePlaceReselectApplyMutation';
import {
  getPlaceKind,
  parsePlaceReselectError,
  type ParsedReselectError,
} from './venuePlaceReselectHelpers';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const sectionBox = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  '&[data-warn="true"]': {
    padding: '3',
    background: 'amber.50',
    borderLeft: '2px solid',
    borderLeftColor: 'amber.500',
    borderRadius: 'radius.md',
  },
});

const sectionTitle = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  margin: 0,
});

const infoList = css({ display: 'flex', flexDirection: 'column', gap: '2', margin: 0 });
const infoRow = css({ display: 'flex', flexDirection: 'column', gap: '0.5' });
const infoLabel = css({ textStyle: 'caption', color: 'color.text.secondary' });
const infoValue = css({
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  margin: 0,
  overflowWrap: 'anywhere',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '2',
});
const coordText = css({ fontVariantNumeric: 'tabular-nums' });
const placeIdCode = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  overflowWrap: 'anywhere',
});
const noteText = css({ textStyle: 'caption', color: 'color.text.secondary', margin: 0 });

const badge = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  paddingX: '2',
  paddingY: '0.5',
  borderRadius: 'radius.sm',
  textStyle: 'caption',
  fontWeight: 'semibold',
  whiteSpace: 'nowrap',
  background: 'gray.100',
  color: 'gray.700',
  '&[data-tone="warn"]': { background: 'amber.50', color: 'amber.800' },
  '& svg': { width: '12px', height: '12px' },
});

const outlineBtn = css({
  alignSelf: 'flex-start',
  minHeight: '44px',
  minWidth: '44px',
  paddingX: '4',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  '&:hover': { background: 'color.background.secondary' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'stellarBlue.600',
    outlineOffset: '2px',
  },
});

const ghostBtn = css({
  minHeight: '44px',
  minWidth: '44px',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: 'none',
  background: 'transparent',
  color: 'color.text.secondary',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  '&:hover': { background: 'color.background.secondary', color: 'color.text.primary' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'stellarBlue.600' },
});

const primaryBtn = css({
  minHeight: '44px',
  paddingX: '4',
  borderRadius: 'radius.md',
  border: 'none',
  background: 'stellarBlue.600',
  color: 'white',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  '&:hover': { background: 'stellarBlue.700' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'stellarBlue.600',
    outlineOffset: '2px',
  },
});

const retryBtn = css({
  alignSelf: 'flex-start',
  minHeight: '44px',
  paddingX: '4',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'red.200',
  background: 'white',
  color: 'red.700',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  '&:focus-visible': { outline: '2px solid', outlineColor: 'red.700' },
});

const reselectPanel = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const searchLabel = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  display: 'flex',
  flexDirection: 'column',
});
const searchLabelSub = css({
  textStyle: 'caption',
  fontWeight: 'normal',
  color: 'color.text.secondary',
});

const statusRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const spinner = css({
  width: '14px',
  height: '14px',
  border: '2px solid',
  borderColor: 'gray.300',
  borderTopColor: 'stellarBlue.600',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
  flexShrink: 0,
});

const errorBox = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  padding: '3',
  borderRadius: 'radius.md',
  background: 'red.50',
  border: '1px solid',
  borderColor: 'red.200',
  color: 'red.700',
  textStyle: 'bodySmall',
  '& a': { color: 'red.700', textDecoration: 'underline', fontWeight: 'semibold' },
});
const errorMessageRow = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '2',
  '& svg': { width: '16px', height: '16px', flexShrink: 0, marginTop: '0.5' },
});

const previewCard = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  padding: '3',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
});
const previewName = css({ textStyle: 'bodySmall', fontWeight: 'semibold', margin: 0 });
const amberBox = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '2',
  padding: '2.5',
  borderRadius: 'radius.md',
  background: 'amber.50',
  border: '1px solid',
  borderColor: 'amber.500',
  color: 'amber.800',
  textStyle: 'caption',
  '& svg': { width: '16px', height: '16px', flexShrink: 0, marginTop: '0.5' },
});
const actionRow = css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2' });

const bannerWrap = css({ '&:empty': { display: 'none' } });
const banner = css({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '2',
  paddingY: '2',
  paddingLeft: '3',
  borderRadius: 'radius.md',
  background: 'green.50',
  border: '1px solid',
  borderColor: 'green.500',
  color: 'green.700',
  textStyle: 'bodySmall',
});
const bannerClose = css({
  flexShrink: 0,
  width: '44px',
  height: '44px',
  marginY: '-2',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  '&:focus-visible': { outline: '2px solid', outlineColor: 'green.700' },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GENERIC_APPLY_ERROR = '套用失敗，沒有任何資料被修改，請稍後重試。';

function tooManyMessage(count: number | undefined) {
  return `符合條件的活動共 ${count ?? '過多'} 場，超過單次上限 400 場，無法套用。請聯繫工程師處理。`;
}

interface PreviewErrorView {
  message: string;
  canRetry: boolean;
  inUseVenue?: { id: string; name: string };
}

function describePreviewError(error: ParsedReselectError): PreviewErrorView {
  if (error.status === 409 && error.code === 'PLACE_ID_IN_USE') {
    const venue = (error.details as { venue?: { id: string; name: string } } | undefined)?.venue;
    return {
      message: `這個地點已被『${venue?.name ?? '其他場地'}』使用，無法套用。`,
      canRetry: false,
      inUseVenue: venue,
    };
  }
  if (error.status === 422 && error.code === 'TOO_MANY_LINKABLE_EVENTS') {
    const count = (error.details as { linkableEventCount?: number } | undefined)
      ?.linkableEventCount;
    return {
      message: tooManyMessage(count),
      canRetry: false,
    };
  }
  if (
    error.status === 422 &&
    (error.code === 'PLACE_LOOKUP_FAILED' || error.code === 'PLACE_NO_COORDINATES')
  ) {
    return { message: '無法取得這個地點的座標，請重新搜尋或選擇其他地點。', canRetry: true };
  }
  if (error.status === 429) return { message: '操作太頻繁，請稍候幾秒再試。', canRetry: true };
  if (error.status === 503) {
    return { message: '服務暫時無法使用，請稍後再試。', canRetry: true };
  }
  return { message: '檢查失敗，請稍後再試。', canRetry: true };
}

function describeApplyError(error: ParsedReselectError): {
  message: string;
  kind: VenueReselectDialogErrorKind;
} {
  if (error.status === 409 && error.code === 'PLACE_ID_IN_USE') {
    return { message: '這個地點剛剛被其他場地使用，請重新搜尋', kind: 'in-use' };
  }
  if (error.status === 400 && error.code === 'ADDRESS_CHOICE_REQUIRED') {
    return {
      message: `${GENERIC_APPLY_ERROR}場地地址在你預覽後有變動，請重新預覽後再套用。`,
      kind: 'address-changed',
    };
  }
  if (error.status === 422 && error.code === 'TOO_MANY_LINKABLE_EVENTS') {
    const count = (error.details as { linkableEventCount?: number } | undefined)
      ?.linkableEventCount;
    return {
      message: tooManyMessage(count),
      kind: 'generic',
    };
  }
  if (error.status === 429) {
    return {
      message: '操作太頻繁，沒有任何資料被修改，請稍候幾秒再試。',
      kind: 'generic',
    };
  }
  if (error.status === 503) {
    return {
      message: '服務暫時無法使用，沒有任何資料被修改，請稍後重試。',
      kind: 'generic',
    };
  }
  return { message: GENERIC_APPLY_ERROR, kind: 'generic' };
}

// ─── Interface ────────────────────────────────────────────────────────────────

interface VenueReselectPlaceProps {
  venueId: string;
  venueName: string;
  place: {
    placeId: string;
    address: string;
    lat?: number | null;
    lng?: number | null;
  };
  // Current value of the form's address input; used to warn that unsaved edits get overwritten
  formAddress: string;
  onAddressSync: (address: string) => void;
  placeApi?: typeof placesApi;
}

interface SelectedPlace {
  placeId: string;
  name: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenueReselectPlace({
  venueId,
  venueName,
  place,
  formAddress,
  onAddressSync,
  placeApi,
}: VenueReselectPlaceProps) {
  const panelId = useId();

  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<SelectedPlace | null>(null);
  const [searchKey, setSearchKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applyError, setApplyError] = useState<{
    message: string;
    kind: VenueReselectDialogErrorKind;
  } | null>(null);
  const [successBanner, setBanner] = useState<{ linkedCount: number; previewCount: number } | null>(
    null
  );

  const [detailsErrorPlaceId, setDetailsErrorPlaceId] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  // Bumped on every new pick, typing, cancel and collapse; a details response only counts
  // while its token is still the latest. Comparing placeId alone can't tell re-picks apart.
  const requestTokenRef = useRef(0);
  // Set when the latest details call succeeded; PlaceAutocomplete calls onPlaceSelect right
  // after, and we only accept that call if it matches (stale/cancelled picks never get here)
  const acceptedPickRef = useRef<{ token: number; placeId: string } | null>(null);

  const previewMutation = usePlaceReselectPreviewMutation(venueId);
  const applyMutation = usePlaceReselectApplyMutation(venueId);

  const preview = previewMutation.data;
  const previewError = previewMutation.isError
    ? describePreviewError(parsePlaceReselectError(previewMutation.error))
    : null;

  const { kind, prefix } = getPlaceKind(place.placeId);
  const coordsMissing = isMissingVenueCoords(place.lat, place.lng);
  const hasProblem = kind === 'address' || kind === 'unset' || coordsMissing;

  // A new pick or any typing makes the previous preview stale, so it must not stay applicable
  function invalidateSelection() {
    setSelected(null);
    setDialogOpen(false);
    setApplyError(null);
    setDetailsErrorPlaceId(null);
    previewMutation.reset();
  }

  function cancelPendingRequests() {
    requestTokenRef.current += 1;
    acceptedPickRef.current = null;
  }

  const baseApi = placeApi ?? placesApi;
  // PlaceAutocomplete only calls onPlaceSelect when details succeed, so observe its api instead
  const trackedApi: typeof placesApi = {
    ...baseApi,
    getDetails: async (placeId: string) => {
      cancelPendingRequests();
      const token = requestTokenRef.current;
      invalidateSelection();
      try {
        const details = await baseApi.getDetails(placeId);
        if (token !== requestTokenRef.current) return details;
        const loc = details.geometry?.location;
        if (!loc?.lat || !loc?.lng) setDetailsErrorPlaceId(placeId);
        else acceptedPickRef.current = { token, placeId };
        return details;
      } catch (err) {
        if (token === requestTokenRef.current) setDetailsErrorPlaceId(placeId);
        throw err;
      }
    },
  };

  function handleSearchInput() {
    cancelPendingRequests();
    invalidateSelection();
  }

  async function handleRetryDetails() {
    const placeId = detailsErrorPlaceId;
    if (!placeId) return;
    try {
      const details = await trackedApi.getDetails(placeId);
      handlePlaceSelect({ place_id: placeId, name: details.name });
    } catch {
      // trackedApi already surfaced the error
    }
  }

  function clearSelection() {
    cancelPendingRequests();
    setSelected(null);
    setDialogOpen(false);
    setApplyError(null);
    previewMutation.reset();
    applyMutation.reset();
    setSearchKey((k) => k + 1);
    setDetailsErrorPlaceId(null);
  }

  function handleToggle() {
    if (expanded) {
      clearSelection();
      setExpanded(false);
    } else {
      setBanner(null);
      setExpanded(true);
    }
  }

  function handlePlaceSelect(picked: { place_id: string; name: string }) {
    const accepted = acceptedPickRef.current;
    if (
      !accepted ||
      accepted.token !== requestTokenRef.current ||
      accepted.placeId !== picked.place_id
    ) {
      return;
    }
    acceptedPickRef.current = null;
    setSelected({ placeId: picked.place_id, name: picked.name });
    previewMutation.mutate(picked.place_id);
  }

  function handleRetryPreview() {
    if (selected) previewMutation.mutate(selected.placeId);
  }

  function closeDialog() {
    setDialogOpen(false);
    setApplyError(null);
    applyMutation.reset();
  }

  function handleRepreview() {
    closeDialog();
    handleRetryPreview();
  }

  function handleBackToSearch() {
    clearSelection();
  }

  function handleConfirm(addressChoice: PlaceReselectAddressChoice | undefined) {
    if (!selected || !preview) return;
    setApplyError(null);
    const previewCount = preview.linkableEventCount;
    applyMutation.mutate(
      { placeId: selected.placeId, ...(addressChoice ? { addressChoice } : {}) },
      {
        onSuccess: (result) => {
          setDialogOpen(false);
          onAddressSync(result.address);
          setBanner({ linkedCount: result.linkedCount, previewCount });
          clearSelection();
          setExpanded(false);
        },
        onError: (err) => setApplyError(describeApplyError(parsePlaceReselectError(err))),
      }
    );
  }

  useEffect(() => {
    if (expanded) panelRef.current?.querySelector('input')?.focus();
  }, [expanded]);

  const kindBadge =
    kind === 'store' ? (
      <span className={badge}>店家</span>
    ) : kind === 'address' ? (
      <span className={badge} data-tone="warn">
        <ExclamationTriangleIcon aria-hidden="true" />
        地址型
      </span>
    ) : kind === 'unset' ? (
      <span className={badge} data-tone="warn">
        <ExclamationTriangleIcon aria-hidden="true" />
        未設定
      </span>
    ) : (
      <span className={badge}>{`其他（${prefix}…）`}</span>
    );

  const unchangedCta = (preview?.linkableEventCount ?? 0) > 0 ? '更新座標並補連' : '更新座標';

  return (
    <section className={sectionBox} data-warn={hasProblem ? 'true' : undefined}>
      <h2 className={sectionTitle}>地點</h2>

      <div className={bannerWrap} role="status">
        {successBanner && (
          <div className={banner}>
            <span>
              已更新地點。新連上 {successBanner.linkedCount} 場活動。
              {successBanner.linkedCount !== successBanner.previewCount &&
                `（預覽時為 ${successBanner.previewCount} 場，期間資料有變動）`}
            </span>
            <button
              type="button"
              className={bannerClose}
              aria-label="關閉訊息"
              onClick={() => setBanner(null)}
            >
              <XMarkIcon width={16} height={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <dl className={infoList}>
        <div className={infoRow}>
          <dt className={infoLabel}>地點類型</dt>
          <dd className={infoValue}>
            {kindBadge}
            {kind === 'address' && (
              <span className={noteText}>活動需選到完全相同的地址才會自動連上</span>
            )}
            {kind === 'unset' && <span className={noteText}>活動無法自動連上此場地</span>}
          </dd>
        </div>
        <div className={infoRow}>
          <dt className={infoLabel}>目前地址</dt>
          <dd className={infoValue}>{place.address.trim() ? place.address : '（未填）'}</dd>
        </div>
        <div className={infoRow}>
          <dt className={infoLabel}>座標</dt>
          <dd className={infoValue}>
            <span className={coordText}>
              {typeof place.lat === 'number' && typeof place.lng === 'number'
                ? `${place.lat}, ${place.lng}`
                : '（無）'}
            </span>
            {coordsMissing && (
              <>
                <span className={badge} data-tone="warn">
                  <ExclamationTriangleIcon aria-hidden="true" />
                  座標缺失
                </span>
                <span className={noteText}>距離排序會排在最後</span>
              </>
            )}
          </dd>
        </div>
        <div className={infoRow}>
          <dt className={infoLabel}>placeId</dt>
          <dd className={infoValue}>
            <code className={placeIdCode}>{place.placeId || '（空）'}</code>
          </dd>
        </div>
      </dl>

      <button
        type="button"
        className={expanded ? ghostBtn : outlineBtn}
        aria-expanded={expanded}
        aria-controls={expanded ? panelId : undefined}
        onClick={handleToggle}
      >
        {expanded ? '取消重新選擇' : '重新選擇地點'}
      </button>

      {expanded && (
        <div id={panelId} ref={panelRef} className={reselectPanel}>
          <div role="group" aria-labelledby={`${panelId}-label`} onInput={handleSearchInput}>
            <span id={`${panelId}-label`} className={searchLabel}>
              搜尋新地點
              <span className={searchLabelSub}>請從建議清單選一筆，不要只輸入文字</span>
            </span>
            <PlaceAutocomplete key={searchKey} onPlaceSelect={handlePlaceSelect} api={trackedApi} />
          </div>

          {previewMutation.isPending && (
            <div className={statusRow} role="status">
              <span className={spinner} aria-hidden="true" />
              檢查中…
            </div>
          )}

          {detailsErrorPlaceId && (
            <div className={errorBox} role="alert">
              <div className={errorMessageRow}>
                <ExclamationTriangleIcon aria-hidden="true" />
                <span>無法取得這個地點的座標，請重新搜尋或選擇其他地點。</span>
              </div>
              <button type="button" className={retryBtn} onClick={handleRetryDetails}>
                重試
              </button>
            </div>
          )}

          {previewError && (
            <div className={errorBox} role="alert">
              <div className={errorMessageRow}>
                <ExclamationTriangleIcon aria-hidden="true" />
                <span>{previewError.message}</span>
              </div>
              {previewError.inUseVenue && (
                <a
                  href={`/admin-new/venues/${previewError.inUseVenue.id}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  前往該場地（另開分頁）
                </a>
              )}
              {previewError.canRetry && (
                <button type="button" className={retryBtn} onClick={handleRetryPreview}>
                  重試
                </button>
              )}
            </div>
          )}

          {preview && selected && (
            <section className={previewCard} aria-label="新地點預覽">
              <p className={previewName}>{selected.name}</p>
              <div className={infoValue}>
                {preview.google.isAddressType ? (
                  <span className={badge} data-tone="warn">
                    <ExclamationTriangleIcon aria-hidden="true" />
                    地址型
                  </span>
                ) : (
                  <span className={badge}>店家</span>
                )}
                {preview.unchanged && <span className={badge}>與目前相同</span>}
              </div>
              <p className={infoValue}>
                {preview.google.formattedAddress.trim() || '（Google 未提供）'}
              </p>
              <p className={`${infoValue} ${coordText}`}>
                {`${preview.google.lat}, ${preview.google.lng}`}
              </p>
              <p className={noteText}>
                {preview.unchanged
                  ? preview.linkableEventCount > 0
                    ? `地點相同，套用後會更新座標，並補連 ${preview.linkableEventCount} 場活動`
                    : '地點相同，套用後會以 Google 資料更新座標，沒有可補連的活動'
                  : `將連上 ${preview.linkableEventCount} 場活動`}
              </p>
              {preview.google.isAddressType && (
                <div className={amberBox}>
                  <ExclamationTriangleIcon aria-hidden="true" />
                  <span>{ADDRESS_TYPE_REMINDER}</span>
                </div>
              )}
              <div className={actionRow}>
                <button type="button" className={primaryBtn} onClick={() => setDialogOpen(true)}>
                  {preview.unchanged ? unchangedCta : '套用新地點'}
                </button>
                <button type="button" className={ghostBtn} onClick={clearSelection}>
                  重新搜尋
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {dialogOpen && preview && selected && (
        <VenueReselectDialog
          open
          venueName={venueName}
          newPlaceName={selected.name}
          preview={preview}
          formAddressDiffers={formAddress.trim() !== place.address.trim()}
          isLoading={applyMutation.isPending}
          errorMessage={applyError?.message ?? null}
          errorKind={applyError?.kind ?? null}
          onConfirm={handleConfirm}
          onClose={closeDialog}
          onRepreview={handleRepreview}
          onBackToSearch={handleBackToSearch}
        />
      )}
    </section>
  );
}
