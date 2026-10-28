// Browser history bookkeeping for the 3-step form (venue-tags design-frontend §D「處理上一頁紀錄」).
// Each pushed step records its depth (entries since entering the form) in history.state,
// so leaving or finishing can go(-depth) back to the entry instead of stacking blank steps.

export const DEPTH_KEY = 'venueSubmitDepth';

export type HistoryLike = Pick<History, 'state' | 'go' | 'pushState' | 'replaceState'>;

export function readStateDepth(state: unknown): number | null {
  if (!state || typeof state !== 'object') return null;
  const depth = (state as Record<string, unknown>)[DEPTH_KEY];
  return typeof depth === 'number' && Number.isInteger(depth) && depth >= 0 ? depth : null;
}

// Spread keeps Next.js router internals stored in history.state
const withDepth = (state: unknown, depth: number) => ({
  ...(state && typeof state === 'object' ? state : {}),
  [DEPTH_KEY]: depth,
});

// The router may drop custom state on reload; refill it from the draft rather than assuming 0
export function restoreDepth(history: HistoryLike, draftDepth: number | null): number {
  const stateDepth = readStateDepth(history.state);
  if (stateDepth !== null) return stateDepth;
  const depth = draftDepth ?? 0;
  history.replaceState(withDepth(history.state, depth), '', null);
  return depth;
}

export function pushStep(history: HistoryLike, url: string): number {
  const depth = (readStateDepth(history.state) ?? 0) + 1;
  history.pushState(withDepth(history.state, depth), '', url);
  return depth;
}

export function replaceUrl(history: HistoryLike, url: string, depth?: number): void {
  const state = depth === undefined ? history.state : withDepth(history.state, depth);
  history.replaceState(state, '', url);
}

// Back to the form's entry, then rewrite its URL. With depth 0 / unknown it is a plain replace.
// Returns the callback to run once popstate lands, or null when it already finished.
export function returnToEntry(
  history: HistoryLike,
  url: string,
  onLanded: () => void
): (() => void) | null {
  const land = () => {
    history.replaceState(withDepth(history.state, 0), '', url);
    onLanded();
  };
  const depth = readStateDepth(history.state) ?? 0;
  if (depth > 0) {
    history.go(-depth);
    return land;
  }
  land();
  return null;
}

// Submit-time validation sends the user back to an earlier step without pushing,
// so the back button from step 1 still leaves the form
export function jumpBackToStep(
  history: HistoryLike,
  fromStep: number,
  toStep: number,
  url: string
): 'go' | 'replace' {
  const diff = fromStep - toStep;
  const depth = readStateDepth(history.state);
  if (depth !== null && depth >= diff) {
    history.go(-diff);
    return 'go';
  }
  history.replaceState(history.state, '', url);
  return 'replace';
}

export function stepUrl(location: Pick<Location, 'pathname' | 'search'>, step: number | null) {
  const params = new URLSearchParams(location.search);
  if (step === null) params.delete('step');
  else params.set('step', String(step));
  const query = params.toString();
  return query ? `${location.pathname}?${query}` : location.pathname;
}
