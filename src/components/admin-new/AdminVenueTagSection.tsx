'use client';

import { useRef, useState } from 'react';
import { ChevronDownIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';
import type { VenueTagDefinition, VenueTagDictionary } from '@/types';
import { formatTagDate } from '@/utils/venueTags';
import {
  EQUIPMENT_NOTE_MAX,
  MAX_SOURCE_LINKS,
  canSetTagLimit,
  createLinkRow,
  type TagEntry,
  type TagFieldErrors,
  type TagFormState,
  type TagDictionaryStatus,
  type TagLimitMode,
} from './adminVenueTagFields';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const section = css({ display: 'flex', flexDirection: 'column', gap: '4' });

const sectionTitle = css({ margin: 0, textStyle: 'h4', color: 'color.text.primary' });

const groupBox = css({
  margin: 0,
  minWidth: 0,
  padding: '4',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  display: 'flex',
  flexDirection: 'column',
});

const groupLegend = css({
  paddingX: '1',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
});

const tagRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: '3',
  rowGap: '2',
  paddingY: '2',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  _last: { borderBottom: 'none' },
});

const tagLabel = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2',
  minHeight: '44px',
  textStyle: 'body',
  color: 'color.text.primary',
  cursor: 'pointer',
});

const checkboxStyle = css({
  width: '18px',
  height: '18px',
  accentColor: 'stellarBlue.600',
  cursor: 'pointer',
});

const tagHint = css({ textStyle: 'caption', color: 'color.text.secondary' });

const expiredBadge = css({
  paddingX: '2',
  paddingY: '0.5',
  borderRadius: 'radius.sm',
  background: 'amber.50',
  color: 'amber.800',
  textStyle: 'caption',
  fontWeight: 'semibold',
  whiteSpace: 'nowrap',
});

const limitControls = css({
  marginLeft: 'auto',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: '2',
});

const dateField = css({ display: 'flex', flexDirection: 'column', gap: '1' });

const dropdownContainer = css({ position: 'relative', minWidth: '200px' });

const dropdownTrigger = css({
  width: '100%',
  minHeight: '44px',
  paddingY: '2',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '2',
  textStyle: 'bodySmall',
  '&:hover': { borderColor: 'color.border.medium' },
});

const dropdownMenu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  boxShadow: 'shadow.md',
  zIndex: 20,
  overflow: 'hidden',
});

const dropdownOption = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: '44px',
    paddingX: '3',
    textStyle: 'bodySmall',
    color: 'color.text.primary',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    '&:hover': { background: 'color.background.secondary' },
  },
  variants: {
    selected: { true: { color: 'color.primary', fontWeight: 'semibold' } },
  },
});

// Static style with a variant: css() inside render would rebuild the class every render
const chevronIcon = cva({
  base: { width: '14px', height: '14px', transition: 'transform 0.15s ease', flexShrink: 0 },
  variants: { open: { true: { transform: 'rotate(180deg)' } } },
});

const inputStyle = css({
  width: '100%',
  minHeight: '44px',
  paddingY: '2',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  '&::placeholder': { color: 'color.text.disabled' },
  '&:focus-visible': { outline: 'none', borderColor: 'color.primary' },
  '&[aria-invalid="true"]': { borderColor: 'red.400' },
  '&:disabled': { background: 'gray.50', color: 'color.text.secondary', cursor: 'not-allowed' },
});

const textareaStyle = css({
  width: '100%',
  minHeight: '120px',
  paddingY: '2.5',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  resize: 'vertical',
  '&:focus-visible': { outline: 'none', borderColor: 'color.primary' },
  '&:disabled': { background: 'gray.50', color: 'color.text.secondary', cursor: 'not-allowed' },
});

const fieldGroup = css({ display: 'flex', flexDirection: 'column', gap: '1.5' });

const fieldLabel = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
});

const fieldHint = css({ margin: 0, textStyle: 'caption', color: 'color.text.secondary' });

const fieldError = css({ textStyle: 'caption', color: 'red.500' });

const fieldWarning = css({
  paddingX: '2',
  paddingY: '1',
  borderRadius: 'radius.sm',
  background: 'amber.50',
  color: 'amber.800',
  textStyle: 'caption',
  maxWidth: '280px',
});

const linkRow = css({ display: 'flex', alignItems: 'flex-start', gap: '2' });

