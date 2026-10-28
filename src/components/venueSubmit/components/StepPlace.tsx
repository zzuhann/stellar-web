'use client';

import { css } from '@/styled-system/css';
import PlaceAutocomplete from '@/components/forms/PlaceAutocomplete';
import FormDropdown from '@/components/forms/FormDropdown';
import FieldError from '@/components/forms/FieldError';
import TransitStopsField from '@/components/forms/TransitStopsField';
import type { CapacityRange } from '@/types';
import type { placesApi } from '@/lib/api';
import { REGIONS } from '@/constants';
import { CAPACITY_RANGE_LABEL } from '@/components/venues/venueCapacity';
import type { TransitRowErrors } from '@/utils/transitStops';
import { transitErrorKey, type FormErrors, type VenueSubmitFormValues } from '../venueSubmitModel';
import { errorId, type FormUpdater } from '../formFields';
import { field, hint, input, optionalMark, questionLabel } from '../styles';

const placeCard = css({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '3',
  padding: '4',
  borderRadius: 'radius.lg',
  background: 'gray.50',
});

const placeName = css({ margin: 0, textStyle: 'bodyStrong', color: 'color.text.primary' });
const placeAddress = css({ margin: 0, textStyle: 'bodySmall', color: 'color.text.secondary' });

const linkButton = css({
  flexShrink: 0,
  minHeight: '44px',
  marginTop: '-3',
  marginRight: '-2',
  paddingX: '2',
  border: 'none',
  background: 'none',
  color: 'color.link',
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  cursor: 'pointer',
  '&:hover': { color: 'color.linkHover', textDecoration: 'underline' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary' },
});

const REGION_OPTIONS = [...REGIONS, '其他'].map((region) => ({ value: region, label: region }));
const CAPACITY_OPTIONS = (['20以下', '20-40', '40-60', '60以上'] as CapacityRange[]).map(
  (value) => ({ value, label: CAPACITY_RANGE_LABEL[value] ?? value })
);

export const PLACE_INPUT_ID = 'venue-submit-place';
export const NAME_INPUT_ID = 'venue-submit-name';

interface StepPlaceProps {
  form: VenueSubmitFormValues;
  errors: FormErrors;
  update: FormUpdater;
  placeApi: typeof placesApi;
  onResetPlace: () => void;
}

export default function StepPlace({
  form,
  errors,
  update,
  placeApi,
  onResetPlace,
}: StepPlaceProps) {
  const transitErrors: Record<string, TransitRowErrors> = {};
  for (const row of form.transitStops) {
    const type = errors[transitErrorKey(row.id, 'type')];
    const station = errors[transitErrorKey(row.id, 'station')];
    if (type || station) transitErrors[row.id] = { type, station };
  }

  return (
    <>
      <div className={field} data-error-field="place">
        {form.place ? (
          <div className={placeCard}>
            <div>
              <p className={placeName}>{form.place.label}</p>
              <p className={placeAddress}>{form.place.address}</p>
            </div>
            <button type="button" className={linkButton} onClick={onResetPlace}>
              重新搜尋
            </button>
          </div>
        ) : (
          <>
            <PlaceAutocomplete
              api={placeApi}
              inputId={PLACE_INPUT_ID}
              invalid={!!errors.place}
              describedBy={`venue-submit-place-hint${errors.place ? ` ${errorId('place')}` : ''}`}
              onPlaceSelect={(place) => {
                const isStore = place.types.includes('establishment');
                update(
                  (prev) => ({
                    ...prev,
                    place: {
                      placeId: place.place_id,
                      label: place.name || place.address,
                      address: place.address,
                      lat: place.coordinates.lat,
                      lng: place.coordinates.lng,
                    },
                    // Addresses keep whatever name the store already typed
                    name: isStore ? place.name : prev.name,
                  }),
                  isStore ? ['place', 'name'] : ['place']
                );
              }}
            />
            <p id="venue-submit-place-hint" className={hint}>
              請先搜尋店名，若找不到再搜尋地址。
            </p>
            <FieldError id={errorId('place')} message={errors.place} />
          </>
        )}
      </div>

      {form.place && (
        <div className={field} data-error-field="name">
          <label htmlFor={NAME_INPUT_ID} className={questionLabel}>
            場地名稱
          </label>
          <input
            id={NAME_INPUT_ID}
            type="text"
            className={input}
            value={form.name}
            maxLength={100}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? errorId('name') : undefined}
            onChange={(e) => update((prev) => ({ ...prev, name: e.target.value }), ['name'])}
          />
          <FieldError id={errorId('name')} message={errors.name} />
        </div>
      )}

      <div className={field} data-error-field="region">
        <span className={questionLabel}>地區</span>
        <FormDropdown
          label="地區"
          value={form.region}
          options={REGION_OPTIONS}
          invalid={!!errors.region}
          describedBy={errors.region ? errorId('region') : undefined}
          onChange={(region) => update((prev) => ({ ...prev, region }), ['region'])}
        />
        <FieldError id={errorId('region')} message={errors.region} />
      </div>

      <TransitStopsField
        idPrefix="venue-submit-transit"
        legend={
          <>
            要怎麼前往呢？<span className={optionalMark}>（選填）</span>
          </>
        }
        hint="可以填寫場地附近的捷運站、輕軌、火車站、高鐵站、公車站。"
        rows={form.transitStops}
        errors={transitErrors}
        onChange={(rows, edited) =>
          update(
            (prev) => ({ ...prev, transitStops: rows }),
            edited.part === 'other' ? [] : [transitErrorKey(edited.rowId, edited.part)]
          )
        }
      />

      <div className={field} data-error-field="capacityRange">
        <span className={questionLabel}>場地大約可以容納多少人？</span>
        <FormDropdown<CapacityRange>
          label="場地大約可以容納多少人？"
          value={form.capacityRange}
          options={CAPACITY_OPTIONS}
          invalid={!!errors.capacityRange}
          describedBy={errors.capacityRange ? errorId('capacityRange') : undefined}
          onChange={(capacityRange) =>
            update((prev) => ({ ...prev, capacityRange }), ['capacityRange'])
          }
        />
        <FieldError id={errorId('capacityRange')} message={errors.capacityRange} />
      </div>
    </>
  );
}
