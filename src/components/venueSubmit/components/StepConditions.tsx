'use client';

import { BuildingStorefrontIcon, GiftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import FieldError from '@/components/forms/FieldError';
import type { VenueUseOption } from '@/types';
import {
  EQUIPMENT_OPTIONS,
  NOTE_MAX_LENGTH,
  SERVICE_OPTIONS,
  SPACE_OPTIONS,
  STEP_META,
  USE_OPTIONS,
  type FeeAnswers,
  type FormErrors,
  type VenueSubmitFormValues,
} from '../venueSubmitModel';
import { describedBy, errorId, type FormUpdater } from '../formFields';
import {
  chipGroup,
  field,
  fieldset,
  hint,
  input,
  optionalMark,
  questionLabel,
  srOnly,
  textarea,
} from '../styles';
import { CheckCard, Chip, PlainCheck, RadioCard } from './Choices';

const cardList = css({ display: 'flex', flexDirection: 'column', gap: '3' });

const feesBox = css({
  margin: 0,
  minWidth: 0,
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '5',
  paddingX: '4',
  paddingY: '5',
  borderRadius: 'radius.lg',
  background: 'gray.50',
});

const feesLegend = css({ padding: 0, float: 'left', width: '100%' });
const feesHeading = css({ margin: 0, textStyle: 'h3', color: 'color.text.primary' });
const twoColumns = css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2' });
const limitBox = css({ display: 'flex', flexDirection: 'column', gap: '1' });
const dateInput = css({ maxWidth: '200px', cursor: 'pointer' });

const USE_ICONS: Record<VenueUseOption, React.ReactNode> = {
  goods_distribution: <GiftIcon />,
  can_decorate: <SparklesIcon />,
  private_booking: <BuildingStorefrontIcon />,
};

const toggle = <T,>(list: T[], value: T, on: boolean) =>
  on ? [...list, value] : list.filter((item) => item !== value);

// Only the picker may set the date (venue-tags §D): block typing and pasting, open it instead
function openPicker(el: HTMLInputElement) {
  try {
    el.showPicker?.();
  } catch {
    // Not supported or not allowed (e.g. not a user gesture): the native control still works
  }
}

interface StepConditionsProps {
  form: VenueSubmitFormValues;
  errors: FormErrors;
  today: string;
  update: FormUpdater;
}

export default function StepConditions({ form, errors, today, update }: StepConditionsProps) {
  const decorating = form.uses.options.includes('can_decorate');
  const { fees } = form;

  const setFees = (patch: Partial<FeeAnswers>, clear: string[] = ['fees']) =>
    update((prev) => ({ ...prev, fees: { ...prev.fees, ...patch } }), clear);

  return (
    <>
      <fieldset
        className={fieldset}
        data-error-field="uses"
        aria-invalid={errors.uses ? 'true' : undefined}
        aria-describedby={describedBy(errors.uses && errorId('uses'))}
      >
        <legend className={srOnly}>{STEP_META[2].heading}</legend>
        <div className={cardList}>
          {USE_OPTIONS.map((opt) => (
            <CheckCard
              key={opt.value}
              id={`venue-submit-use-${opt.value}`}
              title={opt.label}
              description={opt.description}
              icon={USE_ICONS[opt.value]}
              checked={form.uses.options.includes(opt.value)}
              onChange={(on) =>
                update(
                  (prev) => ({
                    ...prev,
                    uses: { ...prev.uses, options: toggle(prev.uses.options, opt.value, on) },
                  }),
                  ['uses']
                )
              }
            />
          ))}
        </div>
        <PlainCheck
          id="venue-submit-uses-discussable"
          label="還沒確定，想先跟主辦聊聊"
          checked={form.uses.discussable}
          onChange={(on) =>
            update((prev) => ({ ...prev, uses: { ...prev.uses, discussable: on } }), ['uses'])
          }
        />
        <FieldError id={errorId('uses')} message={errors.uses} />
      </fieldset>

      {decorating && (
        <fieldset
          className={feesBox}
          data-error-field="fees"
          aria-invalid={errors.fees ? 'true' : undefined}
          aria-describedby={describedBy(errors.fees && errorId('fees'))}
        >
          <legend className={feesLegend}>
            <h2 className={feesHeading}>佈置、辦生咖怎麼收費？</h2>
          </legend>

          <fieldset className={fieldset}>
            <legend className={questionLabel}>要收場地費嗎？</legend>
            <RadioCard
              id="venue-submit-fee-free"
              name="venue-submit-fee"
              label="不用場地費"
              checked={fees.venueFee === 'free'}
              onSelect={() => setFees({ venueFee: 'free' })}
            >
              <PlainCheck
                id="venue-submit-fee-limited"
                label="這是限時優惠，免場地費到"
                checked={fees.freeVenueLimited}
                onChange={(on) => setFees({ freeVenueLimited: on }, ['freeVenueUntil'])}
              />
              {fees.freeVenueLimited && (
                <div className={limitBox} data-error-field="freeVenueUntil">
                  <input
                    type="date"
                    className={`${input} ${dateInput}`}
                    aria-label="免場地費的最後一天"
                    min={today}
                    value={fees.freeVenueUntil}
                    aria-invalid={errors.freeVenueUntil ? 'true' : undefined}
                    aria-describedby={describedBy(
                      'venue-submit-fee-until-hint',
                      errors.freeVenueUntil && errorId('freeVenueUntil')
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab') return;
                      e.preventDefault();
                      if (e.key === 'Enter' || e.key === ' ') openPicker(e.currentTarget);
                    }}
                    onPaste={(e) => e.preventDefault()}
                    onClick={(e) => openPicker(e.currentTarget)}
                    onChange={(e) =>
                      setFees({ freeVenueUntil: e.target.value }, ['freeVenueUntil'])
                    }
                  />
                  <FieldError id={errorId('freeVenueUntil')} message={errors.freeVenueUntil} />
                  <p id="venue-submit-fee-until-hint" className={hint}>
                    不確定到哪天可以先不填。
                  </p>
                </div>
              )}
            </RadioCard>
            <RadioCard
              id="venue-submit-fee-paid"
              name="venue-submit-fee"
              label="要場地費"
              checked={fees.venueFee === 'paid'}
              onSelect={() => setFees({ venueFee: 'paid' })}
            />
            <RadioCard
              id="venue-submit-fee-depends"
              name="venue-submit-fee"
              label="看方案"
              checked={fees.venueFee === 'depends'}
              onSelect={() => setFees({ venueFee: 'depends' })}
            />
          </fieldset>

          <fieldset className={fieldset} aria-describedby="venue-submit-guarantee-hint">
            <legend className={questionLabel}>有保底門檻嗎？</legend>
            <p id="venue-submit-guarantee-hint" className={hint}>
              主辦要保證達到的杯數或營業額。
            </p>
            <div className={twoColumns}>
              <RadioCard
                id="venue-submit-guarantee-yes"
                name="venue-submit-guarantee"
                label="有"
                checked={fees.guarantee === 'yes'}
                onSelect={() => setFees({ guarantee: 'yes' })}
              />
              <RadioCard
                id="venue-submit-guarantee-no"
                name="venue-submit-guarantee"
                label="沒有"
                checked={fees.guarantee === 'no'}
                onSelect={() => setFees({ guarantee: 'no' })}
              />
            </div>
          </fieldset>

          <fieldset className={fieldset} aria-describedby="venue-submit-deposit-hint">
            <legend className={questionLabel}>要收押金嗎？</legend>
            <p id="venue-submit-deposit-hint" className={hint}>
              活動結束後會退還。
            </p>
            <div className={twoColumns}>
              <RadioCard
                id="venue-submit-deposit-yes"
                name="venue-submit-deposit"
                label="要"
                checked={fees.deposit === 'yes'}
                onSelect={() => setFees({ deposit: 'yes' })}
              />
              <RadioCard
                id="venue-submit-deposit-no"
                name="venue-submit-deposit"
                label="不用"
                checked={fees.deposit === 'no'}
                onSelect={() => setFees({ deposit: 'no' })}
              />
            </div>
          </fieldset>

          <PlainCheck
            id="venue-submit-fees-discussable"
            label="要看檔期和方案，想先跟主辦聊聊"
            checked={fees.discussable}
            onChange={(on) => setFees({ discussable: on })}
          />
          <FieldError id={errorId('fees')} message={errors.fees} />
        </fieldset>
      )}

      <fieldset
        className={fieldset}
        data-error-field="services"
        aria-invalid={errors.services ? 'true' : undefined}
        aria-describedby={describedBy(
          'venue-submit-services-hint',
          errors.services && errorId('services')
        )}
      >
        <legend className={questionLabel}>可以提供的服務</legend>
        <p id="venue-submit-services-hint" className={hint}>
          代收應援物：主辦可以先把應援物寄到店裡，店裡代收。
        </p>
        <div className={chipGroup}>
          {SERVICE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              id={`venue-submit-service-${opt.value}`}
              label={opt.label}
              checked={form.services.options.includes(opt.value)}
              onChange={(on) =>
                update(
                  (prev) => ({
                    ...prev,
                    services: {
                      ...prev.services,
                      options: toggle(prev.services.options, opt.value, on),
                    },
                  }),
                  ['services']
                )
              }
            />
          ))}
        </div>
        <PlainCheck
          id="venue-submit-services-discussable"
          label="還沒確定，想先跟主辦聊聊"
          checked={form.services.discussable}
          onChange={(on) =>
            update(
              (prev) => ({ ...prev, services: { ...prev.services, discussable: on } }),
              ['services']
            )
          }
        />
        <FieldError id={errorId('services')} message={errors.services} />
      </fieldset>

      <fieldset
        className={fieldset}
        data-error-field="spaceTypes"
        aria-invalid={errors.spaceTypes ? 'true' : undefined}
        aria-describedby={describedBy(errors.spaceTypes && errorId('spaceTypes'))}
      >
        <legend className={questionLabel}>店裡是什麼樣的空間？</legend>
        <div className={chipGroup}>
          {SPACE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              id={`venue-submit-space-${opt.value}`}
              label={opt.label}
              checked={form.spaceTypes.includes(opt.value)}
              onChange={(on) =>
                update(
                  (prev) => ({ ...prev, spaceTypes: toggle(prev.spaceTypes, opt.value, on) }),
                  ['spaceTypes']
                )
              }
            />
          ))}
        </div>
        <FieldError id={errorId('spaceTypes')} message={errors.spaceTypes} />
      </fieldset>

      <fieldset className={fieldset}>
        <legend className={questionLabel}>
          有哪些設備？<span className={optionalMark}>（選填）</span>
        </legend>
        <div className={chipGroup}>
          {EQUIPMENT_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              id={`venue-submit-equipment-${opt.value}`}
              label={opt.label}
              checked={form.equipment.includes(opt.value)}
              onChange={(on) =>
                update(
                  (prev) => ({ ...prev, equipment: toggle(prev.equipment, opt.value, on) }),
                  []
                )
              }
            />
          ))}
        </div>
      </fieldset>

      <div className={field}>
        <label htmlFor="venue-submit-note" className={questionLabel}>
          還有什麼想讓主辦知道的？<span className={optionalMark}>（選填）</span>
        </label>
        <p id="venue-submit-note-hint" className={hint}>
          上面沒問到的條件、可以租借的設備都可以寫。
        </p>
        <textarea
          id="venue-submit-note"
          className={textarea}
          maxLength={NOTE_MAX_LENGTH}
          placeholder="例如：包場另外計價、可租扭蛋機和投影機等。"
          aria-describedby="venue-submit-note-hint"
          value={form.note}
          onChange={(e) => update((prev) => ({ ...prev, note: e.target.value }), [])}
        />
      </div>
    </>
  );
}