const iconBtn = css({
  flexShrink: 0,
  width: '44px',
  height: '44px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: 'radius.md',
  background: 'none',
  color: 'color.text.secondary',
  cursor: 'pointer',
  '&:hover:not(:disabled)': { color: 'red.500', background: 'color.background.secondary' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

const addLinkBtn = css({
  alignSelf: 'flex-start',
  minHeight: '44px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  paddingX: '2',
  border: 'none',
  background: 'none',
  color: 'color.link',
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  cursor: 'pointer',
  '&:hover:not(:disabled)': { color: 'color.linkHover' },
  '&:disabled': { color: 'color.text.disabled', cursor: 'not-allowed' },
});

const twoCol = css({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '4',
  md: { gridTemplateColumns: '1fr 1fr' },
});

const errorBox = css({
  paddingX: '4',
  paddingY: '3',
  borderRadius: 'radius.md',
  background: 'red.50',
  border: '1px solid',
  borderColor: 'red.200',
  textStyle: 'bodySmall',
  color: 'red.800',
});

const skeletonRow = css({ display: 'flex', alignItems: 'center', gap: '2', paddingY: '3' });

// ─── Constants ────────────────────────────────────────────────────────────────

const LIMIT_OPTIONS: { value: TagLimitMode; label: string }[] = [
  { value: 'none', label: '不限期' },
  { value: 'limited', label: '限期（目前沒有設定結束日）' },
  { value: 'until', label: '限期到' },
];

const PAST_UNTIL_WARNING = '這個日期已經過了，存了之後前台不會顯示這個標籤。';
const NEAR_TRAIN_HINT = '步行 10 分鐘內，含高鐵';
const CAN_DECORATE_HINT = '不上卡片，決定詳情頁「佈置、辦生咖」那一行';

// ─── LimitDropdown ────────────────────────────────────────────────────────────

interface LimitDropdownProps {
  tagLabel: string;
  value: TagLimitMode;
  onChange: (mode: TagLimitMode) => void;
}

function LimitDropdown({ tagLabel, value, onChange }: LimitDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = LIMIT_OPTIONS.find((o) => o.value === value)?.label ?? '不限期';

  return (
    <div
      className={dropdownContainer}
      // Focus leaving the whole widget (trigger or options) closes it, incl. clicks outside
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Escape' || !open) return;
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={dropdownTrigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${tagLabel}的限期：${selected}`}
      >
        <span>{selected}</span>
        <ChevronDownIcon className={chevronIcon({ open })} aria-hidden="true" />
      </button>
      {open && (
        <div
          className={dropdownMenu}
          role="listbox"
          aria-label={`${tagLabel}的限期`}
          // Keeps focus in the widget while clicking (Safari does not focus clicked buttons)
          onMouseDown={(e) => e.preventDefault()}
        >
          {LIMIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              className={dropdownOption({ selected: value === opt.value })}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TagRow ───────────────────────────────────────────────────────────────────

interface TagRowProps {
  def: VenueTagDefinition;
  entry: TagEntry | undefined;
  hint: string | null;
  today: string;
  untilError?: string;
  showLimit: boolean;
  onChange: (entry: TagEntry) => void;
}

function TagRow({ def, entry, hint, today, untilError, showLimit, onChange }: TagRowProps) {
  const checked = entry?.checked ?? false;
  const current: TagEntry = entry ?? { checked: false, mode: 'none', until: '' };
  const id = `venue-tag-${def.slug}`;
  const hintId = `${id}-hint`;
  const untilId = `${id}-until`;
  const pastUntil = checked && current.mode === 'until' && !!current.until && current.until < today;
  const untilDescribedBy = [untilError && `${untilId}-error`, pastUntil && `${untilId}-warning`]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={tagRow}>
      <label htmlFor={id} className={tagLabel}>
        <input
          id={id}
          type="checkbox"
          className={checkboxStyle}
          checked={checked}
          onChange={(e) => onChange({ ...current, checked: e.target.checked })}
          aria-describedby={hint ? hintId : undefined}
        />
        {def.label}
      </label>
      {hint && (
        <span id={hintId} className={tagHint}>
          {hint}
        </span>
      )}
      {pastUntil && <span className={expiredBadge}>已過期 {formatTagDate(current.until)}</span>}
      {checked && showLimit && (
        <div className={limitControls}>
          <LimitDropdown
            tagLabel={def.label}
            value={current.mode}
            onChange={(mode) => onChange({ ...current, mode })}
          />
          {current.mode === 'until' && (
            <div className={dateField} data-until-field={def.slug}>
              <input
                id={untilId}
                type="date"
                className={inputStyle}
                value={current.until}
                onChange={(e) => onChange({ ...current, until: e.target.value })}
                aria-label={`${def.label}的結束日期`}
                aria-invalid={untilError ? 'true' : undefined}
                aria-describedby={untilDescribedBy || undefined}
              />
              {untilError && (
                <span id={`${untilId}-error`} className={fieldError} role="alert">
                  {untilError}
                </span>
              )}
              {pastUntil && (
                <span id={`${untilId}-warning`} className={fieldWarning}>
                  {PAST_UNTIL_WARNING}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface AdminVenueTagSectionProps {
  status: TagDictionaryStatus;
  dictionary: VenueTagDictionary | null;
  state: TagFormState;
  // Load-time entries; decide which non-price rows still need a limit control
  initialEntries: Record<string, TagEntry>;
  errors: TagFieldErrors;
  today: string;
  nearestMrt: string;
  mrtWalkMinutes: string;
  onChange: (updater: (prev: TagFormState) => TagFormState) => void;
}

function formatMrtHint(station: string, minutes: string): string | null {
  const name = station.trim();
  if (!name) return null;
  return minutes ? `${name}，步行 ${minutes} 分鐘` : name;
}

export default function AdminVenueTagSection({
  status,
  dictionary,
  state,
  initialEntries,
  errors,
  today,
  nearestMrt,
  mrtWalkMinutes,
  onChange,
}: AdminVenueTagSectionProps) {
  // Loading or failed: nothing in this area is sent, so it must not be editable either
  const disabled = status !== 'success' || !dictionary;

  function hintFor(slug: string): string | null {
    if (slug === 'can_decorate') return CAN_DECORATE_HINT;
    if (slug === 'near_train') return NEAR_TRAIN_HINT;
    if (slug === 'near_mrt') return formatMrtHint(nearestMrt, mrtWalkMinutes);
    return null;
  }

  function setEntry(slug: string, entry: TagEntry) {
    onChange((prev) => ({ ...prev, entries: { ...prev.entries, [slug]: entry } }));
  }

  function setLink(id: string, value: string) {
    onChange((prev) => ({
      ...prev,
      sourceLinks: prev.sourceLinks.map((row) => (row.id === id ? { ...row, value } : row)),
    }));
  }

  const groups = dictionary ? [...dictionary.groups].sort((a, b) => a.order - b.order) : [];

  return (
    <>
      <section className={section} data-field="tags" aria-labelledby="venue-tags-title">
        <h2 id="venue-tags-title" className={sectionTitle}>
          標籤
        </h2>
        {status === 'error' && (
          <div className={errorBox} role="alert">
            標籤載入失敗，請重新整理頁面
          </div>
        )}
        {status === 'pending' &&
          Array.from({ length: 3 }).map((_, g) => (
            <div key={g} className={groupBox} aria-hidden="true">
              <Skeleton width="64px" height="16px" />
              {Array.from({ length: 4 }).map((__, r) => (
                <div key={r} className={skeletonRow}>
                  <Skeleton width="18px" height="18px" borderRadius="4px" />
                  <Skeleton width="120px" height="16px" />
                </div>
              ))}
            </div>
          ))}
        {dictionary &&
          status === 'success' &&
          groups.map((group) => (
            <fieldset key={group.key} className={groupBox}>
              <legend className={groupLegend}>{group.label}</legend>
              {dictionary.tags
                .filter((def) => def.group === group.key)
                .sort((a, b) => a.order - b.order)
                .map((def) => (
                  <TagRow
                    key={def.slug}
                    def={def}
                    entry={state.entries[def.slug]}
                    showLimit={canSetTagLimit(def.slug, initialEntries[def.slug])}
                    hint={hintFor(def.slug)}
                    today={today}
                    untilError={errors.until[def.slug]}
                    onChange={(entry) => setEntry(def.slug, entry)}
                  />
                ))}
            </fieldset>
          ))}
      </section>

      <section className={section} aria-labelledby="venue-store-info-title">
        <h2 id="venue-store-info-title" className={sectionTitle}>
          店家說明資料
        </h2>

        <div data-field="sourceLinks" className={fieldGroup}>
          <span className={fieldLabel}>店家原始說明連結</span>
          {state.sourceLinks.map((row, i) => {
            const error = errors.sourceLinks[row.id];
            const errorId = `venue-${row.id}-error`;
            return (
              <div key={row.id} className={fieldGroup} data-link-row={row.id}>
                <div className={linkRow}>
                  <input
                    type="text"
                    inputMode="url"
                    className={inputStyle}
                    placeholder="https://"
                    id={`venue-${row.id}`}
                    value={row.value}
                    disabled={disabled}
                    onChange={(e) => setLink(row.id, e.target.value)}
                    aria-label={`原始說明連結 ${i + 1}`}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={error ? errorId : undefined}
                  />
                  <button
                    type="button"
                    className={iconBtn}
                    disabled={disabled}
                    aria-label={`移除原始說明連結 ${i + 1}`}
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        sourceLinks: prev.sourceLinks.filter((r) => r.id !== row.id),
                      }))
                    }
                  >
                    <XMarkIcon width={18} height={18} aria-hidden="true" />
                  </button>
                </div>
                {error && (
                  <span id={errorId} className={fieldError} role="alert">
                    {error}
                  </span>
                )}
              </div>
            );
          })}
          <button
            type="button"
            className={addLinkBtn}
            disabled={disabled || state.sourceLinks.length >= MAX_SOURCE_LINKS}
            onClick={() =>
              onChange((prev) => ({ ...prev, sourceLinks: [...prev.sourceLinks, createLinkRow()] }))
            }
          >
            <PlusIcon width={16} height={16} aria-hidden="true" />
            新增連結
          </button>
          <p className={fieldHint}>
            最多 {MAX_SOURCE_LINKS} 個。前台詳情頁會顯示「店家原始說明」。
          </p>
        </div>

        <div className={fieldGroup}>
          <label htmlFor="venue-equipment-note" className={fieldLabel}>
            店家提供的設備（原文）
          </label>
          <textarea
            id="venue-equipment-note"
            className={textareaStyle}
            value={state.equipmentNote}
            maxLength={EQUIPMENT_NOTE_MAX}
            disabled={disabled}
            onChange={(e) => onChange((prev) => ({ ...prev, equipmentNote: e.target.value }))}
            aria-describedby="venue-equipment-note-hint"
          />
          <p id="venue-equipment-note-hint" className={fieldHint}>
            照店家原文，可以有價格（當補充說明）。前台會在後面加「部分需租借，以店家說明為準」。留空就不顯示這一段。
          </p>
        </div>

        <div className={twoCol}>
          <div className={fieldGroup}>
            <label htmlFor="venue-info-updated-on" className={fieldLabel}>
              資料更新日期
            </label>
            <input
              id="venue-info-updated-on"
              type="date"
              className={inputStyle}
              value={state.infoUpdatedOn}
              disabled={disabled}
              onChange={(e) => onChange((prev) => ({ ...prev, infoUpdatedOn: e.target.value }))}
              aria-describedby="venue-info-updated-on-hint"
            />
            <p id="venue-info-updated-on-hint" className={fieldHint}>
              只在店家規定有調整時才改。
            </p>
          </div>

          <div data-field="calendarUrl" className={fieldGroup}>
            <label htmlFor="venue-calendar-url" className={fieldLabel}>
              檔期行事曆連結
            </label>
            <input
              id="venue-calendar-url"
              type="text"
              inputMode="url"
              className={inputStyle}
              placeholder="https://"
              value={state.calendarUrl}
              disabled={disabled}
              onChange={(e) => onChange((prev) => ({ ...prev, calendarUrl: e.target.value }))}
              aria-invalid={errors.calendarUrl ? 'true' : undefined}
              aria-describedby={
                errors.calendarUrl ? 'venue-calendar-url-error' : 'venue-calendar-url-hint'
              }
            />
            {errors.calendarUrl && (
              <span id="venue-calendar-url-error" className={fieldError} role="alert">
                {errors.calendarUrl}
              </span>
            )}
            <p id="venue-calendar-url-hint" className={fieldHint}>
              這次只存資料，前台不顯示。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
