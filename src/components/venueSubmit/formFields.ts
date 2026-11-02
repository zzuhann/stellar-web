import type { VenueSubmitFormValues } from './venueSubmitModel';

// Wiring shared by the step components

// Applies an edit and clears the inline errors of the fields it touched (venue-tags §D 驗證)
export type FormUpdater = (
  updater: (prev: VenueSubmitFormValues) => VenueSubmitFormValues,
  clearErrors: string[]
) => void;

export const errorId = (key: string) => `venue-submit-error-${key.replace(/[^\w-]/g, '-')}`;

// aria-describedby from optional ids
export const describedBy = (...ids: (string | false | undefined | null)[]) =>
  ids.filter(Boolean).join(' ') || undefined;
