'use client';

import Link from 'next/link';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import FieldError from '@/components/forms/FieldError';
import {
  MAX_SOURCE_LINKS,
  createLinkRow,
  sourceLinkErrorKey,
  type FormErrors,
  type SubmitContact,
  type VenueSubmitFormValues,
} from '../venueSubmitModel';
import { describedBy, errorId, type FormUpdater } from '../formFields';
import {
  divider,
  errorBanner,
  field,
  fieldset,
  hint,
  iconButton,
  input,
  optionalMark,
  questionLabel,
  sectionHeading,
  srOnly,
  textarea,
} from '../styles';
import { RadioCard } from './Choices';
import VenuePhotoGrid from './VenuePhotoGrid';
import type { usePhotoUploads } from '../hooks/usePhotoUploads';

const retryButton = css({
  alignSelf: 'flex-start',
  minHeight: '44px',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'color.border.medium',
  borderRadius: 'radius.md',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  cursor: 'pointer',
  '&:hover': { background: 'color.background.secondary' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary' },
});

const linkRow = css({ display: 'flex', alignItems: 'flex-start', gap: '1' });
const cardStack = css({ display: 'flex', flexDirection: 'column', gap: '3' });
const consent = css({
  margin: 0,
  textStyle: 'caption',
  color: 'color.text.secondary',
  '& a': { color: 'color.link', textDecoration: 'underline', textUnderlineOffset: '2px' },
});
const bannerDetail = css({ margin: 0 });
const CONTACT_OPTIONS: { value: SubmitContact; label: string }[] = [
  { value: 'instagram', label: 'Instagram 私訊' },
  { value: 'threads', label: 'Threads 私訊' },
  { value: 'line', label: 'LINE' },
];

export const SUBMIT_FAILED_MESSAGE =
  '送出場地投稿失敗，請確認錯誤訊息及網路連線狀態後再次送出，若持續失敗，請私訊 STELLAR IG 或是 Threads 帳號。';

type Photos = ReturnType<typeof usePhotoUploads>;

interface TextFieldProps {
  id: string;
  errorKey: string;
  label: string;
  optional?: boolean;
  value: string;
  errors: FormErrors;
  hintText?: string;
  placeholder?: string;
  inputMode?: 'url' | 'text';
  // Inside a contact card the card title already names the field; keep the label for screen readers
  hideLabel?: boolean;
  // A group-level error that also applies to this input (LINE: "at least one social account")
  groupErrorKey?: string;
  onChange: (value: string) => void;
}

function TextField({
  id,
  errorKey,
  label,
  optional,
  value,
  errors,
  hintText,
  placeholder,
  inputMode = 'text',
  hideLabel,
  groupErrorKey,
  onChange,
}: TextFieldProps) {
  const message = errors[errorKey];
  const groupMessage = groupErrorKey ? errors[groupErrorKey] : undefined;
  const hintId = `${id}-hint`;
  return (
    <div className={field} data-error-field={errorKey}>
      <label htmlFor={id} className={hideLabel ? srOnly : questionLabel}>
        {label}
        {optional && <span className={optionalMark}>（選填）</span>}
      </label>
      {hintText && (
        <p id={hintId} className={hint}>
          {hintText}
        </p>
      )}
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        className={input}
        placeholder={placeholder}
        value={value}
        aria-invalid={message || groupMessage ? 'true' : undefined}
        aria-describedby={describedBy(
          hintText && hintId,
          message && errorId(errorKey),
          groupMessage && groupErrorKey && errorId(groupErrorKey)
        )}
        onChange={(e) => onChange(e.target.value)}
      />
      <FieldError id={errorId(errorKey)} message={message} />
    </div>
  );
}

interface StepContactProps {
  form: VenueSubmitFormValues;
  errors: FormErrors;
  update: FormUpdater;
  photos: Photos;
  submitError: string | null;
}

export default function StepContact({
  form,
  errors,
  update,
  photos,
  submitError,
}: StepContactProps) {
  const contact = form.preferredContact;
  const setText =
    (key: 'instagram' | 'threads' | 'contactUrl', clear: string[]) => (value: string) =>
      update((prev) => ({ ...prev, [key]: value }), clear);
  const socialClear = ['instagram', 'threads', 'socialMedia'];

  const groupErrorKey = contact === 'line' ? 'socialMedia' : undefined;
  const instagramField = (optional: boolean, inCard = false) => (
    <TextField
      id="venue-submit-instagram"
      errorKey="instagram"
      groupErrorKey={groupErrorKey}
      label="Instagram 帳號"
      optional={optional}
      hideLabel={inCard}
      value={form.instagram}
      errors={errors}
      placeholder={inCard ? 'IG 帳號 @username' : '@username'}
      onChange={setText('instagram', socialClear)}
    />
  );
  const threadsField = (optional: boolean, inCard = false) => (
    <TextField
      id="venue-submit-threads"
      errorKey="threads"
      groupErrorKey={groupErrorKey}
      label="Threads 帳號"
      optional={optional}
      hideLabel={inCard}
      value={form.threads}
      errors={errors}
      placeholder={inCard ? 'Threads 帳號 @username' : '@username'}
      onChange={setText('threads', socialClear)}
    />
  );

  return (
    <>
      <fieldset
        className={fieldset}
        data-error-field="preferredContact"
        aria-invalid={errors.preferredContact ? 'true' : undefined}
        aria-describedby={describedBy(errors.preferredContact && errorId('preferredContact'))}
      >
        <legend className={questionLabel}>主要聯絡方式</legend>
        <div className={cardStack}>
          {CONTACT_OPTIONS.map((opt) => (
            <RadioCard
              key={opt.value}
              id={`venue-submit-contact-${opt.value}`}
              name="venue-submit-contact"
              label={opt.label}
              checked={contact === opt.value}
              onSelect={() =>
                update(
                  (prev) => ({ ...prev, preferredContact: opt.value }),
                  ['preferredContact', 'instagram', 'threads', 'contactUrl', 'socialMedia']
                )
              }
            >
              {opt.value === 'instagram' && instagramField(false, true)}
              {opt.value === 'threads' && threadsField(false, true)}
              {opt.value === 'line' && (
                <TextField
                  id="venue-submit-line"
                  errorKey="contactUrl"
                  label="LINE 連結"
                  hideLabel
                  value={form.contactUrl}
                  errors={errors}
                  placeholder="LINE 連結"
                  inputMode="url"
                  onChange={setText('contactUrl', ['contactUrl'])}
                />
              )}
            </RadioCard>
          ))}
        </div>
        <FieldError id={errorId('preferredContact')} message={errors.preferredContact} />
      </fieldset>

      {contact === 'instagram' && threadsField(true)}
      {contact === 'threads' && instagramField(true)}
      {contact === 'line' && (
        <div className={field} data-error-field="socialMedia">
          {instagramField(false)}
          {threadsField(false)}
          <FieldError id={errorId('socialMedia')} message={errors.socialMedia} />
        </div>
      )}

      <TextField
        id="venue-submit-booking-form"
        errorKey="bookingFormUrl"
        label="預約表單網址"
        optional
        value={form.bookingFormUrl}
        errors={errors}
        hintText="給主辦預約場地用的 Google 表單、預約系統連結。"
        placeholder="https://"
        inputMode="url"
        onChange={(value) =>
          update((prev) => ({ ...prev, bookingFormUrl: value }), ['bookingFormUrl'])
        }
      />

      <fieldset className={fieldset} aria-describedby="venue-submit-source-links-hint">
        <legend className={questionLabel}>
          給主辦的說明文件<span className={optionalMark}>（選填）</span>
        </legend>
        <p id="venue-submit-source-links-hint" className={hint}>
          如果有提供給主辦看的規則、方案、空間尺寸相關的文件，歡迎提供！
        </p>
        {form.sourceLinks.map((row, i) => {
          const key = sourceLinkErrorKey(row.id);
          const message = errors[key];
          return (
            <div key={row.id} className={field} data-error-field={key}>
              <div className={linkRow}>
                <input
                  type="text"
                  inputMode="url"
                  className={input}
                  placeholder="https://"
                  aria-label={`說明文件連結 ${i + 1}`}
                  value={row.value}
                  aria-invalid={message ? 'true' : undefined}
                  aria-describedby={describedBy(message && errorId(key))}
                  onChange={(e) =>
                    update(
                      (prev) => ({
                        ...prev,
                        sourceLinks: prev.sourceLinks.map((r) =>
                          r.id === row.id ? { ...r, value: e.target.value } : r
                        ),
                      }),
                      [key]
                    )
                  }
                />
                <button
                  type="button"
                  className={iconButton}
                  aria-label={`移除說明文件連結 ${i + 1}`}
                  onClick={() =>
                    update(
                      (prev) => {
                        const rest = prev.sourceLinks.filter((r) => r.id !== row.id);
                        return { ...prev, sourceLinks: rest.length ? rest : [createLinkRow()] };
                      },
                      [key]
                    )
                  }
                >
                  <XMarkIcon aria-hidden="true" />
                </button>
              </div>
              <FieldError id={errorId(key)} message={message} />
            </div>
          );
        })}
        {form.sourceLinks.length < MAX_SOURCE_LINKS && (
          <button
            type="button"
            className={iconButton}
            aria-label="新增說明文件連結"
            onClick={() =>
              update(
                (prev) => ({ ...prev, sourceLinks: [...prev.sourceLinks, createLinkRow()] }),
                []
              )
            }
          >
            <PlusIcon aria-hidden="true" />
          </button>
        )}
      </fieldset>

      <TextField
        id="venue-submit-calendar"
        errorKey="calendarUrl"
        label="檔期行事曆連結"
        optional
        value={form.calendarUrl}
        errors={errors}
        hintText="TimeTree、Google 日曆等，會同步更新的連結。（若不希望公開在平台，請不要提供）"
        placeholder="https://"
        inputMode="url"
        onChange={(value) => update((prev) => ({ ...prev, calendarUrl: value }), ['calendarUrl'])}
      />

      <hr className={divider} />

      <section className={field} aria-labelledby="venue-submit-photos-title">
        <h2 id="venue-submit-photos-title" className={sectionHeading}>
          場地相關照片
        </h2>
        <p className={hint}>可以放店內環境、佈置過的樣子、菜單等，最多 10 張，第一張是封面。</p>
        <VenuePhotoGrid
          photos={form.photos}
          previews={photos.previews}
          invalid={!!errors.photos}
          describedBy={describedBy(errors.photos && errorId('photos'))}
          onAdd={(files) => photos.addPhotos(files, form.photos.length)}
          onRemove={(id) =>
            update((prev) => ({ ...prev, photos: prev.photos.filter((s) => s.id !== id) }), [])
          }
          onMove={(id, delta) =>
            update((prev) => {
              const list = [...prev.photos];
              const from = list.findIndex((s) => s.id === id);
              const to = from + delta;
              if (from < 0 || to < 0 || to >= list.length) return prev;
              [list[from], list[to]] = [list[to], list[from]];
              return { ...prev, photos: list };
            }, [])
          }
        />
        <FieldError id={errorId('photos')} message={errors.photos} />
        <FieldError id="venue-submit-photo-upload-error" message={photos.error ?? undefined} />
        {photos.failed.length > 0 && (
          <button
            type="button"
            className={retryButton}
            onClick={() => photos.addPhotos(photos.failed, form.photos.length)}
          >
            點擊重新上傳圖片
          </button>
        )}
      </section>

      <div className={field}>
        <label htmlFor="venue-submit-description" className={questionLabel}>
          店家介紹<span className={optionalMark}>（選填）</span>
        </label>
        <p id="venue-submit-description-hint" className={hint}>
          如果有想要額外補充的資訊可以填寫在這邊，如果有提供給 STELLAR
          主辦專屬的優惠，也可以寫在這邊（非強制）
        </p>
        <textarea
          id="venue-submit-description"
          className={textarea}
          aria-describedby="venue-submit-description-hint"
          value={form.description}
          onChange={(e) => update((prev) => ({ ...prev, description: e.target.value }), [])}
        />
      </div>

      {submitError && (
        <div className={errorBanner} role="alert">
          <p className={bannerDetail}>{SUBMIT_FAILED_MESSAGE}</p>
          <p className={bannerDetail}>{submitError}</p>
        </div>
      )}

      <p className={consent}>
        送出即表示你確認有權提供上述資料與圖片，並同意依<Link href="/terms">服務條款</Link>及
        <Link href="/privacy">隱私權政策</Link>處理及公開顯示。
      </p>
    </>
  );
}
